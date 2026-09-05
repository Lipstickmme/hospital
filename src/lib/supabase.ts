import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { getPublicConfig } from "./public-config";

export { isSupabaseConfigured } from "./public-config";

let client: SupabaseClient | undefined;

// Constructed on first use, not at module scope. Two reasons: createClient
// throws on an empty URL, and this module is in the SSR bundle, so building it
// eagerly would fail to render every page rather than just losing the chat.
// Deferring also lets the root route supply the config first — it arrives from
// the server per request, not from the build.
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop, receiver) {
    if (!client) {
      const { supabaseUrl, supabaseAnonKey } = getPublicConfig();
      client = createClient(supabaseUrl, supabaseAnonKey, {
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
