// Server-side environment normalisation. Called at the top of src/server.ts,
// before anything reads process.env.
//
// The deployment sets one Supabase URL and one publishable key, under the
// names Supabase's own dashboard uses:
//
//   VITE_SUPABASE_URL
//   VITE_SUPABASE_ANON_KEY
//   SUPABASE_SERVICE_ROLE_KEY
//
// The generated clients under src/integrations/supabase/ predate that and read
// SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY instead. Rather than edit files
// marked "do not edit directly" — a Supabase type regen would revert them —
// the aliases are filled in here, once, at startup.
//
// This is deliberately an exported function rather than a side effect at module
// scope: package.json sets `"sideEffects": false`, so a bare
// `import "./env.server"` is tree-shaken out of the server bundle entirely and
// the aliases silently never get set. A call from a reachable entry survives.

// Covers the names Vercel's Supabase integration injects (SUPABASE_ANON_KEY,
// SUPABASE_SECRET_KEY, NEXT_PUBLIC_*) as well as the ones set by hand, so
// connecting the integration is enough on its own.
// Keep in step with the CLIENT_ALIASES list in vite.config.ts.
const ALIASES: Array<[canonical: string, sources: string[]]> = [
  [
    "SUPABASE_URL",
    ["VITE_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_NEXT_PUBLIC_SUPABASE_URL"],
  ],
  [
    "SUPABASE_PUBLISHABLE_KEY",
    [
      "VITE_SUPABASE_ANON_KEY",
      "SUPABASE_ANON_KEY",
      "NEXT_PUBLIC_SUPABASE_ANON_KEY",
      "VITE_SUPABASE_PUBLISHABLE_KEY",
    ],
  ],
  [
    "SUPABASE_ANON_KEY",
    ["VITE_SUPABASE_ANON_KEY", "NEXT_PUBLIC_SUPABASE_ANON_KEY", "SUPABASE_PUBLISHABLE_KEY"],
  ],
  ["SUPABASE_SERVICE_ROLE_KEY", ["SUPABASE_SECRET_KEY"]],
];

/** Fills in blank Supabase env aliases. An explicitly-set value always wins. */
export function normaliseSupabaseEnv(): void {
  for (const [canonical, sources] of ALIASES) {
    if (process.env[canonical]) continue;
    for (const source of sources) {
      const value = process.env[source];
      if (value) {
        process.env[canonical] = value;
        break;
      }
    }
  }
}
