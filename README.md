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
2. Add every variable from `.env.example` under **Settings → Environment
   Variables**. `VITE_*` values are inlined into the browser bundle and are
   public by design; everything else is server-only. Never put a `VITE_`
   prefix on a secret.
3. Deploy, then open `/api/health` — it reports exactly which variables the
   running function can see, so a misconfigured deploy is one request to
   diagnose rather than a silently failing form.

## Backend setup

Point the app at any Supabase project (the free tier is enough).

1. Run the migrations in `drizzle/migrations/` in order, via the Supabase SQL
   editor or the CLI. They are guarded, so re-running one is safe.
2. Turn on **anonymous sign-ins** (Authentication → Providers → Anonymous).
   The chat widget needs it: visitors sign in anonymously so every row they
   write carries a real `auth.uid()`, and row level security grants them their
   own conversation and nothing else. No bearer-token scheme of our own, and
   no service-role key in the browser.
3. Grant yourself staff access by inserting your user id into `user_roles`
   with role `admin`, then sign in at `/admin`.

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
