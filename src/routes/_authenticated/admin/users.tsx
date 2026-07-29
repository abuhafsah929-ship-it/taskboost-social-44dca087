import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { toast } from "sonner";
import { Shield, ShieldOff } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/users")({
  head: () => ({ meta: [{ title: "Admin · Users — TaskBoost" }, { name: "description", content: "Manage TaskBoost users." }] }),
  component: AdminUsers,
});

function AdminUsers() {
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const { data: users = [] } = useQuery({
    queryKey: ["a-users-list", q],
    queryFn: async () => {
      let query = supabase.from("profiles").select("id,full_name,username,phone,created_at,referral_code").order("created_at", { ascending: false }).limit(100);
      if (q) query = query.or(`full_name.ilike.%${q}%,username.ilike.%${q}%,phone.ilike.%${q}%`);
      return (await query).data ?? [];
    },
  });
  const { data: adminIds = new Set<string>() } = useQuery({
    queryKey: ["a-admins"],
    queryFn: async () => {
      const { data } = await supabase.from("user_roles").select("user_id").eq("role", "admin");
      return new Set((data ?? []).map((r) => r.user_id));
    },
  });

  const toggleAdmin = useMutation({
    mutationFn: async ({ id, make }: { id: string; make: boolean }) => {
      if (make) {
        const { error } = await supabase.from("user_roles").insert({ user_id: id, role: "admin" });
        if (error) throw error;
      } else {
        const { error } = await supabase.from("user_roles").delete().eq("user_id", id).eq("role", "admin");
        if (error) throw error;
      }
    },
    onSuccess: () => { toast.success("Role updated"); qc.invalidateQueries(); },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-4">
      <Input placeholder="Search users…" value={q} onChange={(e) => setQ(e.target.value)} className="max-w-sm" />
      <Card>
        <div className="divide-y divide-border">
          {users.map((u) => {
            const isAdmin = adminIds.has(u.id);
            return (
              <div key={u.id} className="flex items-center justify-between p-4 gap-3">
                <div className="min-w-0">
                  <p className="font-medium truncate">{u.full_name ?? u.username}</p>
                  <p className="text-xs text-muted-foreground">@{u.username} · {u.phone} · code {u.referral_code}</p>
                </div>
                <Button size="sm" variant={isAdmin ? "outline" : "secondary"} onClick={() => toggleAdmin.mutate({ id: u.id, make: !isAdmin })}>
                  {isAdmin ? <><ShieldOff className="mr-1 h-4 w-4"/>Revoke admin</> : <><Shield className="mr-1 h-4 w-4"/>Make admin</>}
                </Button>
              </div>
            );
          })}
          {users.length === 0 && <p className="p-8 text-center text-sm text-muted-foreground">No users.</p>}
        </div>
      </Card>
    </div>
  );
}