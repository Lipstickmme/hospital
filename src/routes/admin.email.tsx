import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Loader2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";

import { supabase } from "@/lib/supabase";
import { sendEmailReply } from "@/lib/api/send-email";

type Thread = {
  id: string;
  created_at: string;
  last_message_at: string;
  subject: string;
  participant_email: string;
  participant_name: string | null;
  status: "new" | "in_progress" | "closed";
};

type Message = {
  id: string;
  created_at: string;
  thread_id: string;
  direction: "inbound" | "outbound";
  from_email: string;
  from_name: string | null;
  subject: string | null;
  body_text: string | null;
  body_html: string | null;
  has_attachments: boolean;
};

function when(value: string) {
  return new Date(value).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export const Route = createFileRoute("/admin/email")({
  head: () => ({
    meta: [{ title: "Email | Admin | Lifewell" }, { name: "robots", content: "noindex" }],
  }),
  component: AdminEmailPage,
});

/**
 * Mail addressed to the company mailbox, and replies sent back from it.
 *
 * Inbound message bodies are external content, so they are rendered as plain
 * text rather than as their original HTML.
 */
function AdminEmailPage() {
  const replyFn = useServerFn(sendEmailReply);
  const [threads, setThreads] = useState<Thread[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingList, setLoadingList] = useState(true);

  const activeIdRef = useRef<string | null>(null);
  activeIdRef.current = activeId;

  const loadThreads = useCallback(async () => {
    const { data, error: loadError } = await supabase
      .from("email_threads")
      .select("*")
      .order("last_message_at", { ascending: false });
    if (loadError) setError(loadError.message);
    else setThreads((data as Thread[]) ?? []);
    setLoadingList(false);
  }, []);

  const loadMessages = useCallback(async (threadId: string) => {
    const { data } = await supabase
      .from("email_messages")
      .select("*")
      .eq("thread_id", threadId)
      .order("created_at", { ascending: true });
    setMessages((data as Message[]) ?? []);
  }, []);

  useEffect(() => {
    void loadThreads();
  }, [loadThreads]);

  useEffect(() => {
    if (!activeId) {
      setMessages([]);
      return;
    }
    void loadMessages(activeId);
  }, [activeId, loadMessages]);

  useEffect(() => {
    const channel = supabase
      .channel("email-inbox")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "email_threads" },
        () => void loadThreads(),
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "email_messages" },
        (payload) => {
          const incoming = payload.new as Message;
          void loadThreads();
          if (activeIdRef.current !== incoming.thread_id) return;
          setMessages((rows) =>
            rows.some((row) => row.id === incoming.id) ? rows : [...rows, incoming],
          );
        },
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [loadThreads]);

  const reply = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const body = draft.trim();
    if (!body || !activeId || sending) return;

    setSending(true);
    setError(null);
    try {
      const result = await replyFn({ data: { thread_id: activeId, body } });
      if (!result?.ok) throw new Error("Could not send that reply.");
      setDraft("");
      await loadMessages(activeId);
      await loadThreads();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not send.");
    } finally {
      setSending(false);
    }
  };

  const setStatus = async (status: Thread["status"]) => {
    if (!activeId) return;
    await supabase.from("email_threads").update({ status }).eq("id", activeId);
    void loadThreads();
  };

  const active = threads.find((thread) => thread.id === activeId) ?? null;

  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-4">
        <h1 className="text-2xl font-semibold">Email</h1>
        <p className="text-sm text-muted-foreground">
          {threads.filter((thread) => thread.status === "new").length} unread of {threads.length}
        </p>
      </div>

      {error && (
        <p
          role="alert"
          className="mt-6 rounded-2xl border-l-2 border-destructive bg-card p-4 text-sm"
        >
          {error}
        </p>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-[22rem_1fr]">
        <ul className="glass self-start divide-y divide-border/60 overflow-hidden rounded-3xl">
          {loadingList && (
            <li className="p-6 text-sm text-muted-foreground">
              <Loader2 className="mr-2 inline h-4 w-4 animate-spin" /> Loading…
            </li>
          )}
          {!loadingList && threads.length === 0 && (
            <li className="p-6 text-sm leading-relaxed text-muted-foreground">
              Nothing yet. Mail sent to the company mailbox appears here within a few seconds of
              arriving.
              <span className="mt-3 block text-xs">
                Sent a test and nothing showed? Resend → Webhooks → your endpoint has a delivery log
                with the exact response this site gave.
              </span>
            </li>
          )}

          {threads.map((thread) => (
            <li key={thread.id}>
              <button
                type="button"
                onClick={() => setActiveId(thread.id)}
                className={`block w-full p-4 text-left transition-colors hover:bg-accent ${
                  thread.id === activeId ? "bg-accent" : ""
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <p
                    className={`truncate text-sm ${
                      thread.status === "new" ? "font-bold" : "font-medium"
                    }`}
                  >
                    {thread.participant_name || thread.participant_email}
                  </p>
                  {thread.status === "new" && (
                    <span className="mt-1 size-2 shrink-0 rounded-full bg-primary" />
                  )}
                </div>
                <p className="mt-1 truncate text-sm text-muted-foreground">{thread.subject}</p>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  {when(thread.last_message_at)}
                </p>
              </button>
            </li>
          ))}
        </ul>

        {active ? (
          <div className="glass overflow-hidden rounded-3xl">
            <header className="flex flex-wrap items-start justify-between gap-4 border-b border-border/60 p-4">
              <div>
                <h2 className="text-lg font-semibold">{active.subject}</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {active.participant_name
                    ? `${active.participant_name} · ${active.participant_email}`
                    : active.participant_email}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <a
                  href={`mailto:${active.participant_email}`}
                  className="text-sm font-medium text-primary hover:underline"
                >
                  Open in mail app
                </a>
                <button
                  type="button"
                  onClick={() => setStatus(active.status === "closed" ? "new" : "closed")}
                  className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground transition-colors hover:text-destructive"
                >
                  {active.status === "closed" ? "Reopen" : "Close"}
                </button>
              </div>
            </header>

            <ol className="divide-y divide-border/60">
              {messages.map((message) => (
                <li
                  key={message.id}
                  className={`p-4 ${message.direction === "outbound" ? "bg-accent/40" : ""}`}
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-3">
                    <p className="text-sm font-semibold">
                      {message.direction === "outbound"
                        ? "You"
                        : message.from_name || message.from_email}
                    </p>
                    <p className="text-[11px] text-muted-foreground">{when(message.created_at)}</p>
                  </div>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed">
                    {message.body_text?.trim() || "(no plain-text body, open it in your mail app)"}
                  </p>
                  {message.has_attachments && (
                    <p className="mt-2 text-[11px] font-semibold uppercase tracking-wide text-primary">
                      Has attachments, see your mail app
                    </p>
                  )}
                </li>
              ))}
            </ol>

            <form onSubmit={reply} className="border-t border-border/60 p-4">
              <label className="block text-sm">
                <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Reply as the company mailbox
                </span>
                <textarea
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  rows={5}
                  placeholder="Type your reply"
                  className="w-full resize-none rounded-2xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                />
              </label>
              <button
                type="submit"
                disabled={sending || !draft.trim()}
                className="btn-glass mt-4 py-2 text-sm disabled:opacity-50"
              >
                {sending ? "Sending…" : "Send reply"}
              </button>
            </form>
          </div>
        ) : (
          <div className="glass rounded-3xl p-6 text-sm text-muted-foreground">
            Pick a conversation to read and reply.
          </div>
        )}
      </div>
    </div>
  );
}
