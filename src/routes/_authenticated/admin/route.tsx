import { createFileRoute, Outlet, redirect, Link, useRouterState } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { LayoutDashboard, ListPlus, CheckSquare, Users2, Banknote } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin")({
  beforeLoad: async ({ context }) => {
    const { data } = await supabase.from("user_roles").select("role").eq("user_id", context.user.id).eq("role", "admin").maybeSingle();
    if (!data) throw redirect({ to: "/dashboard" });
  },
  component: AdminLayout,
});

const tabs = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { to: "/admin/tasks", label: "Tasks", icon: ListPlus },
  { to: "/admin/submissions", label: "Submissions", icon: CheckSquare },
  { to: "/admin/withdrawals", label: "Withdrawals", icon: Banknote },
  { to: "/admin/users", label: "Users", icon: Users2 },
] as const;

function AdminLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Admin</h1>
        <p className="text-sm text-muted-foreground">Manage tasks, users, submissions and payouts.</p>
      </div>
      <div className="flex gap-1 overflow-x-auto rounded-xl border border-border bg-background p-1">
        {tabs.map(({ to, label, icon: Icon, exact }) => {
          const active = exact ? pathname === to : pathname.startsWith(to);
          return (
            <Link key={to} to={to} className={`inline-flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary"}`}>
              <Icon className="h-4 w-4"/> {label}
            </Link>
          );
        })}
      </div>
      <Outlet />
    </div>
  );
}