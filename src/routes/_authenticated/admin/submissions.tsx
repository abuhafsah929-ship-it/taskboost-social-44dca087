import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { naira } from "@/lib/currency";
import { StatusPill } from "../dashboard";
import { toast } from "sonner";
import { ExternalLink } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/submissions")({
  head: () => ({ meta: [{ title: "Admin · Submissions — TaskBoost" }, { name: "description", content: "Approve or reject task submissions." }] }),
  component: AdminSubs,
});

function AdminSubs() {
  const { user } = Route.useRouteContext();
  const qc = useQueryClient();
  const [filter, setFilter] = useState<"pending" | "approved" | "rejected">("pending");

  const { data: subs = [] } = useQuery({
    queryKey: ["a-subs", filter],
    queryFn: async () => (await supabase.from("submissions").select("*, tasks(title,reward_naira,platform,target_url), profiles!inner(full_name,username)").eq("status", filter).order("created_at", { ascending: false })).data ?? [],
  });

  const decide = useMutation({
    mutationFn: async ({ id, approve }: { id: string; approve: boolean }) => {
      const { error } = await supabase.from("submissions").update({
        status: approve ? "approved" : "rejected",
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
      }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Updated"); qc.invalidateQueries(); },
    onError: (e: Error) => toast.error(e.message),
  });

  const openScreenshot = async (path: string | null) => {
    if (!path) return;
    const { data } = await supabase.storage.from("proofs").createSignedUrl(path, 300);
    if (data?.signedUrl) window.open(data.signedUrl, "_blank");
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {(["pending","approved","rejected"] as const).map((s) => (
          <button key={s} onClick={() => setFilter(s)} className={`rounded-full px-3 py-1.5 text-sm capitalize font-medium ${filter === s ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}>{s}</button>
        ))}
      </div>
      <div className="space-y-3">
        {subs.length === 0 && <Card className="p-8 text-center text-sm text-muted-foreground">No {filter} submissions.</Card>}
        {subs.map((s) => (
          <Card key={s.id} className="p-4">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-semibold">{s.tasks?.title}</p>
                  <StatusPill status={s.status} />
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">by {(s.profiles as { full_name?: string; username?: string } | null)?.full_name ?? (s.profiles as { username?: string } | null)?.username ?? "user"} · {new Date(s.created_at).toLocaleString()}</p>
                <div className="mt-2 flex flex-wrap gap-3 text-xs">
                  {s.proof_url && <a href={s.proof_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline">Proof link <ExternalLink className="h-3 w-3"/></a>}
                  {s.screenshot_url && <button onClick={() => openScreenshot(s.screenshot_url)} className="inline-flex items-center gap-1 text-primary hover:underline">View screenshot <ExternalLink className="h-3 w-3"/></button>}
                  {s.tasks?.target_url && <a href={s.tasks.target_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-muted-foreground hover:underline">Task URL <ExternalLink className="h-3 w-3"/></a>}
                </div>
                {s.admin_note && <p className="mt-2 text-xs italic text-muted-foreground">Note: {s.admin_note}</p>}
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className="font-bold text-success">{naira(s.tasks?.reward_naira ?? 0)}</span>
                {s.status === "pending" && (
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => decide.mutate({ id: s.id, approve: false })}>Reject</Button>
                    <Button size="sm" onClick={() => decide.mutate({ id: s.id, approve: true })}>Approve</Button>
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}