import {
  createFileRoute,
  Link,
  Outlet,
  useNavigate,
  useRouterState,
} from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { LogOut, MessageSquare, CalendarClock, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

import { supabase } from "@/integrations/supabase/client";
import { getStaffAccess } from "@/lib/admin.functions";

type Access = { isAdmin: boolean; isStaff: boolean };

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin | Lifewell Medical Center Athens" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminLayout,
});

function AdminLayout() {
  const navigate = useNavigate();
  const fetchAccess = useServerFn(getStaffAccess);
  const [access, setAccess] = useState<Access | null>(null);
  const [checking, setChecking] = useState(true);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    let cancelled = false;

    async function verify() {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        if (!cancelled) navigate({ to: "/auth" });
        return;
      }
      try {
        const result = await fetchAccess({});
        if (cancelled) return;
        setAccess(result);
      } catch {
        if (!cancelled) setAccess({ isAdmin: false, isStaff: false });
      } finally {
        if (!cancelled) setChecking(false);
      }
    }

    void verify();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) navigate({ to: "/auth" });
    });

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, [navigate, fetchAccess]);

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/auth" });
  }

  if (checking) {
    return (
      <div className="grid min-h-screen place-items-center bg-secondary/40">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Checking access…
        </div>
      </div>
    );
  }

  if (!access?.isStaff && !access?.isAdmin) {
    return (
      <div className="grid min-h-screen place-items-center bg-secondary/40 px-4">
        <div className="glass max-w-md rounded-4xl p-8 text-center">
          <h1 className="text-xl font-semibold">No staff access</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Your account is signed in, but doesn't have staff or admin permissions. Ask an
            administrator to grant you access.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <button type="button" onClick={signOut} className="btn-glass text-sm">
              Sign out
            </button>
            <Link to="/" className="btn-glass-ghost text-sm">
              Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary/40">
      <header className="border-b border-border/60 bg-background/70 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-6">
            <Link to="/" className="text-sm font-semibold">
              LIFEWELL <span className="text-muted-foreground">/ admin</span>
            </Link>
            <nav className="hidden items-center gap-1 sm:flex">
              <AdminTab to="/admin/messages" active={pathname.startsWith("/admin/messages")}>
                <MessageSquare className="h-4 w-4" /> Messages
              </AdminTab>
              <AdminTab to="/admin/bookings" active={pathname.startsWith("/admin/bookings")}>
                <CalendarClock className="h-4 w-4" /> Bookings
              </AdminTab>
            </nav>
          </div>
          <button
            type="button"
            onClick={signOut}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5 text-xs text-foreground hover:bg-accent"
          >
            <LogOut className="h-3.5 w-3.5" /> Sign out
          </button>
        </div>
        <nav className="mx-auto flex max-w-7xl gap-1 px-4 pb-3 sm:hidden">
          <AdminTab to="/admin/messages" active={pathname.startsWith("/admin/messages")}>
            <MessageSquare className="h-4 w-4" /> Messages
          </AdminTab>
          <AdminTab to="/admin/bookings" active={pathname.startsWith("/admin/bookings")}>
            <CalendarClock className="h-4 w-4" /> Bookings
          </AdminTab>
        </nav>
      </header>
      <Outlet />
    </div>
  );
}

function AdminTab({
  to,
  active,
  children,
}: {
  to: "/admin/messages" | "/admin/bookings";
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      to={to}
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm transition-colors ${
        active
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:bg-accent hover:text-foreground"
      }`}
    >
      {children}
    </Link>
  );
}
