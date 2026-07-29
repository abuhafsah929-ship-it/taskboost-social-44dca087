import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getBalance, getPendingWithdrawTotal } from "@/lib/queries";
import { naira } from "@/lib/currency";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, ListTodo, Users, Wallet, TrendingUp } from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — TaskBoost" }, { name: "description", content: "Your TaskBoost earnings dashboard." }] }),
  component: Dashboard,
});

function Dashboard() {
  const { user } = Route.useRouteContext();

  const { data: profile } = useQuery({
    queryKey: ["profile", user.id],
    queryFn: async () => (await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle()).data,
  });
  const { data: balance = 0 } = useQuery({ queryKey: ["balance", user.id], queryFn: () => getBalance(user.id) });
  const { data: pending = 0 } = useQuery({ queryKey: ["pending-w", user.id], queryFn: () => getPendingWithdrawTotal(user.id) });
  const { data: submissions } = useQuery({
    queryKey: ["my-subs", user.id],
    queryFn: async () => (await supabase.from("submissions").select("id,status,created_at,tasks(title,reward_naira,platform)").eq("user_id", user.id).order("created_at", { ascending: false }).limit(5)).data ?? [],
  });
  const { data: refCount = 0 } = useQuery({
    queryKey: ["ref-count", user.id],
    queryFn: async () => (await supabase.from("referrals").select("id", { count: "exact", head: true }).eq("referrer_id", user.id)).count ?? 0,
  });
  const { data: approvedCount = 0 } = useQuery({
    queryKey: ["approved-count", user.id],
    queryFn: async () => (await supabase.from("submissions").select("id", { count: "exact", head: true }).eq("user_id", user.id).eq("status", "approved")).count ?? 0,
  });

  const available = Math.max(0, balance - pending);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Hello, {profile?.full_name?.split(" ")[0] ?? "there"} 👋</h1>
        <p className="text-sm text-muted-foreground">Here's your earnings snapshot.</p>
      </div>

      {/* Balance hero */}
      <Card className="overflow-hidden border-0 p-0">
        <div className="p-6 text-primary-foreground" style={{ background: "var(--gradient-primary)" }}>
          <div className="text-sm/none text-white/80">Available balance</div>
          <div className="mt-2 text-4xl font-bold tracking-tight">{naira(available)}</div>
          <div className="mt-1 text-xs text-white/75">Total earned: {naira(balance)} · Pending withdrawal: {naira(pending)}</div>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link to="/tasks"><Button variant="secondary" size="sm">Do a task</Button></Link>
            <Link to="/withdraw"><Button size="sm" variant="outline" className="border-white/40 bg-white/10 text-white hover:bg-white/20">Withdraw</Button></Link>
          </div>
        </div>
      </Card>

      {/* Quick stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <StatCard icon={ListTodo} label="Tasks completed" value={String(approvedCount)} />
        <StatCard icon={Users} label="Referrals" value={String(refCount)} />
        <StatCard icon={TrendingUp} label="Total earned" value={naira(balance)} />
      </div>

      {/* Recent activity */}
      <Card className="p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Recent submissions</h2>
          <Link to="/earnings" className="text-sm text-primary hover:underline inline-flex items-center gap-1">View all <ArrowUpRight className="h-3.5 w-3.5"/></Link>
        </div>
        <div className="mt-3 divide-y divide-border">
          {(submissions ?? []).length === 0 && <p className="py-6 text-sm text-muted-foreground text-center">No submissions yet. <Link to="/tasks" className="text-primary hover:underline">Start earning</Link>.</p>}
          {(submissions ?? []).map((s) => (
            <div key={s.id} className="flex items-center justify-between py-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{s.tasks?.title ?? "Task"}</p>
                <p className="text-xs text-muted-foreground">{new Date(s.created_at).toLocaleDateString()}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold">{naira(s.tasks?.reward_naira ?? 0)}</span>
                <StatusPill status={s.status} />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function StatCard({ icon: Icon, label, value }: { icon: typeof Wallet; label: string; value: string }) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary"><Icon className="h-5 w-5"/></div>
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="truncate text-lg font-semibold">{value}</p>
        </div>
      </div>
    </Card>
  );
}

export function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending: "bg-warning/15 text-warning-foreground border-warning/30",
    approved: "bg-success/15 text-success border-success/30",
    rejected: "bg-destructive/15 text-destructive border-destructive/30",
    paid: "bg-primary/15 text-primary border-primary/30",
  };
  return <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-medium capitalize ${map[status] ?? "bg-secondary text-secondary-foreground"}`}>{status}</span>;
}