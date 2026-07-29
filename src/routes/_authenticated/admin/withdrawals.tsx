import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { naira } from "@/lib/currency";
import { StatusPill } from "../dashboard";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/withdrawals")({
  head: () => ({ meta: [{ title: "Admin · Withdrawals — TaskBoost" }, { name: "description", content: "Approve and pay out withdrawal requests." }] }),
  component: AdminWithdrawals,
});

function AdminWithdrawals() {
  const { user } = Route.useRouteContext();
  const qc = useQueryClient();
  const [filter, setFilter] = useState<"pending" | "approved" | "paid" | "rejected">("pending");

  const { data: items = [] } = useQuery({
    queryKey: ["a-w", filter],
    queryFn: async () => (await supabase.from("withdrawals").select("*, profiles!inner(full_name,username,phone)").eq("status", filter).order("created_at", { ascending: false })).data ?? [],
  });

  const update = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "approved" | "paid" | "rejected" }) => {
      const { error } = await supabase.from("withdrawals").update({
        status,
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
      }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Updated"); qc.invalidateQueries(); },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        {(["pending","approved","paid","rejected"] as const).map((s) => (
          <button key={s} onClick={() => setFilter(s)} className={`rounded-full px-3 py-1.5 text-sm capitalize font-medium ${filter === s ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}>{s}</button>
        ))}
      </div>
      <div className="space-y-3">
        {items.length === 0 && <Card className="p-8 text-center text-sm text-muted-foreground">No {filter} withdrawals.</Card>}
        {items.map((w) => {
          const p = w.profiles as { full_name?: string; username?: string; phone?: string } | null;
          return (
          <Card key={w.id} className="p-4">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{p?.full_name ?? p?.username} · <span className="text-muted-foreground text-sm">{p?.phone}</span></p>
                <p className="mt-1 text-sm capitalize"><b>{w.method}</b> — {w.account_name} · {w.account_number}{w.bank_name ? ` (${w.bank_name})` : ""}</p>
                <p className="mt-1 text-xs text-muted-foreground">{new Date(w.created_at).toLocaleString()}</p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className="text-xl font-bold">{naira(w.amount_naira)}</span>
                <StatusPill status={w.status} />
                <div className="flex gap-2">
                  {w.status === "pending" && <>
                    <Button size="sm" variant="outline" onClick={() => update.mutate({ id: w.id, status: "rejected" })}>Reject</Button>
                    <Button size="sm" onClick={() => update.mutate({ id: w.id, status: "approved" })}>Approve</Button>
                  </>}
                  {w.status === "approved" && (
                    <Button size="sm" onClick={() => update.mutate({ id: w.id, status: "paid" })}>Mark paid</Button>
                  )}
                </div>
              </div>
            </div>
          </Card>
        )})}
      </div>
    </div>
  );
}