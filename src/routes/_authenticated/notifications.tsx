import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, Check } from "lucide-react";

export const Route = createFileRoute("/_authenticated/notifications")({
  head: () => ({ meta: [{ title: "Notifications — TaskBoost" }, { name: "description", content: "Your TaskBoost notifications." }] }),
  component: NotificationsPage,
});

function NotificationsPage() {
  const { user } = Route.useRouteContext();
  const qc = useQueryClient();
  const { data: items = [] } = useQuery({
    queryKey: ["notifications", user.id],
    queryFn: async () => (await supabase.from("notifications").select("*").eq("user_id", user.id).order("created_at", { ascending: false })).data ?? [],
  });
  const markAll = useMutation({
    mutationFn: async () => { await supabase.from("notifications").update({ read: true }).eq("user_id", user.id).eq("read", false); },
    onSuccess: () => qc.invalidateQueries(),
  });

  return (
    <div className="space-y-5 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Notifications</h1>
          <p className="text-sm text-muted-foreground">Task updates and payout activity.</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => markAll.mutate()} disabled={markAll.isPending}><Check className="mr-1 h-4 w-4"/>Mark all read</Button>
      </div>
      <Card className="divide-y divide-border">
        {items.length === 0 && (
          <div className="p-10 text-center text-sm text-muted-foreground"><Bell className="mx-auto mb-2 h-6 w-6"/>No notifications yet.</div>
        )}
        {items.map((n) => (
          <div key={n.id} className={`p-4 ${!n.read ? "bg-primary/5" : ""}`}>
            <div className="flex items-start gap-3">
              {!n.read && <span className="mt-1.5 h-2 w-2 rounded-full bg-primary"/>}
              <div className="min-w-0 flex-1">
                <p className="font-medium text-sm">{n.title}</p>
                {n.body && <p className="mt-0.5 text-sm text-muted-foreground">{n.body}</p>}
                <p className="mt-1 text-xs text-muted-foreground">{new Date(n.created_at).toLocaleString()}</p>
              </div>
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
}