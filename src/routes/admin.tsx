import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { CalendarClock, Loader2, LogOut, Mail, MessageSquare, Users } from "lucide-react";

import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { AdminLogin } from "@/components/admin/AdminLogin";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin | Lifewell Medical Center Athens" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminLayout,
});

const tabs = [
  { to: "/admin", label: "Enquiries", icon: Users, end: true },
  { to: "/admin/chat", label: "Live chat", icon: MessageSquare, end: false },
  { to: "/admin/email", label: "Email", icon: Mail, end: false },
  { to: "/admin/bookings", label: "Bookings", icon: CalendarClock, end: false },
] as const;

function AdminLayout() {
  const { user, isAdmin, loading } = useAdminAuth();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  if (!isSupabaseConfigured) {
    return (
      <div className="grid min-h-screen place-items-center bg-secondary/40 px-6 text-center">
        <div className="glass max-w-md rounded-4xl p-8">
          <h1 className="text-xl font-semibold">Backend not configured</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Set <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_PUBLISHABLE_KEY</code>, then
            reload.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-secondary/40">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading…
        </div>
      </div>
    );
  }

  if (!user) return <AdminLogin />;
  if (!isAdmin) {
    return (
      <AdminLogin notice="That account is not on the admin list. Add it by running supabase/grant-admin.sql with this address, or sign in with a different account." />
    );
  }

  return (
    <div className="min-h-screen bg-secondary/40">
      <header className="border-b border-border/60 bg-background/70 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link to="/" className="text-sm font-semibold tracking-tight">
            LIFEWELL <span className="text-muted-foreground">/ admin</span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="hidden text-xs text-muted-foreground sm:block">{user.email}</span>
            <button
              type="button"
              onClick={() => void supabase.auth.signOut()}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5 text-xs hover:bg-accent"
            >
              <LogOut className="h-3.5 w-3.5" /> Sign out
            </button>
          </div>
        </div>
        <nav className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 pb-3 sm:px-6">
          {tabs.map((tab) => {
            const active = tab.end
              ? pathname === tab.to
              : pathname === tab.to || pathname.startsWith(`${tab.to}/`);
            const Icon = tab.icon;
            return (
              <Link
                key={tab.to}
                to={tab.to}
                className={`inline-flex shrink-0 items-center gap-2 rounded-full px-3 py-1.5 text-sm transition-colors ${
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4" /> {tab.label}
              </Link>
            );
          })}
        </nav>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <Outlet />
      </main>
    </div>
  );
}
