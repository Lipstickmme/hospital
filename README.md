# Modern Medical Hub

Marketing site and staff dashboard for Lifewell Medical Center Athens.
TanStack Start (SSR) + React 19 + Tailwind v4, with Supabase for auth, data and
realtime, and Resend for mail. Deploys to Vercel.

## Development

```sh
bun install
cp .env.example .env   # then fill it in
bun run dev
```

| Script | Does |
| --- | --- |
| `bun run dev` | Vite dev server with HMR |
| `bun run build` | Production build to `.vercel/output/` |
| `bun run lint` | ESLint |
| `bun run format` | Prettier |

## Deploying to Vercel

The build targets Vercel through nitro's `vercel` preset (set in
`vite.config.ts`), which writes `.vercel/output/` using the Build Output API.
Vercel picks that up directly, so there is no routing config in `vercel.json` —
static assets are served from the filesystem and everything else, `/api/*`
included, goes to the server function.

1. Import the repository in Vercel. Leave the framework preset as **Other**
   (`vercel.json` already sets `"framework": null`); the build command and
   package manager are detected from `package.json` and `bun.lock`.
2. **Supabase variables.** Connecting Vercel's Supabase integration is enough
   on its own — the names it injects (`SUPABASE_URL`, `SUPABASE_ANON_KEY`,
   `SUPABASE_SECRET_KEY`, `NEXT_PUBLIC_*`) are all recognised. Nothing needs
   adding by hand, and nothing it manages should be deleted.

   Setting them yourself instead works too; any one name per row is enough:

   | Purpose | Accepted names | Notes |
   | --- | --- | --- |
   | Project URL | `SUPABASE_URL`, `VITE_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_URL` | Public |
   | Anon key | `SUPABASE_ANON_KEY`, `VITE_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public |
   | Service role | `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_SECRET_KEY` | **Secret** |

3. **Mail variables**, all optional, added by hand:

   | Variable | Notes |
   | --- | --- |
   | `RESEND_API_KEY` | Without it, sends are skipped and logged |
   | `RESEND_WEBHOOK_SECRET` | Needed only to receive mail |
   | `FORM_TO` | Where form notifications land |
   | `FORM_FROM` | Domain must be verified in Resend |
   | `MAILBOX_ADDRESS` | Address staff reply as |
   | `FORWARD_TO` | Must be on **another** domain, or mail loops |

   Only the project URL and anon key are ever published to the browser. The
   aliasing lists in `vite.config.ts` are explicit rather than a prefix match,
   so a service-role key, Postgres password or JWT secret cannot end up behind
   a `VITE_` name. Never add a `VITE_` prefix to a secret yourself.

   Two naming layers are reconciled automatically: the generated clients under
   `src/integrations/supabase/` read `SUPABASE_URL` / `SUPABASE_PUBLISHABLE_KEY`,
   filled in at runtime by `src/lib/env.server.ts`, and the browser bundle needs
   `VITE_`-prefixed names, filled in at build time by `vite.config.ts`.

   **`VITE_*` is baked in at build time**, so adding or changing a Supabase
   variable does nothing until you redeploy. `/api/health` reports
   `browserBundleConfigured` for exactly this reason.
3. Deploy, then open `/api/health` — it reports exactly which variables the
   running function can see, so a misconfigured deploy is one request to
   diagnose rather than a silently failing form.

## Backend setup

Point the app at any Supabase project (the free tier is enough). Everything
below is done in the Supabase dashboard.

1. **Run the schema.** SQL Editor → paste and run
   `supabase/migrations/0001_init.sql`, then `0002_email.sql` if you want the
   inbound-mail inbox (skip it otherwise — nothing else depends on it). Both
   are guarded, so re-running either is safe.

2. **Enable anonymous sign-ins** — Authentication → Providers → Anonymous.
   The chat widget does not work without this. Visitors sign in anonymously so
   every row they write carries a real `auth.uid()`, and row level security
   grants them their own conversation and nothing else. No bearer-token scheme
   of our own, and no service-role key in the browser.

3. **Create your staff login** — Authentication → Users → Add user, ticking
   *Auto Confirm User*.

4. **Grant it admin.** Edit the one marked line in `supabase/grant-admin.sql`
   to your address and run the whole file. Repeat for each staff member.

5. **Check your work.** Run `supabase/verify.sql` — every row should read OK.
   Then sign in at `/admin`.

Mail is optional. Without `RESEND_API_KEY` the app still runs — sends are
skipped and logged, and the dashboard stays the source of truth for every
message. To receive mail as well, point Resend Inbound at
`https://your-domain/api/inbound-email` and set `RESEND_WEBHOOK_SECRET`;
unsigned posts are refused rather than trusted.

## Layout of the code

```
src/
  components/
    admin/    AdminLogin
    chat/     ChatWidget
    site/     SiteHeader, Hero, Sections
    ui/       shadcn components
  hooks/      useVisitorChat, useAdminAuth, useFormSubmit
  lib/api/    _shared.server, submit-form, send-email,
              inbound-email.server, health.server
  routes/     One file per route; __root.tsx is the shell
  server.ts   SSR entry — dispatches /api/* before handing off to SSR
```

This TanStack Start version has no file-based server routes, so the two plain
HTTP endpoints (`/api/inbound-email`, `/api/health`) are dispatched from
`src/server.ts`. Everything the browser calls goes through `createServerFn`
instead and never reaches that table.

### How data gets in

| Path | Written by | Guarded by |
| --- | --- | --- |
| Contact form → `enquiries` | `submitForm` server fn, service role | RLS: admins read only |
| Booking form → `bookings` | `submitForm` server fn, service role | RLS: admins read only |
| Chat → `chat_sessions`, `chat_messages` | the widget, as the anonymous visitor | RLS: `visitor_id = auth.uid()` |
| Inbound mail → `email_threads`, `email_messages` | `/api/inbound-email`, service role | Svix signature, then RLS |

The browser can never write to `enquiries` or `bookings` directly — those go
through a server function holding the service-role key, so a leaked
publishable key cannot be used to stuff the inbox.
