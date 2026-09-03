import { createFileRoute } from "@tanstack/react-router";
import { CalendarClock, Loader2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { supabase } from "@/integrations/supabase/client";

type BookingStatus = "new" | "confirmed" | "cancelled" | "completed";

type Booking = {
  id: string;
  status: BookingStatus;
  patient_name: string;
  email: string;
  phone: string;
  service: string;
  preferred_date: string;
  preferred_time: string;
  notes: string | null;
  created_at: string;
};

type StatusFilter = "all" | BookingStatus;

const STATUS_ORDER: BookingStatus[] = ["new", "confirmed", "completed", "cancelled"];

export const Route = createFileRoute("/admin/bookings")({
  head: () => ({
    meta: [{ title: "Bookings | Admin | Lifewell" }, { name: "robots", content: "noindex" }],
  }),
  component: AdminBookingsPage,
});

function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const { data, error: loadError } = await supabase
      .from("bookings")
      .select("*")
      .order("created_at", { ascending: false });
    if (loadError) setError(loadError.message);
    else setBookings((data as Booking[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    const channel = supabase
      .channel("admin-bookings")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "bookings" },
        () => void refresh(),
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [refresh]);

  const filtered = useMemo(
    () =>
      bookings.filter((b) => statusFilter === "all" || b.status === statusFilter),
    [bookings, statusFilter],
  );

  async function onStatus(id: string, status: BookingStatus) {
    setBusyId(id);
    const { error: updateError } = await supabase
      .from("bookings")
      .update({ status })
      .eq("id", id);
    if (updateError) setError(updateError.message);
    await refresh();
    setBusyId(null);
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Appointment bookings</h1>
          <p className="text-xs text-muted-foreground">
            {filtered.length} of {bookings.length} shown
          </p>
        </div>
        <div className="flex flex-wrap gap-1">
          <FilterChip active={statusFilter === "all"} onClick={() => setStatusFilter("all")}>
            All
          </FilterChip>
          {STATUS_ORDER.map((status) => (
            <FilterChip
              key={status}
              active={statusFilter === status}
              onClick={() => setStatusFilter(status)}
            >
              {status[0]?.toUpperCase() + status.slice(1)}
            </FilterChip>
          ))}
        </div>
      </div>

      {error && (
        <p role="alert" className="mb-4 rounded-2xl border-l-2 border-destructive bg-card p-4 text-sm">
          {error}
        </p>
      )}

      <div className="glass overflow-x-auto rounded-3xl">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-border/60 text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Patient</th>
              <th className="px-4 py-3">Service</th>
              <th className="px-4 py-3">Preferred</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                  <Loader2 className="mr-2 inline h-4 w-4 animate-spin" /> Loading…
                </td>
              </tr>
            ) : filtered.length ? (
              filtered.map((b) => (
                <tr key={b.id} className="align-top">
                  <td className="px-4 py-3">
                    <p className="font-medium">{b.patient_name}</p>
                    <p className="text-xs text-muted-foreground">{b.email}</p>
                    <p className="text-xs text-muted-foreground">{b.phone}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p>{b.service}</p>
                    {b.notes && (
                      <p className="mt-1 max-w-xs text-xs text-muted-foreground">{b.notes}</p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <p className="inline-flex items-center gap-1">
                      <CalendarClock className="h-3.5 w-3.5 text-muted-foreground" />
                      {b.preferred_date}
                    </p>
                    <p className="text-xs text-muted-foreground">{b.preferred_time}</p>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={b.status} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap justify-end gap-1">
                      {STATUS_ORDER.filter((s) => s !== b.status).map((s) => (
                        <button
                          type="button"
                          key={s}
                          disabled={busyId === b.id}
                          onClick={() => onStatus(b.id, s)}
                          className="rounded-full border border-border bg-background px-2.5 py-1 text-[11px] hover:bg-accent disabled:opacity-50"
                        >
                          {busyId === b.id ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            s[0]?.toUpperCase() + s.slice(1)
                          )}
                        </button>
                      ))}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                  No bookings.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
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
      className={`rounded-full px-3 py-1 text-xs transition-colors ${
        active
          ? "bg-primary text-primary-foreground"
          : "bg-background text-muted-foreground hover:bg-accent"
      }`}
    >
      {children}
    </button>
  );
}

function StatusBadge({ status }: { status: BookingStatus }) {
  const tone =
    status === "new"
      ? "bg-sky-500/15 text-sky-700 dark:text-sky-300"
      : status === "confirmed"
        ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
        : status === "completed"
          ? "bg-muted text-muted-foreground"
          : "bg-rose-500/15 text-rose-700 dark:text-rose-300";
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ${tone}`}>
      {status[0]?.toUpperCase() + status.slice(1)}
    </span>
  );
}
