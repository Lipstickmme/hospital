// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// Only VITE_-prefixed variables are inlined into the browser bundle, and only
// at build time — so unlike the server side (src/lib/env.server.ts) this cannot
// be fixed at runtime. Setting the aliases on process.env here, before the
// wrapper calls Vite's loadEnv (which reads process.env for VITE_ keys), gets
// the values into the client bundle without editing a generated file.
//
// The source lists are deliberately explicit rather than a prefix match: only
// the project URL and the anon key are safe to publish. A service-role key,
// Postgres password or JWT secret must never end up behind a VITE_ name, since
// that would ship it to every visitor.
//
// Covers the names Vercel's Supabase integration injects as well as the ones
// set by hand, so connecting the integration is enough on its own.
// Keep in step with src/lib/env.server.ts.
const CLIENT_ALIASES: Array<[target: string, sources: string[]]> = [
  [
    "VITE_SUPABASE_URL",
    ["SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_NEXT_PUBLIC_SUPABASE_URL"],
  ],
  [
    "VITE_SUPABASE_PUBLISHABLE_KEY",
    [
      "VITE_SUPABASE_ANON_KEY",
      "SUPABASE_ANON_KEY",
      "NEXT_PUBLIC_SUPABASE_ANON_KEY",
      "SUPABASE_NEXT_PUBLIC_SUPABASE_ANON_KEY",
      "SUPABASE_PUBLISHABLE_KEY",
    ],
  ],
];

for (const [target, sources] of CLIENT_ALIASES) {
  if (process.env[target]) continue;
  for (const source of sources) {
    const value = process.env[source];
    if (value) {
      process.env[target] = value;
      break;
    }
  }
}

// A client bundle with no Supabase config compiles fine and then fails in the
// browser on every page that talks to Supabase, which is a confusing way to
// find out. Say so while the build log is still in front of you.
for (const [target, sources] of CLIENT_ALIASES) {
  if (!process.env[target]) {
    console.warn(
      `[env] ${target} is not set and none of its aliases were found ` +
        `(${sources.join(", ")}). The browser bundle will have no Supabase ` +
        `config, so the chat widget and admin dashboard will not work. ` +
        `Set ${target}, or connect the Supabase integration in Vercel.`,
    );
  }
}

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error
    // wrapper, which also dispatches /api/* before handing off to SSR).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  // Deploy target. The vercel preset writes .vercel/output/ (Build Output API v3),
  // which Vercel picks up directly — no vercel.json routing needed.
  nitro: {
    preset: "vercel",
  },
});
