import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Browser Supabase client. The anon key is public by design — row level
// security is what protects the data.
//
// Only VITE_-prefixed variables are inlined into the bundle, and only at build
// time. vite.config.ts fills these in from whatever name the deployment uses
// (Vercel's Supabase integration sets SUPABASE_URL / SUPABASE_ANON_KEY), so
// this file only has to read the canonical pair.

const url = import.meta.env["VITE_SUPABASE_URL"] ?? "";
const anonKey = import.meta.env["VITE_SUPABASE_PUBLISHABLE_KEY"] ?? "";

/**
 * False when the build inlined no Supabase config. Callers check this rather
 * than throwing, so a misconfigured deploy degrades instead of white-screening.
 */
export const isSupabaseConfigured = Boolean(url && anonKey);

let client: SupabaseClient | undefined;

// Constructed on first use, not at module scope: createClient throws on an
// empty URL, and this module is pulled into the SSR bundle, so an unconfigured
// build would fail to render any page at all rather than just losing the chat.
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop, receiver) {
    if (!client) {
      client = createClient(url, anonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          storageKey: "lifewell-auth",
        },
      });
    }
    return Reflect.get(client, prop, receiver);
  },
});
