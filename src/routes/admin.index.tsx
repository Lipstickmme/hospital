import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";

import { supabase } from "@/lib/supabase";

type Status = "new" | "in_progress" | "closed";

type Enquiry = {
  id: string;
  created_at: string;
  status: Status;
  name: string;
  company: string | null;
  email: string;
  phone: string | null;
  subject: string | null;
  scope: string;
};

const statuses: Array<{ value: Status; label: string }> = [
  { value: "new", label: "New" },
  { value: "in_progress", label: "In progress" },
  { value: "closed", label: "Closed" },
];

function when(value: string) {
  return new Date(value).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function StatusPill({ status }: { status: Status }) {
  const tone =
    status === "new"
      ? "bg-primary text-primary-foreground"
      : status === "in_progress"
        ? "bg-amber-500/20 text-amber-700 dark:text-amber-300"
        : "bg-muted text-muted-foreground";
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${tone}`}
    >
      {statuses.find((entry) => entry.value === status)?.label}
    </span>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-t border-border/60 py-3">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed">{value}</p>
    </div>
  );
}

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [{ title: "Enquiries | Admin | Lifewell" }, { name: "robots", content: "noindex" }],
  }),
  component: AdminEnquiriesPage,
});

function AdminEnquiriesPage() {
  const [records, setRecords] = useState<Enquiry[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error: loadError } = await supabase
      .from("enquiries")
      .select("*")
      .order("created_at", { ascending: false });

    if (loadError) setError(loadError.message);
    else setRecords((data as Enquiry[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const setStatus = async (id: string, status: Status) => {
    setRecords((current) =>
      current.map((record) => (record.id === id ? { ...record, status } : record)),
    );
    const { error: updateError } = await supabase.from("enquiries").update({ status }).eq("id", id);
    if (updateError) {
      setError(updateError.message);
      void load();
    }
  };

  const selected = records.find((record) => record.id === selectedId) ?? null;

  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-4">
        <h1 className="text-2xl font-semibold">Enquiries</h1>
        <p className="text-sm text-muted-foreground">
          {records.filter((record) => record.status === "new").length} new of {records.length}
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

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1.1fr]">
        <ul className="glass self-start divide-y divide-border/60 overflow-hidden rounded-3xl">
          {loading && <li className="p-6 text-sm text-muted-foreground">Loading…</li>}
          {!loading && records.length === 0 && (
            <li className="p-6 text-sm text-muted-foreground">
              No enquiries yet. Submissions from the contact form land here.
            </li>
          )}

          {records.map((record) => (
            <li key={record.id}>
              <button
                type="button"
                onClick={() => setSelectedId(record.id)}
                className={`flex w-full items-start justify-between gap-4 p-4 text-left transition-colors hover:bg-accent ${
                  record.id === selectedId ? "bg-accent" : ""
                }`}
              >
                <div className="min-w-0">
                  <p className="truncate font-semibold">{record.name}</p>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {record.company ?? record.email}
                  </p>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    {when(record.created_at)}
                  </p>
                </div>
                <StatusPill status={record.status} />
              </button>
            </li>
          ))}
        </ul>

        {selected && (
          <div className="glass rounded-3xl p-6 lg:sticky lg:top-6 lg:self-start">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-xl font-semibold">{selected.name}</h2>
              <a
                href={`mailto:${selected.email}`}
                className="text-sm font-medium text-primary hover:underline"
              >
                Reply by email
              </a>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{when(selected.created_at)}</p>

            <div className="mt-4">
              <Field label="Email" value={selected.email} />
              {selected.company && <Field label="Company" value={selected.company} />}
              {selected.phone && <Field label="Phone" value={selected.phone} />}
              {selected.subject && <Field label="Subject" value={selected.subject} />}
              <Field label="Message" value={selected.scope} />
            </div>

            <div className="mt-4 flex flex-wrap gap-2 border-t border-border/60 pt-4">
              {statuses.map((status) => (
                <button
                  key={status.value}
                  type="button"
                  onClick={() => setStatus(selected.id, status.value)}
                  className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
                    selected.status === status.value
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border text-muted-foreground hover:border-primary hover:text-foreground"
                  }`}
                >
                  {status.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
