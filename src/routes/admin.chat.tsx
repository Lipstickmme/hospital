import { createFileRoute } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";

import { supabase } from "@/integrations/supabase/client";
import type { ChatMessage } from "@/hooks/useVisitorChat";

type Session = {
  id: string;
  created_at: string;
  last_message_at: string;
  visitor_name: string | null;
  visitor_email: string | null;
  status: "new" | "in_progress" | "closed";
};

function when(value: string) {
  return new Date(value).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export const Route = createFileRoute("/admin/chat")({
  head: () => ({
    meta: [{ title: "Live chat | Admin | Lifewell" }, { name: "robots", content: "noindex" }],
  }),
  component: AdminChatPage,
});

/**
 * Staff side of the live chat. Sessions and messages both stream over
 * realtime, so a reply typed here appears in the visitor's widget without
 * either side reloading.
 */
function AdminChatPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loadingList, setLoadingList] = useState(true);
  const threadRef = useRef<HTMLOListElement>(null);

  const activeIdRef = useRef<string | null>(null);
  activeIdRef.current = activeId;

  const loadSessions = useCallback(async () => {
    const { data, error: loadError } = await supabase
      .from("chat_sessions")
      .select("*")
      .order("last_message_at", { ascending: false });

    if (loadError) setError(loadError.message);
    else setSessions((data as Session[]) ?? []);
    setLoadingList(false);
  }, []);

  useEffect(() => {
    void loadSessions();
  }, [loadSessions]);

  useEffect(() => {
    const channel = supabase
      .channel("chat-admin-inbox")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "chat_sessions" },
        () => void loadSessions(),
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "chat_messages" },
        (payload) => {
          const incoming = payload.new as ChatMessage & { session_id: string };
          void loadSessions();
          if (activeIdRef.current !== incoming.session_id) return;
          setMessages((rows) =>
            rows.some((row) => row.id === incoming.id) ? rows : [...rows, incoming],
          );
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [loadSessions]);

  useEffect(() => {
    if (!activeId) {
      setMessages([]);
      return;
    }
    let cancelled = false;
    void supabase
      .from("chat_messages")
      .select("id, created_at, sender, body")
      .eq("session_id", activeId)
      .order("created_at", { ascending: true })
      .then(({ data }) => {
        if (!cancelled) setMessages((data as ChatMessage[]) ?? []);
      });
    return () => {
      cancelled = true;
    };
  }, [activeId]);

  useEffect(() => {
    const thread = threadRef.current;
    if (thread) thread.scrollTop = thread.scrollHeight;
  }, [messages]);

  const reply = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const body = draft.trim();
    if (!body || !activeId) return;

    setDraft("");
    const { data: sent, error: sendError } = await supabase
      .from("chat_messages")
      .insert({ session_id: activeId, sender: "agent", body })
      .select("id, created_at, sender, body")
      .single();

    if (sendError) {
      setError(sendError.message);
      setDraft(body);
      return;
    }

    const message = sent as ChatMessage;
    setMessages((rows) => (rows.some((row) => row.id === message.id) ? rows : [...rows, message]));

    await supabase.from("chat_sessions").update({ status: "in_progress" }).eq("id", activeId);
  };

  const closeSession = async () => {
    if (!activeId) return;
    await supabase.from("chat_sessions").update({ status: "closed" }).eq("id", activeId);
    void loadSessions();
  };

  const active = sessions.find((session) => session.id === activeId) ?? null;

  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-4">
        <h1 className="text-2xl font-semibold">Live chat</h1>
        <p className="text-sm text-muted-foreground">
          {sessions.filter((session) => session.status === "new").length} waiting of{" "}
          {sessions.length}
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

      <div className="mt-6 grid gap-6 lg:grid-cols-[20rem_1fr]">
        <ul className="glass self-start divide-y divide-border/60 overflow-hidden rounded-3xl">
          {loadingList && (
            <li className="p-6 text-sm text-muted-foreground">
              <Loader2 className="mr-2 inline h-4 w-4 animate-spin" /> Loading…
            </li>
          )}
          {!loadingList && sessions.length === 0 && (
            <li className="p-6 text-sm text-muted-foreground">
              No conversations yet. The widget on the public site opens them.
            </li>
          )}

          {sessions.map((session) => (
            <li key={session.id}>
              <button
                type="button"
                onClick={() => setActiveId(session.id)}
                className={`block w-full p-4 text-left transition-colors hover:bg-accent ${
                  session.id === activeId ? "bg-accent" : ""
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="truncate text-sm font-semibold">
                    {session.visitor_name || "Website visitor"}
                  </p>
                  {session.status === "new" && (
                    <span className="size-2 shrink-0 rounded-full bg-primary" />
                  )}
                </div>
                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                  {session.visitor_email || "No email left"}
                </p>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  {when(session.last_message_at)}
                </p>
              </button>
            </li>
          ))}
        </ul>

        {active ? (
          <div className="glass flex h-[32rem] flex-col overflow-hidden rounded-3xl">
            <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 p-4">
              <div>
                <p className="text-base font-semibold">
                  {active.visitor_name || "Website visitor"}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Opened {when(active.created_at)}
                </p>
              </div>
              <div className="flex items-center gap-4">
                {active.visitor_email && (
                  <a
                    href={`mailto:${active.visitor_email}`}
                    className="text-sm font-medium text-primary hover:underline"
                  >
                    Email instead
                  </a>
                )}
                <button
                  type="button"
                  onClick={closeSession}
                  className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground transition-colors hover:text-destructive"
                >
                  Close
                </button>
              </div>
            </header>

            <ol ref={threadRef} className="flex flex-1 flex-col gap-3 overflow-y-auto p-4">
              {messages.map((message) => (
                <li
                  key={message.id}
                  className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                    message.sender === "agent"
                      ? "ml-auto bg-primary text-primary-foreground"
                      : "mr-auto border border-border/60 bg-secondary text-secondary-foreground"
                  }`}
                >
                  <p className="whitespace-pre-wrap break-words">{message.body}</p>
                </li>
              ))}
            </ol>

            <form onSubmit={reply} className="flex items-end gap-2 border-t border-border/60 p-3">
              <textarea
                rows={2}
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder="Type a reply"
                aria-label="Reply"
                className="flex-1 resize-none rounded-2xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    void reply(event as unknown as FormEvent<HTMLFormElement>);
                  }
                }}
              />
              <button
                type="submit"
                disabled={!draft.trim()}
                className="inline-flex shrink-0 items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm text-primary-foreground disabled:opacity-50"
              >
                Send
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
