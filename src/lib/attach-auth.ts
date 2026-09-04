import { createMiddleware } from "@tanstack/react-start";

import { supabase } from "./supabase";

// Registered as a global `functionMiddleware` in src/start.ts. Without it the
// browser never attaches the bearer token to server-function calls, and
// anything that checks the caller's identity sees an anonymous request.
export const attachSupabaseAuth = createMiddleware({ type: "function" }).client(
  async ({ next }) => {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    return next({ headers: token ? { Authorization: `Bearer ${token}` } : {} });
  },
);
