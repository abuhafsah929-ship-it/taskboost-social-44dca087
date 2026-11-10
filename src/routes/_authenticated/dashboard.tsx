import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getBalance, getPendingWithdrawTotal } from "@/lib/queries";
import { naira } from "@/lib/currency";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, ListTodo, Users, Wallet, TrendingUp } from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — TaskBoost" },
      { name: "description", content: "Your TaskBoost earnings dashboard." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { user } = Route.useRouteContext();

  const { data: profile } = useQuery({
    queryKey: ["profile", user.id],
    queryFn: async () =>
      (await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle()).data,
  });
  const { data: balance = 0 } = useQuery({
    queryKey: ["balance", user.id],
    queryFn: () => getBalance(user.id),
  });
  const { data: pending = 0 } = useQuery({
    queryKey: ["pending-w", user.id],
    queryFn: () => getPendingWithdrawTotal(user.id),
  });
  const { data: submissions } = useQuery({
    queryKey: ["my-subs", user.id],
    queryFn: async () =>
      (
        await supabase
          .from("submissions")
          .select("id,status,created_at,tasks(title,reward_naira,platform)")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(5)
      ).data ?? [],
  });
  const { data: refCount = 0 } = useQuery({
    queryKey: ["ref-count", user.id],
    queryFn: async () =>
      (
        await supabase
          .from("referrals")
          .select("id", { count: "exact", head: true })
          .eq("referrer_id", user.id)
      ).count ?? 0,
  });
  const { data: approvedCount = 0 } = useQuery({
    queryKey: ["approved-count", user.id],
    queryFn: async () =>
      (
        await supabase
          .from("submissions")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id)
          .eq("status", "approved")
      ).count ?? 0,
  });

  const available = Math.max(0, balance - pending);

  return (
    <div className="space-y-8">
      <div>
        <h1>Hello, {profile?.full_name?.split(" ")[0] ?? "there"} 👋</h1>
        <p>Here’s your earnings snapshot.</p>
      </div>

      <Card className="overflow-hidden border-0 bg-slate-950 p-0 text-white shadow-xl shadow-slate-900/10">
        <div
          className="relative isolate overflow-hidden p-6 sm:p-8"
          style={{ background: "linear-gradient(135deg, #0f172a 0%, #064e3b 100%)" }}
        >
          <div className="pointer-events-none absolute -right-12 -top-20 h-56 w-56 rounded-full bg-emerald-400/20 blur-[70px]" />
          <div className="pointer-events-none absolute -bottom-28 left-1/3 h-48 w-48 rounded-full bg-blue-400/10 blur-[80px]" />
          <div className="relative">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm font-semibold text-emerald-200">Available balance</p>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.08] px-3 py-1.5 text-xs font-semibold text-white/80">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" /> Account overview
              </span>
            </div>
            <p className="mt-3 text-4xl font-extrabold tracking-[-0.055em] text-white sm:text-5xl">
              {naira(available)}
            </p>
            <p className="mt-2 text-sm text-white/65">
              Total earned {naira(balance)} <span className="mx-1 text-white/30">·</span> Pending
              withdrawal {naira(pending)}
            </p>
            <div className="mt-6 flex flex-wrap gap-2.5">
              <Link to="/tasks">
                <Button
                  size="sm"
                  className="rounded-full bg-emerald-400 px-4 font-bold text-slate-950 hover:bg-emerald-300"
                >
                  Do a task
                </Button>
              </Link>
              <Link to="/withdraw">
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-full border-white/25 bg-white/[0.06] px-4 text-white hover:bg-white/15 hover:text-white"
                >
                  Withdraw
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
        <StatCard icon={ListTodo} label="Tasks completed" value={String(approvedCount)} />
        <StatCard icon={Users} label="Referrals" value={String(refCount)} />
        <StatCard icon={TrendingUp} label="Total earned" value={naira(balance)} />
      </div>

      <Card className="p-5 sm:p-6">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-base">Recent submissions</h2>
          <Link
            to="/earnings"
            className="inline-flex shrink-0 items-center gap-1 text-sm font-bold text-emerald-700 hover:text-emerald-800"
          >
            View all <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="mt-4 divide-y divide-border">
          {(submissions ?? []).length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No submissions yet.{" "}
              <Link to="/tasks" className="font-semibold text-emerald-700 hover:underline">
                Start earning
              </Link>
              .
            </p>
          )}
          {(submissions ?? []).map((submission) => (
            <div key={submission.id} className="flex items-center justify-between gap-4 py-3.5">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">
                  {submission.tasks?.title ?? "Task"}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {new Date(submission.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <span className="text-sm font-bold">
                  {naira(submission.tasks?.reward_naira ?? 0)}
                </span>
                <StatusPill status={submission.status} />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Wallet;
  label: string;
  value: string;
}) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </div>
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
  return (
    <span
      className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-medium capitalize ${map[status] ?? "bg-secondary text-secondary-foreground"}`}
    >
      {status}
    </span>
  );
}
