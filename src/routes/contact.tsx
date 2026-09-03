import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, MessageSquare } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/Sections";
import { submitContactMessage } from "@/lib/public.functions";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Us | Lifewell Medical Center Athens" },
      {
        name: "description",
        content:
          "Send a message to the Lifewell Medical Center Athens care team. We reply by email and open a live chat thread you can follow.",
      },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const submit = useServerFn(submitContactMessage);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [confirmationToken, setConfirmationToken] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    try {
      const result = await submit({
        data: {
          name,
          email,
          phone: phone || undefined,
          subject,
          message,
        },
      });
      setConfirmationToken(result.token);
      toast.success("Message sent — we'll reply shortly.");
      setName("");
      setEmail("");
      setPhone("");
      setSubject("");
      setMessage("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 pt-32 pb-16 sm:px-6">
        <header className="text-center">
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Contact us</h1>
          <p className="mt-4 text-muted-foreground">
            Send us a message and our care team will reply by email — usually within a few hours during
            working hours. You can also follow the conversation online.
          </p>
        </header>

        {confirmationToken ? (
          <div className="glass mt-10 rounded-4xl p-8 text-center">
            <MessageSquare className="mx-auto h-10 w-10 text-primary" />
            <h2 className="mt-4 text-xl font-semibold">Thanks — we've got your message.</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              We just emailed you a confirmation. You can also open the live thread to see our reply as
              soon as it lands.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link
                to="/chat/$token"
                params={{ token: confirmationToken }}
                className="btn-glass text-sm"
              >
                Open live thread
              </Link>
              <button
                type="button"
                onClick={() => setConfirmationToken(null)}
                className="btn-glass-ghost text-sm"
              >
                Send another message
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="glass mt-10 space-y-5 rounded-4xl p-8">
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="block text-sm">
                <span className="mb-1.5 block font-medium">Full name</span>
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
                />
              </label>
              <label className="block text-sm">
                <span className="mb-1.5 block font-medium">Email</span>
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
                />
              </label>
              <label className="block text-sm">
                <span className="mb-1.5 block font-medium">Phone (optional)</span>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
                />
              </label>
              <label className="block text-sm">
                <span className="mb-1.5 block font-medium">Subject</span>
                <input
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
                />
              </label>
            </div>
            <label className="block text-sm">
              <span className="mb-1.5 block font-medium">Message</span>
              <textarea
                required
                rows={6}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full resize-none rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
              />
            </label>
            <button type="submit" disabled={busy} className="btn-glass w-full justify-center py-3">
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {busy ? "Sending…" : "Send message"}
            </button>
          </form>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
