import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({ meta: [{ title: "Profile settings — TaskBoost" }, { name: "description", content: "Manage your TaskBoost profile and security." }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const { user } = Route.useRouteContext();
  const qc = useQueryClient();
  const { data: profile } = useQuery({
    queryKey: ["profile", user.id],
    queryFn: async () => (await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle()).data,
  });
  const [form, setForm] = useState({ full_name: "", username: "", phone: "" });
  const [pw, setPw] = useState("");

  useEffect(() => {
    if (profile) setForm({ full_name: profile.full_name ?? "", username: profile.username ?? "", phone: profile.phone ?? "" });
  }, [profile]);

  const save = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("profiles").update(form).eq("id", user.id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Profile updated"); qc.invalidateQueries({ queryKey: ["profile"] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  const changePw = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.auth.updateUser({ password: pw });
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Password updated"); setPw(""); },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold">Profile & Settings</h1>
        <p className="text-sm text-muted-foreground">Update your information and password.</p>
      </div>

      <Card className="p-5">
        <h2 className="font-semibold">Profile</h2>
        <form onSubmit={(e) => { e.preventDefault(); save.mutate(); }} className="mt-4 space-y-4">
          <div>
            <Label>Email</Label>
            <Input value={user.email ?? ""} disabled />
          </div>
          <div>
            <Label htmlFor="fn">Full name</Label>
            <Input id="fn" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="un">Username</Label>
              <Input id="un" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="ph">Phone</Label>
              <Input id="ph" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
          </div>
          <Button type="submit" disabled={save.isPending}>{save.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}Save changes</Button>
        </form>
      </Card>

      <Card className="p-5">
        <h2 className="font-semibold">Security</h2>
        <form onSubmit={(e) => { e.preventDefault(); changePw.mutate(); }} className="mt-4 space-y-4">
          <div>
            <Label htmlFor="np">New password</Label>
            <Input id="np" type="password" minLength={6} required value={pw} onChange={(e) => setPw(e.target.value)} />
          </div>
          <Button type="submit" disabled={changePw.isPending}>{changePw.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}Update password</Button>
        </form>
      </Card>
    </div>
  );
}