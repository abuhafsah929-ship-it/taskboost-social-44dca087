import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { naira } from "@/lib/currency";
import { PlatformBadge, platformMeta } from "@/lib/platform-icons";
import { toast } from "sonner";
import { ExternalLink, Loader2, Upload } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type Task = Database["public"]["Tables"]["tasks"]["Row"];

export const Route = createFileRoute("/_authenticated/tasks")({
  head: () => ({ meta: [{ title: "Tasks — TaskBoost" }, { name: "description", content: "Complete social media tasks and earn Naira." }] }),
  component: TasksPage,
});

function TasksPage() {
  const { user } = Route.useRouteContext();
  const [filter, setFilter] = useState<"all" | keyof typeof platformMeta>("all");
  const [selected, setSelected] = useState<Task | null>(null);

  const { data: tasks = [] } = useQuery({
    queryKey: ["tasks", filter],
    queryFn: async () => {
      let q = supabase.from("tasks").select("*").eq("active", true).order("created_at", { ascending: false });
      if (filter !== "all") q = q.eq("platform", filter);
      return (await q).data ?? [];
    },
  });

  const { data: mySubIds = new Set<string>() } = useQuery({
    queryKey: ["my-sub-ids", user.id],
    queryFn: async () => {
      const { data } = await supabase.from("submissions").select("task_id").eq("user_id", user.id);
      return new Set((data ?? []).map((r) => r.task_id));
    },
  });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Tasks</h1>
        <p className="text-sm text-muted-foreground">Complete tasks, submit proof, earn Naira on approval.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        <FilterChip active={filter === "all"} onClick={() => setFilter("all")}>All</FilterChip>
        {(Object.keys(platformMeta) as (keyof typeof platformMeta)[]).map((p) => (
          <FilterChip key={p} active={filter === p} onClick={() => setFilter(p)}>{platformMeta[p].label}</FilterChip>
        ))}
      </div>

      {tasks.length === 0 && (
        <Card className="p-10 text-center text-sm text-muted-foreground">No tasks available right now. Check back soon!</Card>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        {tasks.map((t) => {
          const done = mySubIds.has(t.id);
          const full = t.slots_filled >= t.slots_total;
          return (
            <Card key={t.id} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <PlatformBadge platform={t.platform} />
                  <h3 className="mt-2 font-semibold leading-tight">{t.title}</h3>
                  {t.description && <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{t.description}</p>}
                </div>
                <div className="shrink-0 rounded-lg bg-success/10 px-3 py-1.5 text-sm font-bold text-success">{naira(t.reward_naira)}</div>
              </div>
              <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                <span className="capitalize">{t.task_type}</span>
                <span>{t.slots_filled}/{t.slots_total} slots</span>
              </div>
              <Button className="mt-3 w-full" size="sm" disabled={done || full} onClick={() => setSelected(t)}>
                {done ? "Submitted" : full ? "Full" : "Start task"}
              </Button>
            </Card>
          );
        })}
      </div>

      <SubmitDialog task={selected} onClose={() => setSelected(null)} />
    </div>
  );
}

function FilterChip({ active, children, onClick }: { active: boolean; children: React.ReactNode; onClick: () => void }) {
  return (
    <button onClick={onClick} className={`rounded-full border px-3 py-1.5 text-sm font-medium transition ${active ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background hover:bg-secondary"}`}>{children}</button>
  );
}

function SubmitDialog({ task, onClose }: { task: Task | null; onClose: () => void }) {
  const { user } = Route.useRouteContext();
  const qc = useQueryClient();
  const [proofUrl, setProofUrl] = useState("");
  const [note, setNote] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const submit = useMutation({
    mutationFn: async () => {
      if (!task) return;
      let screenshot_url: string | null = null;
      if (file) {
        const path = `${user.id}/${task.id}-${Date.now()}-${file.name}`;
        const { error: upErr } = await supabase.storage.from("proofs").upload(path, file, { upsert: false });
        if (upErr) throw upErr;
        screenshot_url = path;
      }
      const { error } = await supabase.from("submissions").insert({
        task_id: task.id,
        user_id: user.id,
        proof_url: proofUrl || null,
        screenshot_url,
        admin_note: note || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Submission sent! Awaiting admin approval.");
      qc.invalidateQueries();
      setProofUrl(""); setNote(""); setFile(null);
      onClose();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <Dialog open={!!task} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{task?.title}</DialogTitle>
        </DialogHeader>
        {task && (
          <div className="space-y-4">
            <div className="rounded-lg bg-secondary p-3 text-sm">
              <p className="font-medium">Instructions</p>
              <p className="mt-1 text-muted-foreground">{task.description ?? "Perform the requested action and submit proof below."}</p>
              <a href={task.target_url} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 text-primary hover:underline text-sm font-medium">
                Open link <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
            <div>
              <Label htmlFor="pu">Proof link (your profile / post link)</Label>
              <Input id="pu" value={proofUrl} onChange={(e) => setProofUrl(e.target.value)} placeholder="https://..." />
            </div>
            <div>
              <Label htmlFor="ss">Screenshot (optional)</Label>
              <label className="mt-1 flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-border p-3 text-sm text-muted-foreground hover:bg-secondary">
                <Upload className="h-4 w-4" />
                {file ? file.name : "Upload screenshot"}
                <input id="ss" type="file" accept="image/*" className="hidden" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
              </label>
            </div>
            <div>
              <Label htmlFor="note">Note (optional)</Label>
              <Textarea id="note" value={note} onChange={(e) => setNote(e.target.value)} rows={2} />
            </div>
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => submit.mutate()} disabled={submit.isPending || (!proofUrl && !file)}>
            {submit.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Submit for review
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}