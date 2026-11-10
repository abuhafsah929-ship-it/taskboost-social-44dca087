import {
  createFileRoute,
  Link,
  Outlet,
  redirect,
  useNavigate,
  useRouterState,
} from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Bell,
  Home,
  ListTodo,
  LogOut,
  Menu,
  Settings,
  Shield,
  Sparkles,
  Users,
  Wallet,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

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
  const queryClient = useQueryClient();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const [mobileMenu, setMobileMenu] = useState(false);

  const { data: isAdmin } = useQuery({
    queryKey: ["is-admin", user.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();
      return !!data;
    },
  });

  const { data: unread = 0 } = useQuery({
    queryKey: ["unread-notifications", user.id],
    queryFn: async () => {
      const { count } = await supabase
        .from("notifications")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("read", false);
      return count ?? 0;
    },
    refetchInterval: 15000,
  });

  useEffect(() => {
    const { data: subscription } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") navigate({ to: "/auth", replace: true });
    });
    return () => subscription.subscription.unsubscribe();
  }, [navigate]);

  const signOut = async () => {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    toast.success("Signed out");
    navigate({ to: "/auth", replace: true });
  };

  const isAdminRoute = pathname.startsWith("/admin");

  return (
    <div className="min-h-screen bg-[#f7faf9] text-slate-950">
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between gap-4 px-5 sm:px-8">
          <Link
            to="/dashboard"
            aria-label="TaskBoost dashboard"
            className="flex shrink-0 items-center gap-2.5"
          >
            <span className="grid h-10 w-10 place-items-center rounded-[14px] bg-slate-950 text-emerald-300 shadow-lg shadow-slate-950/10">
              <Sparkles className="h-5 w-5" aria-hidden="true" />
            </span>
            <span className="text-[19px] font-extrabold tracking-[-0.06em] text-slate-950">
              task<span className="text-emerald-600">boost</span>
            </span>
          </Link>

          <nav aria-label="Main navigation" className="hidden items-center gap-1 lg:flex">
            {navItems.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className="flex items-center gap-2 rounded-full px-3.5 py-2.5 text-sm font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-950 [&.active]:bg-emerald-50 [&.active]:text-emerald-800"
                activeProps={{ className: "active" }}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                {label}
              </Link>
            ))}
            {isAdmin && (
              <Link
                to="/admin"
                className="flex items-center gap-2 rounded-full px-3.5 py-2.5 text-sm font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-950 [&.active]:bg-emerald-50 [&.active]:text-emerald-800"
                activeProps={{ className: "active" }}
              >
                <Shield className="h-4 w-4" aria-hidden="true" />
                Admin
              </Link>
            )}
          </nav>

          <div className="flex shrink-0 items-center gap-1.5">
            <Link
              to="/notifications"
              aria-label={`Notifications${unread ? `, ${unread} unread` : ""}`}
              className="relative grid h-10 w-10 place-items-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-950"
            >
              <Bell className="h-[18px] w-[18px]" aria-hidden="true" />
              {unread > 0 && (
                <span className="absolute right-1 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-emerald-500 px-1 text-[10px] font-bold text-slate-950 ring-2 ring-white">
                  {unread > 9 ? "9+" : unread}
                </span>
              )}
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={signOut}
              className="hidden rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-950 lg:inline-flex"
              aria-label="Sign out"
            >
              <LogOut className="h-[18px] w-[18px]" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full text-slate-600 hover:bg-slate-100 lg:hidden"
              onClick={() => setMobileMenu((open) => !open)}
              aria-label={mobileMenu ? "Close account menu" : "Open account menu"}
              aria-expanded={mobileMenu}
              aria-controls="account-menu"
            >
              {mobileMenu ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {mobileMenu && (
          <div
            id="account-menu"
            className="border-t border-slate-100 bg-white px-5 py-3 shadow-lg lg:hidden"
          >
            <div className="mx-auto flex max-w-7xl justify-end">
              <button
                onClick={signOut}
                className="flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-950"
              >
                <LogOut className="h-4 w-4" aria-hidden="true" />
                Sign out
              </button>
            </div>
          </div>
        )}
      </header>

      <main className="portal-content mx-auto max-w-7xl px-5 pb-28 pt-8 sm:px-8 md:pb-12 md:pt-10">
        <Outlet />
      </main>

      {!isAdminRoute && (
        <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-slate-200/80 bg-white/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_24px_rgba(15,23,42,0.04)] backdrop-blur-xl lg:hidden">
          <div className="mx-auto grid max-w-7xl grid-cols-5 px-2 sm:px-5">
            {navItems.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className="flex min-h-[68px] flex-col items-center justify-center gap-1.5 text-[11px] font-semibold text-slate-400 transition [&.active]:text-emerald-800 [&.active>span]:bg-emerald-50"
                activeProps={{ className: "active" }}
              >
                <span className="grid h-8 w-12 place-items-center rounded-full transition-colors">
                  <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
                </span>
                <span>{label}</span>
              </Link>
            ))}
          </div>
        </nav>
      )}
    </div>
  );
}
