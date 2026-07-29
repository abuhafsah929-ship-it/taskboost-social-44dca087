import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { naira } from "@/lib/currency";

export const Route = createFileRoute("/_authenticated/admin/")({
  head: () => ({ meta: [{ title: "Admin — TaskBoost" }, { name: "description", content: "TaskBoost admin overview." }] }),
  component: AdminOverview,
});

function AdminOverview() {
  const { data: users = 0 } = useQuery({ queryKey: ["a-users"], queryFn: async () => (await supabase.from("profiles").select("id", { count: "exact", head: true })).count ?? 0 });
  const { data: pendingSubs = 0 } = useQuery({ queryKey: ["a-psubs"], queryFn: async () => (await supabase.from("submissions").select("id", { count: "exact", head: true }).eq("status", "pending")).count ?? 0 });
  const { data: pendingW = 0 } = useQuery({ queryKey: ["a-pw"], queryFn: async () => (await supabase.from("withdrawals").select("id", { count: "exact", head: true }).eq("status", "pending")).count ?? 0 });
  const { data: paidTotal = 0 } = useQuery({
    queryKey: ["a-paid"],
    queryFn: async () => {
      const { data } = await supabase.from("withdrawals").select("amount_naira").eq("status", "paid");
      return (data ?? []).reduce((s, r) => s + Number(r.amount_naira), 0);
    },
  });

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <Stat label="Total users" value={String(users)} />
      <Stat label="Pending submissions" value={String(pendingSubs)} accent />
      <Stat label="Pending withdrawals" value={String(pendingW)} accent />
      <Stat label="Total paid out" value={naira(paidTotal)} />
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <Card className={`p-4 ${accent ? "border-primary/40 bg-primary/5" : ""}`}>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
    </Card>
  );
}