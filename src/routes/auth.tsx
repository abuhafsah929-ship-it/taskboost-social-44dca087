import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Sparkles } from "lucide-react";

const searchSchema = z.object({
  mode: z.enum(["signin", "signup"]).optional(),
  ref: z.string().optional(),
});

export const Route = createFileRoute("/auth")({
  validateSearch: (s) => searchSchema.parse(s),
  head: () => ({
    meta: [
      { title: "Sign in — TaskBoost" },
      { name: "description", content: "Log in or create your TaskBoost account to start earning." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">(search.mode ?? "signin");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    email: "",
    password: "",
    full_name: "",
    username: "",
    phone: "",
    referral_code: search.ref ?? "",
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/dashboard" });
    });
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email: form.email,
          password: form.password,
          options: {
            emailRedirectTo: window.location.origin,
            data: {
              full_name: form.full_name,
              username: form.username,
              phone: form.phone,
              referral_code: form.referral_code || undefined,
            },
          },
        });
        if (error) throw error;
        toast.success("Account created! Welcome to TaskBoost.");
        navigate({ to: "/dashboard" });
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: form.email,
          password: form.password,
        });
        if (error) throw error;
        toast.success("Welcome back!");
        navigate({ to: "/dashboard" });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      toast.error(result.error.message ?? "Google sign-in failed");
      setLoading(false);
      return;
    }
    if (result.redirected) return;
    navigate({ to: "/dashboard" });
  };

  return (
    <div className="grid min-h-screen bg-[#f7faf9] md:grid-cols-2">
      <section
        className="relative hidden min-h-screen flex-col justify-between overflow-hidden p-10 text-white md:flex lg:p-14"
        style={{ background: "linear-gradient(135deg, #0f172a 0%, #064e3b 100%)" }}
      >
        <div className="pointer-events-none absolute -right-20 top-1/4 h-72 w-72 rounded-full bg-emerald-400/20 blur-[90px]" />
        <div className="pointer-events-none absolute -bottom-24 -left-20 h-72 w-72 rounded-full bg-blue-400/10 blur-[90px]" />
        <Link to="/" className="relative flex items-center gap-2.5">
          <span className="grid h-10 w-10 place-items-center rounded-[14px] border border-white/10 bg-white/10 text-emerald-300">
            <Sparkles className="h-5 w-5" />
          </span>
          <span className="text-[19px] font-extrabold tracking-[-0.06em]">
            task<span className="text-emerald-300">boost</span>
          </span>
        </Link>
        <div className="relative max-w-lg">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.07] px-3 py-2 text-xs font-semibold text-emerald-200">
            <Sparkles className="h-3.5 w-3.5" /> Made for creators in Nigeria
          </span>
          <h2 className="mt-6 text-4xl font-black leading-[1.05] tracking-[-0.06em] lg:text-5xl">
            Earn ₦ from your phone.
          </h2>
          <p className="mt-4 max-w-md text-base leading-7 text-white/70">
            Complete simple social media tasks and cash out to your Nigerian bank or wallet.
          </p>
          <div className="mt-8 flex flex-wrap gap-2 text-xs font-semibold text-white/75">
            <span className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-2">
              Free to join
            </span>
            <span className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-2">
              Naira rewards
            </span>
            <span className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-2">
              Flexible tasks
            </span>
          </div>
        </div>
        <p className="relative text-xs text-white/50">© {new Date().getFullYear()} TaskBoost</p>
      </section>

      <div className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-8">
        <Card className="w-full max-w-md rounded-3xl border-slate-200/80 p-6 shadow-xl shadow-slate-900/5 sm:p-8">
          <div className="mb-7 flex items-center gap-2.5 md:hidden">
            <span className="grid h-10 w-10 place-items-center rounded-[14px] bg-slate-950 text-emerald-300">
              <Sparkles className="h-5 w-5" />
            </span>
            <span className="text-[19px] font-extrabold tracking-[-0.06em] text-slate-950">
              task<span className="text-emerald-600">boost</span>
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            {mode === "signin" ? "Welcome back" : "Create your account"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {mode === "signin"
              ? "Sign in to keep earning."
              : "Free forever. Get ₦200 signup bonus."}
          </p>

          <Button
            type="button"
            variant="outline"
            className="mt-6 w-full"
            onClick={handleGoogle}
            disabled={loading}
          >
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </Button>

          <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
            <div className="h-px flex-1 bg-border" /> OR <div className="h-px flex-1 bg-border" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <>
                <div>
                  <Label htmlFor="full_name">Full name</Label>
                  <Input
                    id="full_name"
                    required
                    value={form.full_name}
                    onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      required
                      value={form.username}
                      onChange={(e) => setForm({ ...form, username: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      type="tel"
                      required
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    />
                  </div>
                </div>
              </>
            )}
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                minLength={6}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>
            {mode === "signup" && (
              <div>
                <Label htmlFor="ref">Referral code (optional)</Label>
                <Input
                  id="ref"
                  value={form.referral_code}
                  onChange={(e) =>
                    setForm({ ...form, referral_code: e.target.value.toUpperCase() })
                  }
                />
              </div>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {mode === "signin" ? "Sign in" : "Create account"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {mode === "signin" ? "New to TaskBoost?" : "Already have an account?"}{" "}
            <button
              className="font-medium text-primary hover:underline"
              onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            >
              {mode === "signin" ? "Create account" : "Sign in"}
            </button>
          </p>
        </Card>
      </div>
    </div>
  );
}
