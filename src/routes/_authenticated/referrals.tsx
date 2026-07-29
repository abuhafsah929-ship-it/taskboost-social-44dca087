import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getSetting } from "@/lib/queries";
import { naira } from "@/lib/currency";
import { Copy, Share2, Users } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/referrals")({
  head: () => ({ meta: [{ title: "Referrals — TaskBoost" }, { name: "description", content: "Invite friends and earn referral bonuses." }] }),
  component: Referrals,
});

function Referrals() {
  const { user } = Route.useRouteContext();
  const { data: profile } = useQuery({
    queryKey: ["profile", user.id],
    queryFn: async () => (await supabase.from("profiles").select("referral_code").eq("id", user.id).maybeSingle()).data,
  });
  const { data: bonus = 0 } = useQuery({ queryKey: ["ref-bonus-cfg"], queryFn: () => getSetting<number>("referral_bonus").then((v) => Number(v ?? 0)) });
  const { data: referrals = [] } = useQuery({
    queryKey: ["my-refs", user.id],
    queryFn: async () => {
      const { data: refs } = await supabase.from("referrals").select("id,bonus_paid,created_at,referee_id").eq("referrer_id", user.id).order("created_at", { ascending: false });
      const rows = refs ?? [];
      if (rows.length === 0) return [] as Array<{ id: string; bonus_paid: number; created_at: string; referee_id: string; name: string | null }>;
      const ids = rows.map((r) => r.referee_id);
      const { data: profs } = await supabase.from("profiles").select("id,full_name,username").in("id", ids);
      const map = new Map((profs ?? []).map((p) => [p.id, p.full_name ?? p.username ?? null]));
      return rows.map((r) => ({ ...r, bonus_paid: Number(r.bonus_paid), name: map.get(r.referee_id) ?? null }));
    },
  });

  const totalEarned = referrals.reduce((s, r) => s + Number(r.bonus_paid), 0);
  const code = profile?.referral_code ?? "";
  const link = typeof window !== "undefined" ? `${window.location.origin}/auth?mode=signup&ref=${code}` : "";

  const copy = async (text: string, label: string) => {
    await navigator.clipboard.writeText(text);
    toast.success(`${label} copied`);
  };

  const share = async () => {
    const text = `Join me on TaskBoost and earn Naira for social media tasks! Use my code ${code}: ${link}`;
    if (navigator.share) {
      try { await navigator.share({ title: "TaskBoost", text, url: link }); } catch { /* dismissed */ }
    } else {
      copy(text, "Message");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Referrals</h1>
        <p className="text-sm text-muted-foreground">Earn {naira(bonus)} for every friend who signs up.</p>
      </div>

      <Card className="overflow-hidden border-0 p-0">
        <div className="p-6 text-primary-foreground" style={{ background: "var(--gradient-primary)" }}>
          <div className="text-sm text-white/80">Your referral code</div>
          <div className="mt-2 flex items-center gap-3">
            <div className="rounded-lg bg-white/15 px-4 py-2 text-2xl font-bold tracking-wider">{code || "…"}</div>
            <Button size="sm" variant="secondary" onClick={() => copy(code, "Code")}><Copy className="mr-1 h-3.5 w-3.5"/>Copy</Button>
          </div>
          <div className="mt-4 rounded-lg bg-white/10 p-2 pl-3 flex items-center gap-2">
            <span className="truncate text-sm text-white/90">{link}</span>
            <Button size="sm" variant="secondary" onClick={() => copy(link, "Link")}><Copy className="h-3.5 w-3.5"/></Button>
          </div>
          <Button className="mt-4 w-full sm:w-auto" variant="secondary" onClick={share}><Share2 className="mr-1 h-4 w-4"/>Share</Button>
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-3">
        <Card className="p-4"><p className="text-xs text-muted-foreground">Total referred</p><p className="mt-1 text-2xl font-bold">{referrals.length}</p></Card>
        <Card className="p-4"><p className="text-xs text-muted-foreground">Bonus earned</p><p className="mt-1 text-2xl font-bold">{naira(totalEarned)}</p></Card>
      </div>

      <Card className="p-5">
        <h2 className="font-semibold">Your referrals</h2>
        <div className="mt-3 divide-y divide-border">
          {referrals.length === 0 && (
            <div className="py-8 text-center text-sm text-muted-foreground">
              <Users className="mx-auto mb-2 h-6 w-6" /> No referrals yet — share your code!
            </div>
          )}
          {referrals.map((r) => (
            <div key={r.id} className="flex items-center justify-between py-3">
              <div>
                <p className="text-sm font-medium">{r.name ?? "New user"}</p>
                <p className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</p>
              </div>
              <span className="text-sm font-semibold text-success">+{naira(r.bonus_paid)}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}