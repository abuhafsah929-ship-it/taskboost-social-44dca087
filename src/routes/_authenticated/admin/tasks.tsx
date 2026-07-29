import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";
import { naira } from "@/lib/currency";
import { PlatformBadge, platformMeta } from "@/lib/platform-icons";
import { Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type Platform = Database["public"]["Enums"]["task_platform"];
type TaskType = Database["public"]["Enums"]["task_type"];

export const Route = createFileRoute("/_authenticated/admin/tasks")({
  head: () => ({ meta: [{ title: "Admin · Tasks — TaskBoost" }, { name: "description", content: "Create and manage tasks." }] }),
  component: AdminTasks,
});

function AdminTasks() {
  const { user } = Route.useRouteContext();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    title: "", description: "", platform: "facebook" as Platform, task_type: "follow" as TaskType,
    target_url: "", reward_naira: "50", slots_total: "100",
  });
  const { data: tasks = [] } = useQuery({
    queryKey: ["a-tasks"],
    queryFn: async () => (await supabase.from("tasks").select("*").order("created_at", { ascending: false })).data ?? [],
  });

  const create = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("tasks").insert({
        title: form.title,
        description: form.description || null,
        platform: form.platform,
        task_type: form.task_type,
        target_url: form.target_url,
        reward_naira: Number(form.reward_naira),
        slots_total: Number(form.slots_total),
        created_by: user.id,
        active: true,
      });
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Task created"); qc.invalidateQueries(); setOpen(false); setForm({ ...form, title: "", description: "", target_url: "" }); },
    onError: (e: Error) => toast.error(e.message),
  });

  const toggle = useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      const { error } = await supabase.from("tasks").update({ active }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["a-tasks"] }),
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="mr-1 h-4 w-4"/>New task</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create task</DialogTitle></DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); create.mutate(); }} className="space-y-3">
              <div><Label>Title</Label><Input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
              <div><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Platform</Label>
                  <Select value={form.platform} onValueChange={(v) => setForm({ ...form, platform: v as Platform })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {(Object.keys(platformMeta) as Platform[]).map((p) => (
                        <SelectItem key={p} value={p}>{platformMeta[p].label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Type</Label>
                  <Select value={form.task_type} onValueChange={(v) => setForm({ ...form, task_type: v as TaskType })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {(["follow","like","subscribe","comment","share","view"] as TaskType[]).map((t) => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div><Label>Target URL</Label><Input required type="url" value={form.target_url} onChange={(e) => setForm({ ...form, target_url: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Reward (₦)</Label><Input required type="number" min={1} value={form.reward_naira} onChange={(e) => setForm({ ...form, reward_naira: e.target.value })} /></div>
                <div><Label>Slots</Label><Input required type="number" min={1} value={form.slots_total} onChange={(e) => setForm({ ...form, slots_total: e.target.value })} /></div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={create.isPending}>{create.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}Create</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {tasks.map((t) => (
          <Card key={t.id} className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <PlatformBadge platform={t.platform} />
                <h3 className="mt-2 font-semibold">{t.title}</h3>
                <p className="mt-1 text-xs text-muted-foreground truncate">{t.target_url}</p>
              </div>
              <span className="rounded-lg bg-success/10 px-2 py-1 text-sm font-bold text-success">{naira(t.reward_naira)}</span>
            </div>
            <div className="mt-3 flex items-center justify-between text-xs">
              <span className="text-muted-foreground">{t.slots_filled}/{t.slots_total} used</span>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Active</span>
                <Switch checked={t.active} onCheckedChange={(v) => toggle.mutate({ id: t.id, active: v })} />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}