import { useServerFn } from "@tanstack/react-start";
import { MessageCircle, Send, X, Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { getChatThread, sendVisitorMessage, startChat } from "@/lib/public.functions";

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
} | null;

const TOKEN_KEY = "lifewell.chat.token";
const NAME_KEY = "lifewell.chat.name";
const EMAIL_KEY = "lifewell.chat.email";
const POLL_MS = 5000;

function readStorage(key: string): string {
  if (typeof window === "undefined") return "";
  try {
    return window.localStorage.getItem(key) ?? "";
  } catch {
    return "";
  }
}

function writeStorage(key: string, value: string) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Ignore quota / private-mode errors.
  }
}

function clearStorage(key: string) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    // Ignore.
  }
}

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [token, setToken] = useState<string>("");
  const [thread, setThread] = useState<Thread>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [loadingThread, setLoadingThread] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const startChatFn = useServerFn(startChat);
  const sendVisitorMessageFn = useServerFn(sendVisitorMessage);
  const getChatThreadFn = useServerFn(getChatThread);

  useEffect(() => {
    setToken(readStorage(TOKEN_KEY));
    setName(readStorage(NAME_KEY));
    setEmail(readStorage(EMAIL_KEY));
  }, []);

  useEffect(() => {
    if (!open || !token) return;
    let cancelled = false;

    async function load() {
      try {
        const result = await getChatThreadFn({ data: { token } });
        if (cancelled) return;
        if (!result) {
          clearStorage(TOKEN_KEY);
          setToken("");
          setThread(null);
          return;
        }
        setThread(result);
      } catch (error) {
        console.error("Failed to load chat thread", error);
      } finally {
        if (!cancelled) setLoadingThread(false);
      }
    }

    setLoadingThread(true);
    void load();
    const interval = window.setInterval(load, POLL_MS);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [open, token, getChatThreadFn]);

  useEffect(() => {
    if (!open) return;
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [thread?.messages.length, open]);

  async function handleStart(event: React.FormEvent) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    try {
      const result = await startChatFn({ data: { name, email, message: draft } });
      writeStorage(TOKEN_KEY, result.token);
      writeStorage(NAME_KEY, name);
      writeStorage(EMAIL_KEY, email);
      setToken(result.token);
      setDraft("");
      toast.success("Message sent. Our team will reply here shortly.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not start the chat");
    } finally {
      setBusy(false);
    }
  }

  async function handleReply(event: React.SyntheticEvent) {
    event.preventDefault();
    if (busy || !token || !draft.trim()) return;
    setBusy(true);
    const body = draft.trim();
    setDraft("");
    try {
      await sendVisitorMessageFn({ data: { token, message: body } });
      const result = await getChatThreadFn({ data: { token } });
      if (result) setThread(result);
    } catch (error) {
      setDraft(body);
      toast.error(error instanceof Error ? error.message : "Could not send your message");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close chat" : "Open chat"}
        className="fixed bottom-5 right-5 z-40 grid h-14 w-14 place-items-center rounded-full text-primary-foreground shadow-lg transition-transform hover:scale-105 active:scale-95"
        style={{ background: "var(--gradient-primary)" }}
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>

      {open && (
        <div className="fixed bottom-24 right-5 z-40 flex h-[32rem] max-h-[calc(100vh-8rem)] w-[22rem] max-w-[calc(100vw-2.5rem)] flex-col overflow-hidden rounded-3xl border border-border/60 bg-card shadow-2xl">
          <header className="flex items-center justify-between border-b border-border/60 px-4 py-3">
            <div>
              <p className="text-sm font-semibold">Chat with our care team</p>
              <p className="text-xs text-muted-foreground">
                {token ? "We reply during working hours" : "Start a new conversation"}
              </p>
            </div>
            <button
              type="button"
              aria-label="Close chat"
              onClick={() => setOpen(false)}
              className="rounded-full p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </header>

          {!token ? (
            <form onSubmit={handleStart} className="flex flex-1 flex-col gap-3 overflow-y-auto p-4">
              <label className="text-xs font-medium">
                Your name
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 w-full rounded-2xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                />
              </label>
              <label className="text-xs font-medium">
                Email
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 w-full rounded-2xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                />
              </label>
              <label className="flex-1 text-xs font-medium">
                Message
                <textarea
                  required
                  rows={4}
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="How can we help?"
                  className="mt-1 w-full flex-1 resize-none rounded-2xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                />
              </label>
              <button type="submit" disabled={busy} className="btn-glass w-full justify-center py-2 text-sm">
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                {busy ? "Sending…" : "Send message"}
              </button>
            </form>
          ) : (
            <>
              <div className="flex-1 space-y-2 overflow-y-auto px-4 py-3">
                {loadingThread && !thread ? (
                  <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading conversation…
                  </div>
                ) : thread?.messages.length ? (
                  thread.messages.map((message) => (
                    <MessageBubble key={message.id} message={message} />
                  ))
                ) : (
                  <p className="py-8 text-center text-sm text-muted-foreground">
                    No messages yet.
                  </p>
                )}
                <div ref={messagesEndRef} />
              </div>
              <form
                onSubmit={handleReply}
                className="flex items-end gap-2 border-t border-border/60 p-3"
              >
                <textarea
                  rows={2}
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Type a message…"
                  className="flex-1 resize-none rounded-2xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      void handleReply(e);
                    }
                  }}
                />
                <button
                  type="submit"
                  disabled={busy || !draft.trim()}
                  aria-label="Send"
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-primary-foreground disabled:opacity-50"
                  style={{ background: "var(--gradient-primary)" }}
                >
                  {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </button>
              </form>
            </>
          )}
        </div>
      )}
    </>
  );
}

function MessageBubble({ message }: { message: ThreadMessage }) {
  const isStaff = message.sender === "staff";
  return (
    <div className={`flex ${isStaff ? "justify-start" : "justify-end"}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
          isStaff
            ? "bg-secondary text-secondary-foreground"
            : "bg-primary text-primary-foreground"
        }`}
      >
        <p className="whitespace-pre-wrap break-words">{message.body}</p>
        <p className="mt-1 text-[10px] opacity-70">
          {new Date(message.created_at).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>
    </div>
  );
}
