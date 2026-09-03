import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import {
  CheckCheck,
  CircleDot,
  Loader2,
  Lock,
  MailCheck,
  MessageSquare,
  Send,
  Unlock,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import {
  getConversation,
  listConversations,
  replyToConversation,
  setConversationStatus,
} from "@/lib/admin.functions";

type ConversationRow = {
  id: string;
  kind: "contact" | "chat";
  status: "open" | "pending" | "closed";
  visitor_name: string;
  visitor_email: string;
  visitor_phone: string | null;
  subject: string;
  created_at: string;
  last_message_at: string;
};

type ConversationMessage = {
  id: string;
  sender: "visitor" | "staff";
  body: string;
  created_at: string;
  email_sent: boolean;
};

type StatusFilter = "all" | "open" | "pending" | "closed";
type KindFilter = "all" | "contact" | "chat";

export const Route = createFileRoute("/admin/messages")({
  head: () => ({
    meta: [{ title: "Messages | Admin | Lifewell" }, { name: "robots", content: "noindex" }],
  }),
  component: AdminMessagesPage,
});

function AdminMessagesPage() {
  const listFn = useServerFn(listConversations);
  const getFn = useServerFn(getConversation);
  const replyFn = useServerFn(replyToConversation);
  const statusFn = useServerFn(setConversationStatus);

  const [conversations, setConversations] = useState<ConversationRow[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [loadingThread, setLoadingThread] = useState(false);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [kindFilter, setKindFilter] = useState<KindFilter>("all");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const refreshList = useCallback(async () => {
    try {
      const data = await listFn({});
      setConversations(data as ConversationRow[]);
    } catch (error) {
      console.error("Failed to load conversations", error);
    } finally {
      setLoadingList(false);
    }
  }, [listFn]);

  const refreshThread = useCallback(
    async (id: string) => {
      try {
        const data = await getFn({ data: { id } });
        setMessages(data as ConversationMessage[]);
      } catch (error) {
        console.error("Failed to load thread", error);
      } finally {
        setLoadingThread(false);
      }
    },
    [getFn],
  );

  useEffect(() => {
    void refreshList();
  }, [refreshList]);

  useEffect(() => {
    const channel = supabase
      .channel("admin-messages")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "conversations" },
        () => {
          void refreshList();
        },
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "conversation_messages" },
        (payload) => {
          void refreshList();
          const inserted = payload.new as { conversation_id?: string } | null;
          if (inserted?.conversation_id && inserted.conversation_id === selectedId) {
            void refreshThread(selectedId);
          }
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [refreshList, refreshThread, selectedId]);

  useEffect(() => {
    if (!selectedId) return;
    setLoadingThread(true);
    void refreshThread(selectedId);
  }, [selectedId, refreshThread]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const filtered = useMemo(
    () =>
      conversations.filter((c) => {
        if (statusFilter !== "all" && c.status !== statusFilter) return false;
        if (kindFilter !== "all" && c.kind !== kindFilter) return false;
        return true;
      }),
    [conversations, statusFilter, kindFilter],
  );

  const selected = useMemo(
    () => conversations.find((c) => c.id === selectedId) ?? null,
    [conversations, selectedId],
  );

  async function onReply(event: React.SyntheticEvent) {
    event.preventDefault();
    if (!selectedId || sending || !draft.trim()) return;
    setSending(true);
    const body = draft.trim();
    setDraft("");
    try {
      const result = await replyFn({ data: { id: selectedId, message: body } });
      await refreshThread(selectedId);
      await refreshList();
      toast.success(result.emailed ? "Reply sent and emailed" : "Reply saved (email skipped)");
    } catch (error) {
      setDraft(body);
      toast.error(error instanceof Error ? error.message : "Could not send reply");
    } finally {
      setSending(false);
    }
  }

  async function onStatus(status: "open" | "pending" | "closed") {
    if (!selectedId) return;
    try {
      await statusFn({ data: { id: selectedId, status } });
      await refreshList();
      toast.success(`Marked ${status}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update status");
    }
  }

  return (
    <main className="mx-auto grid max-w-7xl gap-4 px-4 py-6 sm:px-6 lg:grid-cols-[22rem_1fr]">
      <aside className="glass flex max-h-[calc(100vh-8rem)] flex-col rounded-3xl">
        <div className="border-b border-border/60 p-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Conversations</h2>
            <span className="text-xs text-muted-foreground">{filtered.length}</span>
          </div>
          <div className="mt-3 flex flex-wrap gap-1">
            <FilterChip active={statusFilter === "all"} onClick={() => setStatusFilter("all")}>
              All
            </FilterChip>
            <FilterChip
              active={statusFilter === "open"}
              onClick={() => setStatusFilter("open")}
            >
              Open
            </FilterChip>
            <FilterChip
              active={statusFilter === "pending"}
              onClick={() => setStatusFilter("pending")}
            >
              Pending
            </FilterChip>
            <FilterChip
              active={statusFilter === "closed"}
              onClick={() => setStatusFilter("closed")}
            >
              Closed
            </FilterChip>
          </div>
          <div className="mt-2 flex flex-wrap gap-1">
            <FilterChip active={kindFilter === "all"} onClick={() => setKindFilter("all")}>
              Any type
            </FilterChip>
            <FilterChip
              active={kindFilter === "contact"}
              onClick={() => setKindFilter("contact")}
            >
              Contact
            </FilterChip>
            <FilterChip active={kindFilter === "chat"} onClick={() => setKindFilter("chat")}>
              Live chat
            </FilterChip>
          </div>
        </div>
        <div className="flex-1 divide-y divide-border/50 overflow-y-auto">
          {loadingList ? (
            <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading…
            </div>
          ) : filtered.length ? (
            filtered.map((c) => (
              <button
                type="button"
                key={c.id}
                onClick={() => setSelectedId(c.id)}
                className={`block w-full px-3 py-3 text-left transition-colors hover:bg-accent ${
                  c.id === selectedId ? "bg-accent" : ""
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-sm font-semibold">{c.visitor_name}</p>
                  <StatusPill status={c.status} />
                </div>
                <p className="mt-0.5 truncate text-xs text-muted-foreground">{c.subject}</p>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  {c.kind === "chat" ? "Live chat" : "Contact form"} ·{" "}
                  {new Date(c.last_message_at).toLocaleString([], {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </button>
            ))
          ) : (
            <p className="py-8 text-center text-sm text-muted-foreground">No conversations.</p>
          )}
        </div>
      </aside>

      <section className="glass flex max-h-[calc(100vh-8rem)] flex-col rounded-3xl">
        {selected ? (
          <>
            <header className="flex items-start justify-between gap-3 border-b border-border/60 p-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="truncate text-base font-semibold">{selected.visitor_name}</h3>
                  <StatusPill status={selected.status} />
                </div>
                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                  {selected.visitor_email}
                  {selected.visitor_phone ? ` · ${selected.visitor_phone}` : ""}
                </p>
                <p className="mt-1 truncate text-sm">{selected.subject}</p>
              </div>
              <div className="flex shrink-0 flex-wrap gap-1">
                {selected.status !== "open" && (
                  <StatusButton onClick={() => onStatus("open")} icon={<Unlock className="h-3.5 w-3.5" />}>
                    Reopen
                  </StatusButton>
                )}
                {selected.status !== "pending" && (
                  <StatusButton onClick={() => onStatus("pending")} icon={<CircleDot className="h-3.5 w-3.5" />}>
                    Pending
                  </StatusButton>
                )}
                {selected.status !== "closed" && (
                  <StatusButton onClick={() => onStatus("closed")} icon={<Lock className="h-3.5 w-3.5" />}>
                    Close
                  </StatusButton>
                )}
              </div>
            </header>

            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {loadingThread ? (
                <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading…
                </div>
              ) : messages.length ? (
                messages.map((m) => <StaffMessageBubble key={m.id} message={m} />)
              ) : (
                <p className="py-8 text-center text-sm text-muted-foreground">No messages yet.</p>
              )}
              <div ref={messagesEndRef} />
            </div>

            <form
              onSubmit={onReply}
              className="flex items-end gap-2 border-t border-border/60 p-3"
            >
              <textarea
                rows={3}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Type a reply — the visitor gets it here and by email…"
                className="flex-1 resize-none rounded-2xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                onKeyDown={(e) => {
                  if ((e.key === "Enter" && e.metaKey) || (e.key === "Enter" && e.ctrlKey)) {
                    e.preventDefault();
                    void onReply(e);
                  }
                }}
              />
              <button
                type="submit"
                disabled={sending || !draft.trim()}
                className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm text-primary-foreground disabled:opacity-50"
              >
                {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                Reply
              </button>
            </form>
          </>
        ) : (
          <div className="grid flex-1 place-items-center text-center text-sm text-muted-foreground">
            <div>
              <MessageSquare className="mx-auto h-8 w-8 opacity-50" />
              <p className="mt-2">Select a conversation to read the thread.</p>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-2.5 py-1 text-[11px] transition-colors ${
        active
          ? "bg-primary text-primary-foreground"
          : "bg-background text-muted-foreground hover:bg-accent"
      }`}
    >
      {children}
    </button>
  );
}

function StatusPill({ status }: { status: "open" | "pending" | "closed" }) {
  const label = status[0]?.toUpperCase() + status.slice(1);
  const tone =
    status === "open"
      ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
      : status === "pending"
        ? "bg-amber-500/15 text-amber-700 dark:text-amber-300"
        : "bg-muted text-muted-foreground";
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ${tone}`}>
      {label}
    </span>
  );
}

function StatusButton({
  onClick,
  icon,
  children,
}: {
  onClick: () => void;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-2.5 py-1 text-[11px] hover:bg-accent"
    >
      {icon}
      {children}
    </button>
  );
}

function StaffMessageBubble({ message }: { message: ConversationMessage }) {
  const isStaff = message.sender === "staff";
  return (
    <div className={`flex ${isStaff ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${
          isStaff
            ? "bg-primary text-primary-foreground"
            : "bg-secondary text-secondary-foreground"
        }`}
      >
        <p className="whitespace-pre-wrap break-words">{message.body}</p>
        <p className="mt-1 flex items-center gap-1 text-[10px] opacity-80">
          {new Date(message.created_at).toLocaleString([], {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
          {isStaff &&
            (message.email_sent ? (
              <MailCheck className="h-3 w-3" aria-label="Emailed" />
            ) : (
              <CheckCheck className="h-3 w-3" aria-label="Saved" />
            ))}
        </p>
      </div>
    </div>
  );
}
