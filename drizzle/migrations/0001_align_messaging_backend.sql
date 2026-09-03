-- Align the messaging backend with the construction-repo shape:
--   * an `admins` view over user_roles + a security-definer `is_admin()` fn
--   * a shared `item_status` enum ('new', 'in_progress', 'closed')
--   * a form inbox table (`enquiries`) written only via the service role
--   * anon-owned live chat tables (`chat_sessions`, `chat_messages`) with RLS
--     that scopes rows to the visitor's `auth.uid()`
--   * an admin-only email inbox (`email_threads`, `email_messages`) fed by
--     the Resend inbound webhook
--
-- The 0000 migration's `conversations` and `conversation_messages` tables
-- are left in place so nothing already stored is lost; the new code writes
-- against the new tables only.
--
-- Safe to re-run.

-- ---------------------------------------------------------------------------
-- Admin identity: is_admin() bridges to the existing user_roles table so a
-- single 'admin' or 'staff' role still gates everything.
-- ---------------------------------------------------------------------------

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
      from public.user_roles
     where user_id = auth.uid()
       and role in ('admin', 'staff')
  );
$$;

-- A parity view so code copied from the construction repo compiles unchanged.
create or replace view public.admins as
  select user_id, created_at
    from public.user_roles
   where role in ('admin', 'staff');

grant select on public.admins to authenticated;

-- ---------------------------------------------------------------------------
-- Shared triage status
-- ---------------------------------------------------------------------------

do $$
begin
  if not exists (select 1 from pg_type where typname = 'item_status') then
    create type public.item_status as enum ('new', 'in_progress', 'closed');
  end if;
end
$$;

-- ---------------------------------------------------------------------------
-- Contact enquiries (form inbox, service-role only writes)
-- ---------------------------------------------------------------------------

create table if not exists public.enquiries (
  id         uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name       text not null,
  company    text,
  email      text not null,
  phone      text,
  subject    text,
  scope      text not null,
  status     public.item_status not null default 'new',
  notes      text
);

create index if not exists enquiries_created_at_idx
  on public.enquiries (created_at desc);

alter table public.enquiries enable row level security;

drop policy if exists "admins read enquiries" on public.enquiries;
create policy "admins read enquiries"
  on public.enquiries for select to authenticated using (public.is_admin());

drop policy if exists "admins update enquiries" on public.enquiries;
create policy "admins update enquiries"
  on public.enquiries for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- Live chat: anon auth + RLS keeps each visitor to their own thread
-- ---------------------------------------------------------------------------

create table if not exists public.chat_sessions (
  id              uuid primary key default gen_random_uuid(),
  created_at      timestamptz not null default now(),
  visitor_id      uuid not null default auth.uid(),
  visitor_name    text,
  visitor_email   text,
  last_message_at timestamptz not null default now(),
  status          public.item_status not null default 'new'
);

create index if not exists chat_sessions_last_message_idx
  on public.chat_sessions (last_message_at desc);

create table if not exists public.chat_messages (
  id         uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  session_id uuid not null references public.chat_sessions (id) on delete cascade,
  sender     text not null check (sender in ('visitor', 'agent')),
  body       text not null check (length(body) between 1 and 4000)
);

create index if not exists chat_messages_session_idx
  on public.chat_messages (session_id, created_at);

alter table public.chat_sessions enable row level security;
alter table public.chat_messages enable row level security;

drop policy if exists "visitor creates own session" on public.chat_sessions;
create policy "visitor creates own session"
  on public.chat_sessions for insert to authenticated
  with check (visitor_id = auth.uid());

drop policy if exists "visitor or admin reads session" on public.chat_sessions;
create policy "visitor or admin reads session"
  on public.chat_sessions for select to authenticated
  using (visitor_id = auth.uid() or public.is_admin());

drop policy if exists "visitor names own session" on public.chat_sessions;
create policy "visitor names own session"
  on public.chat_sessions for update to authenticated
  using (visitor_id = auth.uid()) with check (visitor_id = auth.uid());

drop policy if exists "admin triages session" on public.chat_sessions;
create policy "admin triages session"
  on public.chat_sessions for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "visitor posts to own session" on public.chat_messages;
create policy "visitor posts to own session"
  on public.chat_messages for insert to authenticated
  with check (
    sender = 'visitor'
    and exists (
      select 1 from public.chat_sessions s
      where s.id = session_id and s.visitor_id = auth.uid()
    )
  );

drop policy if exists "admin posts as agent" on public.chat_messages;
create policy "admin posts as agent"
  on public.chat_messages for insert to authenticated
  with check (sender = 'agent' and public.is_admin());

drop policy if exists "visitor or admin reads messages" on public.chat_messages;
create policy "visitor or admin reads messages"
  on public.chat_messages for select to authenticated
  using (
    public.is_admin()
    or exists (
      select 1 from public.chat_sessions s
      where s.id = session_id and s.visitor_id = auth.uid()
    )
  );

create or replace function public.touch_chat_session()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.chat_sessions
     set last_message_at = new.created_at,
         -- A visitor speaking puts the session back on the waiting pile even
         -- if it had been answered or closed. An agent reply leaves the
         -- status alone; the dashboard sets it to in_progress itself.
         status = case when new.sender = 'visitor' then 'new' else status end
   where id = new.session_id;
  return new;
end;
$$;

drop trigger if exists chat_messages_touch_session on public.chat_messages;
create trigger chat_messages_touch_session
  after insert on public.chat_messages
  for each row execute function public.touch_chat_session();

-- ---------------------------------------------------------------------------
-- Email inbox (Resend inbound webhook + admin replies)
-- ---------------------------------------------------------------------------

create table if not exists public.email_threads (
  id                uuid primary key default gen_random_uuid(),
  created_at        timestamptz not null default now(),
  last_message_at   timestamptz not null default now(),
  subject           text not null default '(no subject)',
  participant_email text not null,
  participant_name  text,
  status            public.item_status not null default 'new'
);

create index if not exists email_threads_activity_idx
  on public.email_threads (last_message_at desc);

create index if not exists email_threads_match_idx
  on public.email_threads (lower(participant_email), lower(subject));

create table if not exists public.email_messages (
  id              uuid primary key default gen_random_uuid(),
  created_at      timestamptz not null default now(),
  thread_id       uuid not null references public.email_threads (id) on delete cascade,
  direction       text not null check (direction in ('inbound', 'outbound')),
  from_email      text not null,
  from_name       text,
  to_email        text not null,
  subject         text,
  body_text       text,
  body_html       text,
  message_id      text,
  in_reply_to     text,
  has_attachments boolean not null default false
);

create index if not exists email_messages_thread_idx
  on public.email_messages (thread_id, created_at);

create unique index if not exists email_messages_message_id_key
  on public.email_messages (message_id) where message_id is not null;

alter table public.email_threads enable row level security;
alter table public.email_messages enable row level security;

drop policy if exists "admins read email threads" on public.email_threads;
create policy "admins read email threads"
  on public.email_threads for select to authenticated using (public.is_admin());

drop policy if exists "admins update email threads" on public.email_threads;
create policy "admins update email threads"
  on public.email_threads for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admins read email messages" on public.email_messages;
create policy "admins read email messages"
  on public.email_messages for select to authenticated using (public.is_admin());

create or replace function public.touch_email_thread()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.email_threads
     set last_message_at = new.created_at,
         status = case when new.direction = 'inbound' then 'new' else status end
   where id = new.thread_id;
  return new;
end;
$$;

drop trigger if exists email_messages_touch_thread on public.email_messages;
create trigger email_messages_touch_thread
  after insert on public.email_messages
  for each row execute function public.touch_email_thread();

-- ---------------------------------------------------------------------------
-- Realtime: RLS still applies, so a visitor only sees rows from their own
-- session; admins see everything.
-- ---------------------------------------------------------------------------

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and tablename = 'chat_messages'
  ) then
    alter publication supabase_realtime add table public.chat_messages;
  end if;

  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and tablename = 'chat_sessions'
  ) then
    alter publication supabase_realtime add table public.chat_sessions;
  end if;

  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and tablename = 'email_messages'
  ) then
    alter publication supabase_realtime add table public.email_messages;
  end if;

  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and tablename = 'email_threads'
  ) then
    alter publication supabase_realtime add table public.email_threads;
  end if;
end
$$;
