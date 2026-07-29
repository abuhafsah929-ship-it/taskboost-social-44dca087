import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { getBalance, getPendingWithdrawTotal, getSetting } from "@/lib/queries";
import { naira } from "@/lib/currency";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { StatusPill } from "./dashboard";
import type { Database } from "@/integrations/supabase/types";

type Method = Database["public"]["Enums"]["withdrawal_method"];

export const Route = createFileRoute("/_authenticated/withdraw")({
  head: () => ({ meta: [{ title: "Withdraw — TaskBoost" }, { name: "description", content: "Withdraw your earnings to bank, OPay, or PalmPay." }] }),
  component: Withdraw,
});

function Withdraw() {
  const { user } = Route.useRouteContext();
  const qc = useQueryClient();

  const { data: balance = 0 } = useQuery({ queryKey: ["balance", user.id], queryFn: () => getBalance(user.id) });
  const { data: pending = 0 } = useQuery({ queryKey: ["pending-w", user.id], queryFn: () => getPendingWithdrawTotal(user.id) });
  const { data: minW = 1500 } = useQuery({ queryKey: ["min-w"], queryFn: () => getSetting<number>("min_withdrawal").then((v) => Number(v ?? 1500)) });
  const { data: history = [] } = useQuery({
    queryKey: ["withdrawals", user.id],
    queryFn: async () => (await supabase.from("withdrawals").select("*").eq("user_id", user.id).order("created_at", { ascending: false })).data ?? [],
  });

  const available = Math.max(0, balance - pending);

  const [form, setForm] = useState<{ amount: string; method: Method; account_name: string; account_number: string; bank_name: string }>({
    amount: "",
    method: "bank",
    account_name: "",
    account_number: "",
    bank_name: "",
  });

  const req = useMutation({
    mutationFn: async () => {
      const amt = Number(form.amount);
      if (!amt || amt < minW) throw new Error(`Minimum withdrawal is ${naira(minW)}`);
      if (amt > available) throw new Error("Amount exceeds available balance");
      const { error } = await supabase.from("withdrawals").insert({
        user_id: user.id,
        amount_naira: amt,
        method: form.method,
        account_name: form.account_name,
        account_number: form.account_number,
        bank_name: form.method === "bank" ? form.bank_name : null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Withdrawal request submitted");
      setForm({ ...form, amount: "" });
      qc.invalidateQueries();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Withdraw</h1>
        <p className="text-sm text-muted-foreground">Cash out to bank, OPay, PalmPay or Kuda. Min {naira(minW)}.</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Card className="p-4 border-primary/40 bg-primary/5"><p className="text-xs text-muted-foreground">Available</p><p className="mt-1 text-2xl font-bold">{naira(available)}</p></Card>
        <Card className="p-4"><p className="text-xs text-muted-foreground">Pending</p><p className="mt-1 text-2xl font-bold">{naira(pending)}</p></Card>
      </div>

      <Card className="p-5">
        <h2 className="font-semibold">Request withdrawal</h2>
        <form onSubmit={(e) => { e.preventDefault(); req.mutate(); }} className="mt-4 space-y-4">
          <div>
            <Label htmlFor="amt">Amount (₦)</Label>
            <Input id="amt" type="number" min={minW} required value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder={String(minW)} />
          </div>
          <div>
            <Label>Method</Label>
            <Select value={form.method} onValueChange={(v) => setForm({ ...form, method: v as Method })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="bank">Bank transfer</SelectItem>
                <SelectItem value="opay">OPay</SelectItem>
                <SelectItem value="palmpay">PalmPay</SelectItem>
                <SelectItem value="kuda">Kuda</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="an">Account name</Label>
              <Input id="an" required value={form.account_name} onChange={(e) => setForm({ ...form, account_name: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="anu">Account number</Label>
              <Input id="anu" required inputMode="numeric" value={form.account_number} onChange={(e) => setForm({ ...form, account_number: e.target.value })} />
            </div>
          </div>
          {form.method === "bank" && (
            <div>
              <Label htmlFor="bn">Bank name</Label>
              <Input id="bn" required value={form.bank_name} onChange={(e) => setForm({ ...form, bank_name: e.target.value })} />
            </div>
          )}
          <Button type="submit" className="w-full" disabled={req.isPending}>
            {req.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Request payout
          </Button>
        </form>
      </Card>

      <Card className="p-5">
        <h2 className="font-semibold">Withdrawal history</h2>
        <div className="mt-3 divide-y divide-border">
          {history.length === 0 && <p className="py-6 text-center text-sm text-muted-foreground">No withdrawals yet.</p>}
          {history.map((w) => (
            <div key={w.id} className="flex items-center justify-between py-3">
              <div className="min-w-0">
                <p className="text-sm font-medium">{naira(w.amount_naira)} · <span className="capitalize text-muted-foreground">{w.method}</span></p>
                <p className="text-xs text-muted-foreground">{new Date(w.created_at).toLocaleString()}</p>
                {w.admin_note && <p className="mt-1 text-xs text-muted-foreground italic">Note: {w.admin_note}</p>}
              </div>
              <StatusPill status={w.status} />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}