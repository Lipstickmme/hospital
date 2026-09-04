// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// The deployment sets VITE_SUPABASE_ANON_KEY (the name Supabase's own dashboard
// uses). The generated browser client reads VITE_SUPABASE_PUBLISHABLE_KEY.
//
// import.meta.env is inlined at build time, so this cannot be fixed at runtime
// like the server side is in src/lib/env.server.ts. Setting the alias on
// process.env here — before the wrapper calls Vite's loadEnv, which reads
// process.env for VITE_-prefixed keys — gets the value into the client bundle
// without editing a generated file. Only fills a blank; an explicit value wins.
if (!process.env["VITE_SUPABASE_PUBLISHABLE_KEY"] && process.env["VITE_SUPABASE_ANON_KEY"]) {
  process.env["VITE_SUPABASE_PUBLISHABLE_KEY"] = process.env["VITE_SUPABASE_ANON_KEY"];
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
