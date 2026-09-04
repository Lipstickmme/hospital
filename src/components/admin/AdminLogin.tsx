import { useState, type FormEvent } from "react";
import { Link } from "@tanstack/react-router";

import { supabase } from "@/lib/supabase";

/** Staff sign-in. Accounts are created in the Supabase dashboard, not here. */
export function AdminLogin({ notice }: { notice?: string }) {
  const [state, setState] = useState<"idle" | "sending">("idle");
  const [error, setError] = useState<string | null>(null);

  const signIn = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setState("sending");
    setError(null);

    // A staff login and an anonymous chat session cannot share a browser
    // profile, so clear whatever is there before signing in.
    await supabase.auth.signOut();

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: String(form.get("email") ?? ""),
      password: String(form.get("password") ?? ""),
    });

    if (signInError) {
      setError(signInError.message);
      setState("idle");
    }
  };

  return (
    <div className="grid min-h-screen place-items-center bg-secondary/40 px-6">
      <div className="glass w-full max-w-sm rounded-4xl p-8">
        <h1 className="text-2xl font-semibold">Staff sign in</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {notice ??
            "Enquiries, live chat, email and appointment bookings for Lifewell Medical Center Athens."}
        </p>

        <form onSubmit={signIn} className="mt-6 space-y-4">
          <label className="block text-sm">
            <span className="mb-1.5 block font-medium">Email</span>
            <input
              type="email"
              name="email"
              required
              autoComplete="username"
              className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1.5 block font-medium">Password</span>
            <input
              type="password"
              name="password"
              required
              autoComplete="current-password"
              className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
            />
          </label>

          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={state === "sending"}
            className="btn-glass w-full justify-center py-3 disabled:opacity-70"
          >
            {state === "sending" ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm">
          <Link to="/" className="text-muted-foreground hover:underline">
            Back to site
          </Link>
        </div>
      </div>
    </div>
  );
}
