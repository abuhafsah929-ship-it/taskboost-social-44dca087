import { createFileRoute, Outlet, redirect, Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Bell, Home, ListTodo, Wallet, Users, Settings, LogOut, Shield, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) throw redirect({ to: "/auth" });
    return { user: data.user };
  },
  component: AuthLayout,
});

const navItems = [
  { to: "/dashboard", label: "Home", icon: Home },
  { to: "/tasks", label: "Tasks", icon: ListTodo },
  { to: "/earnings", label: "Earnings", icon: Wallet },
  { to: "/referrals", label: "Referrals", icon: Users },
  { to: "/settings", label: "Profile", icon: Settings },
] as const;

function AuthLayout() {
  const { user } = Route.useRouteContext();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [mobileMenu, setMobileMenu] = useState(false);

  const { data: isAdmin } = useQuery({
    queryKey: ["is-admin", user.id],
    queryFn: async () => {
      const { data } = await supabase.from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin").maybeSingle();
      return !!data;
    },
  });

  const { data: unread = 0 } = useQuery({
    queryKey: ["unread-notifications", user.id],
    queryFn: async () => {
      const { count } = await supabase.from("notifications").select("id", { count: "exact", head: true }).eq("user_id", user.id).eq("read", false);
      return count ?? 0;
    },
    refetchInterval: 15000,
  });

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") navigate({ to: "/auth", replace: true });
    });
    return () => sub.subscription.unsubscribe();
  }, [navigate]);

  const signOut = async () => {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    toast.success("Signed out");
    navigate({ to: "/auth", replace: true });
  };

  const isAdminRoute = pathname.startsWith("/admin");

  return (
    <div className="min-h-screen bg-secondary/40">
      {/* Top bar */}
      <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground font-bold">TB</div>
            <span className="text-lg font-bold tracking-tight">TaskBoost</span>
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map(({ to, label, icon: Icon }) => (
              <Link key={to} to={to} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground [&.active]:bg-primary/10 [&.active]:text-primary" activeProps={{ className: "active" }}>
                <Icon className="h-4 w-4" /> {label}
              </Link>
            ))}
            {isAdmin && (
              <Link to="/admin" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground [&.active]:bg-primary/10 [&.active]:text-primary" activeProps={{ className: "active" }}>
                <Shield className="h-4 w-4" /> Admin
              </Link>
            )}
          </nav>
          <div className="flex items-center gap-1">
            <Link to="/notifications" className="relative rounded-lg p-2 hover:bg-secondary">
              <Bell className="h-5 w-5" />
              {unread > 0 && (
                <span className="absolute right-1 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
                  {unread > 9 ? "9+" : unread}
                </span>
              )}
            </Link>
            <Button variant="ghost" size="icon" onClick={signOut} className="hidden md:inline-flex" aria-label="Sign out">
              <LogOut className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileMenu(!mobileMenu)}>
              {mobileMenu ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
        {mobileMenu && (
          <div className="border-t border-border md:hidden">
            <div className="mx-auto max-w-6xl px-4 py-3 space-y-1">
              {isAdmin && (
                <Link to="/admin" onClick={() => setMobileMenu(false)} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium hover:bg-secondary">
                  <Shield className="h-4 w-4" /> Admin
                </Link>
              )}
              <button onClick={signOut} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-destructive hover:bg-secondary">
                <LogOut className="h-4 w-4" /> Sign out
              </button>
            </div>
          </div>
        )}
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-24 pt-6 md:pb-10">
        <Outlet />
      </main>

      {/* Mobile bottom nav */}
      {!isAdminRoute && (
        <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-border bg-background md:hidden">
          <div className="mx-auto grid max-w-6xl grid-cols-5">
            {navItems.map(({ to, label, icon: Icon }) => (
              <Link key={to} to={to} className="flex flex-col items-center gap-1 py-2.5 text-xs text-muted-foreground [&.active]:text-primary" activeProps={{ className: "active" }}>
                <Icon className="h-5 w-5" />
                <span className="font-medium">{label}</span>
              </Link>
            ))}
          </div>
        </nav>
      )}
    </div>
  );
}