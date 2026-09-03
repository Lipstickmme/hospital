import { useEffect, useRef, useState, type FormEvent } from "react";
import { MessageCircle, Send, X } from "lucide-react";
import { useRouterState } from "@tanstack/react-router";

import { supabase } from "@/integrations/supabase/client";
import { isBackendConfigured } from "@/lib/backend";
import { useVisitorChat } from "@/hooks/useVisitorChat";

function Bubble({ sender, body }: { sender: "visitor" | "agent"; body: string }) {
  const isVisitor = sender === "visitor";
  return (
    <li
      className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
        isVisitor
          ? "ml-auto bg-primary text-primary-foreground"
          : "mr-auto border border-border/60 bg-secondary text-secondary-foreground"
      }`}
    >
      <p className="whitespace-pre-wrap break-words">{body}</p>
    </li>
  );
}

/**
 * Live chat, bottom-right of every public page. Hidden entirely when the
 * backend is not configured, and on the admin side, where staff answer these
 * conversations rather than start them.
 */
export function ChatWidget() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);
  const [isStaff, setIsStaff] = useState(false);
  const [draft, setDraft] = useState("");
  const threadRef = useRef<HTMLOListElement>(null);
  const { sessionId, messages, status, error, start, send } = useVisitorChat();

  // A signed-in, non-anonymous user is staff; they get the dashboard, not this.
  useEffect(() => {
    if (!isBackendConfigured) return;
    let cancelled = false;
    void supabase.auth.getUser().then(({ data }) => {
      if (!cancelled) setIsStaff(Boolean(data.user) && !data.user?.is_anonymous);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        setIsStaff(false);
        return;
      }
      setIsStaff(!session.user.is_anonymous);
    });
    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, []);

  // Keep the newest message in view.
  useEffect(() => {
    const thread = threadRef.current;
    if (thread) thread.scrollTop = thread.scrollHeight;
  }, [messages, open]);

  if (!isBackendConfigured) return null;
  if (isStaff || pathname.startsWith("/admin") || pathname.startsWith("/auth"))
    return null;

  const openConversation = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const message = String(form.get("message") ?? "").trim();
    if (!message) return;

    void start({
      name: String(form.get("name") ?? "").trim(),
      email: String(form.get("email") ?? "").trim(),
      message,
    });
  };

  const sendFollowUp = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const body = draft.trim();
    if (!body) return;
    setDraft("");
    void send(body);
  };

  return (
    <div className="fixed right-5 bottom-5 z-40 flex flex-col items-end gap-3 print:hidden">
      {open && (
        <section
          aria-label="Live chat"
          className="flex h-[28rem] w-[min(22rem,calc(100vw-2.5rem))] flex-col overflow-hidden rounded-3xl border border-border/60 bg-card shadow-2xl"
        >
          <header
            className="flex items-center justify-between px-5 py-4 text-primary-foreground"
            style={{ background: "var(--gradient-primary)" }}
          >
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest opacity-80">
                Live chat
              </p>
              <p className="mt-0.5 text-sm font-semibold">Ask our care team</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close chat"
              className="grid size-8 place-items-center rounded-full text-primary-foreground/80 transition-colors hover:bg-primary-foreground/10 hover:text-primary-foreground"
            >
              <X className="size-4" />
            </button>
          </header>

          {sessionId ? (
            <>
              <ol
                ref={threadRef}
                className="flex flex-1 flex-col gap-3 overflow-y-auto p-4"
              >
                {messages.map((message) => (
                  <Bubble
                    key={message.id}
                    sender={message.sender}
                    body={message.body}
                  />
                ))}
                {messages.length === 1 && (
                  <li className="mt-1 text-xs text-muted-foreground">
                    Someone will pick this up shortly. You can close the window,
                    the conversation is kept.
                  </li>
                )}
              </ol>

              <form
                onSubmit={sendFollowUp}
                className="flex items-end gap-2 border-t border-border/60 p-3"
              >
                <textarea
                  rows={2}
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  placeholder="Type a message"
                  aria-label="Message"
                  className="flex-1 resize-none rounded-2xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault();
                      sendFollowUp(event as unknown as FormEvent<HTMLFormElement>);
                    }
                  }}
                />
                <button
                  type="submit"
                  aria-label="Send"
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-primary-foreground disabled:opacity-50"
                  style={{ background: "var(--gradient-primary)" }}
                  disabled={!draft.trim()}
                >
                  <Send className="size-4" />
                </button>
              </form>
            </>
          ) : (
            <form
              onSubmit={openConversation}
              className="flex flex-1 flex-col gap-3 overflow-y-auto p-4"
            >
              <p className="text-sm leading-relaxed">
                Tell us what you need and we will reply here. Leave an email so
                we can follow up if you have gone by the time we answer.
              </p>

              <label className="text-xs font-medium">
                Name
                <input
                  name="name"
                  aria-label="Name"
                  className="mt-1 w-full rounded-2xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                />
              </label>
              <label className="text-xs font-medium">
                Email (optional)
                <input
                  type="email"
                  name="email"
                  aria-label="Email"
                  className="mt-1 w-full rounded-2xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                />
              </label>
              <label className="flex-1 text-xs font-medium">
                Message
                <textarea
                  name="message"
                  rows={3}
                  required
                  placeholder="How can we help?"
                  aria-label="Message"
                  className="mt-1 w-full flex-1 resize-none rounded-2xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                />
              </label>

              {error && (
                <p role="alert" className="text-xs text-destructive">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={status === "starting"}
                className="btn-glass w-full justify-center py-2 text-sm"
              >
                {status === "starting" ? "Opening…" : "Start chat"}
              </button>
            </form>
          )}
        </section>
      )}

      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-label={open ? "Close live chat" : "Open live chat"}
        className="grid size-14 place-items-center rounded-full text-primary-foreground shadow-xl transition-transform hover:scale-105 active:scale-95"
        style={{ background: "var(--gradient-primary)" }}
      >
        {open ? <X className="size-6" /> : <MessageCircle className="size-6" />}
      </button>
    </div>
  );
}
