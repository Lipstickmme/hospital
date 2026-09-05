# Rebuilding this stack on another site

Everything here is generic apart from the copy and the images. The messaging,
admin dashboard and email plumbing transfer to any marketing site unchanged.

## File structure

```
src/
  components/
    admin/AdminLogin.tsx        Staff sign-in form
    chat/ChatWidget.tsx         Floating visitor chat, public pages only
    site/                       Marketing sections (site-specific)
    ui/sonner.tsx               Toaster
  hooks/
    useVisitorChat.ts           Anon sign-in, realtime, localStorage session
    useAdminAuth.ts             Session + admins-table membership
    useFormSubmit.ts            Form → submitForm server fn
  lib/
    public-config.ts            Serves the browser its Supabase config
    supabase.ts                 Browser client (lazy singleton)
    attach-auth.ts              Puts the bearer token on server-fn calls
    api/
      _shared.server.ts         Service-role client, Resend, requireAdmin,
                                webhook signature verification
      submit-form.ts            enquiry | booking | chat → DB + notification
      send-email.ts             Admin-only reply, records on the thread
      inbound-email.server.ts   Resend webhook → email_threads
      health.server.ts          Config diagnostic
  routes/
    __root.tsx                  Shell, Toaster, ChatWidget, config loader
    index.tsx  contact.tsx  auth.tsx
    admin.tsx                   Auth gate + tabs
    admin.index.tsx             Enquiries
    admin.chat.tsx              Live chat
    admin.email.tsx             Email threads
    admin.bookings.tsx          Bookings
  server.ts                     SSR entry; dispatches /api/* before SSR
supabase/
  migrations/0001_init.sql      admins, enquiries, bookings, chat_*
  migrations/0002_email.sql     email_threads, email_messages
  grant-admin.sql  verify.sql
```

## The five decisions that matter

1. **Visitors authenticate anonymously.** `supabase.auth.signInAnonymously()`
   gives each visitor a real `auth.uid()`, so RLS grants them their own chat
   and nothing else. No token scheme of your own, no service-role key in the
   browser. Requires enabling Anonymous under Authentication → Providers.

2. **Forms never touch the database from the browser.** `enquiries` and
   `bookings` have no anon policy at all; writes go through a server function
   holding the service-role key. A leaked anon key cannot stuff the inbox.

3. **Chat rows *are* written from the browser**, under the visitor's own
   session, because RLS can express "your own session" precisely. The server
   function is only used to send the staff notification.

4. **The browser's Supabase config is served at runtime**, not inlined at
   build time. Otherwise it needs a `VITE_` prefix — which Vercel refuses to
   mark Sensitive — and any change needs a rebuild.

5. **Realtime is `postgres_changes` under the same RLS.** A visitor's
   subscription only ever delivers rows from their own session.

## Prompt

> Build a marketing site with a visitor chat widget, a contact form, and a
> staff dashboard, on TanStack Start (SSR) + Supabase + Vercel.
>
> **Schema** (one guarded, re-runnable SQL migration):
> - `admins(user_id → auth.users, email)` plus a `SECURITY DEFINER is_admin()`
>   so policies can call it without recursing on `admins` itself.
> - `item_status` enum: `new | in_progress | closed`.
> - `enquiries` — contact submissions. RLS: admins select/update only. No anon
>   policy; inserts arrive via the service role.
> - `chat_sessions(visitor_id uuid default auth.uid(), visitor_name,
>   visitor_email, last_message_at, status)` and
>   `chat_messages(session_id, sender check in ('visitor','agent'), body)`.
>   RLS: a visitor inserts and reads only rows whose session has
>   `visitor_id = auth.uid()`; admins see everything and post as `agent`.
> - An `after insert` trigger on `chat_messages` that bumps
>   `last_message_at` and sets status back to `new` when the sender is the
>   visitor, so a follow-up cannot be missed.
> - Add `chat_sessions` and `chat_messages` to the `supabase_realtime`
>   publication. RLS still applies, so a visitor only receives their own rows.
>
> **Backend** — a shared server-only module with: a service-role Supabase
> client; `sendEmail` via Resend that returns null instead of throwing when no
> API key is set; `requireAdmin(request)` that validates the caller's bearer
> token with Supabase Auth and then checks `admins` with the service role; and
> Svix HMAC verification for the inbound-mail webhook, computed over the raw
> request bytes.
>
> Then one server function taking `{kind: 'enquiry'|'booking'|'chat', payload}`
> — writes with the service role, honeypot field, emails a notification; the
> `chat` kind only notifies, since the widget writes its own rows. And an
> admin-only reply function that sends through Resend and records the message
> on the thread.
>
> **Frontend** — `useVisitorChat` (anonymous sign-in, session id in
> localStorage, realtime subscription filtered to that session, optimistic
> insert deduped by id); `useAdminAuth`; a floating chat widget on public
> pages; an auth-gated `/admin` with tabs for enquiries, chat, email and
> bookings, each list-and-detail with realtime.
>
> **Config** — serve the Supabase URL and anon key to the browser from the
> server per request (root-route loader), not via `VITE_` inlining, so no
> rebuild is needed when they change. Accept `SUPABASE_URL`,
> `NEXT_PUBLIC_SUPABASE_URL` and `VITE_SUPABASE_URL` as equivalent.
>
> **Rules.** Never put a service-role key, database password or JWT secret
> behind a public prefix. Never let a missing configuration fail silently —
> render a message saying what is unset and where. Add a `/api/health` that
> reports which variables the running server can actually see.

## Traps this hit, worth pre-empting

- A bare `import "./x"` for its side effect is **tree-shaken away** when
  `package.json` has `"sideEffects": false`. Export a function and call it.
- A global function middleware runs for *every* server function — including
  the one that fetches config. Guard it, or it constructs a client with an
  empty URL and 500s the whole app.
- Vercel deploys the repository's **default branch**. Pushing to `main` when
  the default is something else deploys nothing.
- `FORWARD_TO` on your own domain loops mail back into the inbound webhook
  until the sending quota is gone.
- A lockfile from a hosted builder can pin a **private registry** the deploy
  cannot authenticate to.
