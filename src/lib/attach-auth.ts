import { createMiddleware } from "@tanstack/react-start";

import { isSupabaseConfigured } from "./public-config";

// Registered as a global `functionMiddleware` in src/start.ts. Without it the
// browser never attaches the bearer token to server-function calls, and
// anything that checks the caller's identity sees an anonymous request.
export const attachSupabaseAuth = createMiddleware({ type: "function" }).client(
  async ({ next }) => {
    // Runs for every server function, including loadPublicConfig — which is
    // what supplies the Supabase config in the first place. Touching the client
    // here before that resolves would construct it with an empty URL and throw,
    // taking down the root loader and with it the whole page. There is no
    // session to attach until the config exists, so skip.
    if (!isSupabaseConfigured()) return next();

    const { supabase } = await import("./supabase");
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    return next({ headers: token ? { Authorization: `Bearer ${token}` } : {} });
  },
);
