-- Paste into the Supabase SQL editor after running the migrations.
-- Every row should read OK. Safe to run any number of times.

select 'core tables (0001)' as check, case
         when count(*) = 5 then 'OK'
         else 'MISSING, expected 5, found ' || count(*)
       end as result
from information_schema.tables
where table_schema = 'public'
  and table_name in
      ('admins', 'enquiries', 'bookings', 'chat_sessions', 'chat_messages')

union all
select 'email tables (0002)', case
         when count(*) = 2 then 'OK'
         else 'MISSING, expected 2, found ' || count(*) ||
              '. Optional — skip if you are not receiving mail.'
       end
from information_schema.tables
where table_schema = 'public'
  and table_name in ('email_threads', 'email_messages')

union all
select 'row level security', case
         when bool_and(relrowsecurity) then 'OK'
         else 'NOT ENABLED on at least one table'
       end
from pg_class
where relnamespace = 'public'::regnamespace
  and relname in
      ('admins', 'enquiries', 'bookings', 'chat_sessions', 'chat_messages',
       'email_threads', 'email_messages')

union all
select 'is_admin() exists', case
         when count(*) = 1 then 'OK' else 'MISSING' end
from pg_proc
where pronamespace = 'public'::regnamespace and proname = 'is_admin'

union all
select 'realtime publication', case
         when count(*) >= 3 then 'OK'
         else 'only ' || count(*) || ' of chat_sessions/chat_messages/bookings published'
       end
from pg_publication_tables
where pubname = 'supabase_realtime'
  and tablename in ('chat_sessions', 'chat_messages', 'bookings')

union all
select 'anonymous sign-ins', case
         when count(*) > 0 then 'OK, ' || count(*) || ' anonymous user(s) seen'
         else 'NOT CONFIRMED — no anonymous user yet. Enable it under '
              'Authentication → Providers → Anonymous, then open the site '
              'and send a chat message.'
       end
from auth.users
where is_anonymous

union all
select 'admins populated', case
         when count(*) > 0 then 'OK, ' || count(*) || ' admin(s)'
         else 'EMPTY — run supabase/grant-admin.sql'
       end
from public.admins;
