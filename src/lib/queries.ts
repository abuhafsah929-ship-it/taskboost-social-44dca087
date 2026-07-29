import { supabase } from "@/integrations/supabase/client";

export async function getBalance(userId: string): Promise<number> {
  const { data } = await supabase.from("earnings_ledger").select("amount_naira").eq("user_id", userId);
  return (data ?? []).reduce((sum, r) => sum + Number(r.amount_naira), 0);
}

export async function getPendingWithdrawTotal(userId: string): Promise<number> {
  const { data } = await supabase.from("withdrawals").select("amount_naira").eq("user_id", userId).in("status", ["pending", "approved"]);
  return (data ?? []).reduce((s, r) => s + Number(r.amount_naira), 0);
}

export async function getSetting<T = unknown>(key: string): Promise<T | null> {
  const { data } = await supabase.from("settings").select("value").eq("key", key).maybeSingle();
  return (data?.value as T) ?? null;
}