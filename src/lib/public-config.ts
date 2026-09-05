import { createServerFn } from "@tanstack/react-start";

// The browser needs the Supabase project URL and anon key. Both are public —
// row level security is what protects the data, not their secrecy.
//
// They used to reach the browser only by being inlined at build time, which
// meant a VITE_-prefixed variable. That turned out to be a bad dependency:
// Vercel refuses to mark a VITE_ variable "Sensitive" (it knows the prefix is
// published), the Supabase integration sets its own un-prefixed names, and any
// change needed a rebuild to take effect — a build that ran before the
// variables existed produced a browser bundle that could never connect, with
// no signal until someone opened the chat.
//
// So they are read server-side per request and handed to the browser through
// the root route's loader instead. Nothing needs a VITE_ prefix, whatever the
// deployment calls them, and setting a variable takes effect on the next
// request rather than the next build.

export type PublicConfig = { supabaseUrl: string; supabaseAnonKey: string };

/** Accepted spellings, widest first. Keep in step with _shared.server.ts. */
const URL_NAMES = ["SUPABASE_URL", "VITE_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_URL"];
const ANON_NAMES = [
  "SUPABASE_ANON_KEY",
  "VITE_SUPABASE_ANON_KEY",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_PUBLISHABLE_KEY",
  "VITE_SUPABASE_PUBLISHABLE_KEY",
];

export const loadPublicConfig = createServerFn().handler(async (): Promise<PublicConfig> => {
  const pick = (names: string[]) => {
    for (const name of names) {
      const value = process.env[name];
      if (value) return value;
    }
    return "";
  };
  return { supabaseUrl: pick(URL_NAMES), supabaseAnonKey: pick(ANON_NAMES) };
});

// Module-level so the Supabase client — a plain singleton, not a React hook —
// can reach it. The root route sets this during render, before anything that
// talks to Supabase mounts.
let current: PublicConfig | undefined;

export function setPublicConfig(config: PublicConfig): void {
  current = config;
}

export function getPublicConfig(): PublicConfig {
  if (current) return current;
  // Build-time values, when a VITE_ pair happens to be set. Covers local dev
  // and anything reaching Supabase before the root loader has resolved.
  return {
    supabaseUrl: import.meta.env["VITE_SUPABASE_URL"] ?? "",
    supabaseAnonKey: import.meta.env["VITE_SUPABASE_PUBLISHABLE_KEY"] ?? "",
  };
}

export function isSupabaseConfigured(): boolean {
  const { supabaseUrl, supabaseAnonKey } = getPublicConfig();
  return Boolean(supabaseUrl && supabaseAnonKey);
}
