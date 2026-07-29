import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Facebook, Instagram, Youtube, Music2, Twitter, Wallet, Users, ShieldCheck, Zap } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground font-bold">TB</div>
            <span className="text-lg font-bold tracking-tight">TaskBoost</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
            <a href="#how" className="hover:text-foreground">How it works</a>
            <a href="#platforms" className="hover:text-foreground">Platforms</a>
            <a href="#faq" className="hover:text-foreground">FAQ</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link to="/auth"><Button variant="ghost" size="sm">Sign in</Button></Link>
            <Link to="/auth" search={{ mode: "signup" }}><Button size="sm">Get started</Button></Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10" style={{ background: "var(--gradient-hero)" }} />
        <div className="mx-auto max-w-6xl px-4 py-20 sm:py-28 text-primary-foreground">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium backdrop-blur">
              <Zap className="h-3.5 w-3.5" /> Nigeria's #1 social earning platform
            </div>
            <h1 className="mt-5 text-4xl sm:text-6xl font-bold leading-tight tracking-tight">
              Get paid in Naira for simple social media tasks.
            </h1>
            <p className="mt-5 text-lg text-white/85">
              Like posts, follow pages, subscribe to channels — earn ₦ instantly. Cash out to your bank, OPay, or PalmPay.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/auth" search={{ mode: "signup" }}>
                <Button size="lg" variant="secondary" className="font-semibold">Start earning free</Button>
              </Link>
              <a href="#how"><Button size="lg" variant="outline" className="border-white/40 bg-white/10 text-white hover:bg-white/20">See how it works</Button></a>
            </div>
            <div className="mt-8 flex flex-wrap gap-6 text-sm text-white/85">
              <span className="inline-flex items-center gap-2"><CheckCircle2 className="h-4 w-4"/>₦200 signup bonus</span>
              <span className="inline-flex items-center gap-2"><CheckCircle2 className="h-4 w-4"/>₦300 per referral</span>
              <span className="inline-flex items-center gap-2"><CheckCircle2 className="h-4 w-4"/>Withdraw from ₦1,500</span>
            </div>
          </div>
        </div>
      </section>

      {/* Platforms */}
      <section id="platforms" className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-center text-2xl sm:text-3xl font-bold">Earn across every major platform</h2>
        <p className="mt-2 text-center text-muted-foreground">Pick a task, complete the action, submit proof, get paid.</p>
        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-5">
          {[
            { icon: Facebook, label: "Facebook", color: "#1877F2" },
            { icon: Instagram, label: "Instagram", color: "#E1306C" },
            { icon: Music2, label: "TikTok", color: "#000000" },
            { icon: Youtube, label: "YouTube", color: "#FF0000" },
            { icon: Twitter, label: "X", color: "#000000" },
          ].map(({ icon: Icon, label, color }) => (
            <div key={label} className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-card p-6 shadow-sm">
              <Icon className="h-8 w-8" style={{ color }} />
              <span className="text-sm font-medium">{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="bg-secondary/50 py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-center text-2xl sm:text-3xl font-bold">Start earning in 3 steps</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {[
              { icon: Users, title: "1. Create your free account", body: "Sign up in seconds and claim your welcome bonus." },
              { icon: Zap, title: "2. Complete tasks", body: "Follow, like, and subscribe. Upload a screenshot as proof." },
              { icon: Wallet, title: "3. Withdraw to your account", body: "Cash out to any Nigerian bank, OPay, or PalmPay." },
            ].map(({ icon: Icon, title, body }) => (
              <div key={title} className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-lg font-semibold">{title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust */}
      <section className="mx-auto max-w-6xl px-4 py-16 grid gap-6 md:grid-cols-3">
        {[
          { icon: ShieldCheck, title: "Secure & verified", body: "Bank-grade auth keeps your account and earnings safe." },
          { icon: Wallet, title: "Fast payouts", body: "Approved withdrawals paid within 24 hours on business days." },
          { icon: Users, title: "Grow with referrals", body: "Earn ₦300 for every friend you invite who signs up." },
        ].map(({ icon: Icon, title, body }) => (
          <div key={title} className="rounded-2xl border border-border p-6">
            <Icon className="h-6 w-6 text-primary" />
            <h3 className="mt-3 font-semibold">{title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{body}</p>
          </div>
        ))}
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 pb-20">
        <div className="rounded-3xl p-10 text-center text-primary-foreground" style={{ background: "var(--gradient-primary)" }}>
          <h2 className="text-3xl font-bold">Ready to turn your scrolling into cash?</h2>
          <p className="mt-2 text-white/90">Join thousands earning with TaskBoost. Free forever.</p>
          <div className="mt-6 flex justify-center">
            <Link to="/auth" search={{ mode: "signup" }}>
              <Button size="lg" variant="secondary" className="font-semibold">Create free account</Button>
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} TaskBoost. All rights reserved.
      </footer>
    </div>
  );
}
