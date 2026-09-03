import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/Sections";
import { getChatThread, sendVisitorMessage } from "@/lib/public.functions";

type ThreadMessage = {
  id: string;
  sender: "visitor" | "staff";
  body: string;
  created_at: string;
};

type Thread = {
  status: "open" | "pending" | "closed";
  visitorName: string;
  messages: ThreadMessage[];
};

const POLL_MS = 5000;

export const Route = createFileRoute("/chat/$token")({
  head: () => ({
    meta: [
      { title: "Live chat | Lifewell Medical Center Athens" },
      { name: "robots", content: "noindex" },
    ],
  }),
  loader: async ({ params }) => {
    const result = await getChatThread({ data: { token: params.token } });
    if (!result) throw notFound();
    return result as Thread;
  },
  component: ChatThreadPage,
  notFoundComponent: () => (
    <div className="grid min-h-screen place-items-center bg-secondary/40 px-4">
      <div className="glass max-w-md rounded-4xl p-8 text-center">
        <h1 className="text-xl font-semibold">This chat is no longer available</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          The link may have expired. Start a fresh conversation and we'll pick it up from there.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link to="/contact" className="btn-glass text-sm">
            Contact us
          </Link>
          <Link to="/" className="btn-glass-ghost text-sm">
            Home
          </Link>
        </div>
      </div>
    </div>
  ),
});

function ChatThreadPage() {
  const { token } = Route.useParams();
  const initialThread = Route.useLoaderData();
  const [thread, setThread] = useState<Thread>(initialThread);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const send = useServerFn(sendVisitorMessage);
  const fetchThread = useServerFn(getChatThread);

  useEffect(() => {
    let cancelled = false;

    async function poll() {
      try {
        const result = await fetchThread({ data: { token } });
        if (cancelled || !result) return;
        setThread(result);
      } catch (error) {
        console.error("Failed to refresh chat thread", error);
      }
    }

    const interval = window.setInterval(poll, POLL_MS);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [token, fetchThread]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [thread.messages.length]);

  async function onSubmit(event: React.SyntheticEvent) {
    event.preventDefault();
    if (busy || !draft.trim() || thread.status === "closed") return;
    setBusy(true);
    const body = draft.trim();
    setDraft("");
    try {
      await send({ data: { token, message: body } });
      const result = await fetchThread({ data: { token } });
      if (result) setThread(result);
    } catch (error) {
      setDraft(body);
      toast.error(error instanceof Error ? error.message : "Could not send your message");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto flex max-w-3xl flex-col px-4 pt-32 pb-16 sm:px-6">
        <header className="mb-6">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Live thread</p>
          <h1 className="text-2xl font-semibold sm:text-3xl">Hello {thread.visitorName}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {thread.status === "closed"
              ? "This conversation has been closed. Send us a new message from the contact page."
              : "We reply here and by email. This page updates automatically."}
          </p>
        </header>

        <section className="glass flex min-h-[24rem] flex-1 flex-col gap-2 rounded-4xl p-4 sm:p-6">
          <div className="flex-1 space-y-2 overflow-y-auto pr-1">
            {thread.messages.length ? (
              thread.messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))
            ) : (
              <p className="py-8 text-center text-sm text-muted-foreground">No messages yet.</p>
            )}
            <div ref={messagesEndRef} />
          </div>

          {thread.status !== "closed" && (
            <form
              onSubmit={onSubmit}
              className="mt-3 flex items-end gap-2 border-t border-border/60 pt-3"
            >
              <textarea
                rows={2}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Type your reply…"
                className="flex-1 resize-none rounded-2xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    void onSubmit(e);
                  }
                }}
              />
              <button
                type="submit"
                disabled={busy || !draft.trim()}
                className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-primary-foreground disabled:opacity-50"
                style={{ background: "var(--gradient-primary)" }}
                aria-label="Send"
              >
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </button>
            </form>
          )}
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

function MessageBubble({ message }: { message: ThreadMessage }) {
  const isStaff = message.sender === "staff";
  return (
    <div className={`flex ${isStaff ? "justify-start" : "justify-end"}`}>
      <div
        className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${
          isStaff
            ? "bg-secondary text-secondary-foreground"
            : "bg-primary text-primary-foreground"
        }`}
      >
        <p className="whitespace-pre-wrap break-words">{message.body}</p>
        <p className="mt-1 text-[10px] opacity-70">
          {new Date(message.created_at).toLocaleString([], {
            hour: "2-digit",
            minute: "2-digit",
            month: "short",
            day: "numeric",
          })}
        </p>
      </div>
    </div>
  );
}
