import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { getBalance, getPendingWithdrawTotal } from "@/lib/queries";
import { naira } from "@/lib/currency";
import { StatusPill } from "./dashboard";

export const Route = createFileRoute("/_authenticated/earnings")({
  head: () => ({ meta: [{ title: "Earnings — TaskBoost" }, { name: "description", content: "Your TaskBoost earnings and history." }] }),
  component: Earnings,
});

function Earnings() {
  const { user } = Route.useRouteContext();
  const { data: balance = 0 } = useQuery({ queryKey: ["balance", user.id], queryFn: () => getBalance(user.id) });
  const { data: pending = 0 } = useQuery({ queryKey: ["pending-w", user.id], queryFn: () => getPendingWithdrawTotal(user.id) });
  const { data: ledger = [] } = useQuery({
    queryKey: ["ledger", user.id],
    queryFn: async () => (await supabase.from("earnings_ledger").select("*").eq("user_id", user.id).order("created_at", { ascending: false })).data ?? [],
  });
  const { data: subs = [] } = useQuery({
    queryKey: ["all-subs", user.id],
    queryFn: async () => (await supabase.from("submissions").select("id,status,created_at,tasks(title,reward_naira,platform)").eq("user_id", user.id).order("created_at", { ascending: false })).data ?? [],
  });

  const approved = subs.filter((s) => s.status === "approved").length;
  const pendingSubs = subs.filter((s) => s.status === "pending").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Earnings</h1>
        <p className="text-sm text-muted-foreground">Track your balance and history.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Available" value={naira(Math.max(0, balance - pending))} accent />
        <Stat label="Total earned" value={naira(balance)} />
        <Stat label="Approved tasks" value={String(approved)} />
        <Stat label="Pending tasks" value={String(pendingSubs)} />
      </div>

      <Card className="p-5">
        <h2 className="font-semibold">Ledger</h2>
        <div className="mt-3 divide-y divide-border">
          {ledger.length === 0 && <p className="py-6 text-center text-sm text-muted-foreground">No earnings yet.</p>}
          {ledger.map((row) => (
            <div key={row.id} className="flex items-center justify-between py-3">
              <div>
                <p className="text-sm font-medium capitalize">{row.source} {row.note ? `— ${row.note}` : ""}</p>
                <p className="text-xs text-muted-foreground">{new Date(row.created_at).toLocaleString()}</p>
              </div>
              <span className={`text-sm font-semibold ${Number(row.amount_naira) < 0 ? "text-destructive" : "text-success"}`}>
                {Number(row.amount_naira) > 0 ? "+" : ""}{naira(row.amount_naira)}
              </span>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-5">
        <h2 className="font-semibold">Submissions</h2>
        <div className="mt-3 divide-y divide-border">
          {subs.length === 0 && <p className="py-6 text-center text-sm text-muted-foreground">No submissions yet.</p>}
          {subs.map((s) => (
            <div key={s.id} className="flex items-center justify-between py-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{s.tasks?.title}</p>
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

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <Card className={`p-4 ${accent ? "border-primary/40 bg-primary/5" : ""}`}>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-xl font-bold">{value}</p>
    </Card>
  );
}