import { createFileRoute } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";

import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/Sections";
import { useFormSubmit } from "@/hooks/useFormSubmit";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Us | Lifewell Medical Center Athens" },
      {
        name: "description",
        content:
          "Send a message to the Lifewell Medical Center Athens care team. We reply by email.",
      },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const { state, error, submit, reset } = useFormSubmit({ kind: "enquiry" });
  const sending = state === "sending";

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 pt-32 pb-16 sm:px-6">
        <header className="text-center">
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            Contact us
          </h1>
          <p className="mt-4 text-muted-foreground">
            Send us a message and our care team will reply by email — usually
            within a few hours during working hours.
          </p>
        </header>

        {state === "sent" ? (
          <div className="glass mt-10 rounded-4xl p-8 text-center">
            <h2 className="text-xl font-semibold">Thanks — we've got your message.</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              We just emailed you a confirmation. Prefer a live chat? Open the
              widget in the bottom-right corner.
            </p>
            <button type="button" onClick={reset} className="btn-glass mt-6 text-sm">
              Send another message
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="glass mt-10 space-y-5 rounded-4xl p-8">
            {/* Honeypot: real users never fill a field they cannot see. */}
            <input
              type="text"
              name="website"
              tabIndex={-1}
              autoComplete="off"
              className="hidden"
              aria-hidden="true"
            />

            <div className="grid gap-5 sm:grid-cols-2">
              <label className="block text-sm">
                <span className="mb-1.5 block font-medium">Full name</span>
                <input
                  required
                  name="name"
                  className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
                />
              </label>
              <label className="block text-sm">
                <span className="mb-1.5 block font-medium">Email</span>
                <input
                  required
                  type="email"
                  name="email"
                  className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
                />
              </label>
              <label className="block text-sm">
                <span className="mb-1.5 block font-medium">Phone (optional)</span>
                <input
                  name="phone"
                  className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
                />
              </label>
              <label className="block text-sm">
                <span className="mb-1.5 block font-medium">Subject</span>
                <input
                  name="subject"
                  className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
                />
              </label>
            </div>
            <label className="block text-sm">
              <span className="mb-1.5 block font-medium">Message</span>
              <textarea
                required
                name="scope"
                rows={6}
                className="w-full resize-none rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
              />
            </label>

            {error && (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            )}

            <button type="submit" disabled={sending} className="btn-glass w-full justify-center py-3">
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {sending ? "Sending…" : "Send message"}
            </button>
          </form>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
