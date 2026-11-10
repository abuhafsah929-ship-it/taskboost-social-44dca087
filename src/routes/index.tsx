import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  Banknote,
  Check,
  ChevronDown,
  CircleCheck,
  Clock3,
  Facebook,
  Instagram,
  Menu,
  Music2,
  ShieldCheck,
  Sparkles,
  UsersRound,
  WalletCards,
  X,
  Youtube,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "TaskBoost — Make your social time pay" },
      {
        name: "description",
        content:
          "Earn naira for simple social media tasks. Join TaskBoost to complete tasks, grow your balance, and withdraw to your Nigerian bank account.",
      },
    ],
  }),
  component: Landing,
});

type Platform = "Instagram" | "TikTok" | "YouTube" | "Facebook" | "X";
type Filter = "All tasks" | Platform;

const taskSamples: {
  platform: Platform;
  title: string;
  detail: string;
  reward: number;
  icon: typeof Instagram;
  tone: string;
}[] = [
  {
    platform: "Instagram",
    title: "Follow a creator",
    detail: "Follow and stay connected",
    reward: 250,
    icon: Instagram,
    tone: "from-fuchsia-500 to-orange-400",
  },
  {
    platform: "TikTok",
    title: "Like a video",
    detail: "A quick tap, a little boost",
    reward: 150,
    icon: Music2,
    tone: "from-slate-950 to-slate-700",
  },
  {
    platform: "YouTube",
    title: "Subscribe to a channel",
    detail: "Support a channel you enjoy",
    reward: 400,
    icon: Youtube,
    tone: "from-red-500 to-rose-600",
  },
  {
    platform: "Facebook",
    title: "Like a public page",
    detail: "Help a local business get seen",
    reward: 200,
    icon: Facebook,
    tone: "from-blue-500 to-blue-700",
  },
  {
    platform: "X",
    title: "Follow an account",
    detail: "Join the conversation",
    reward: 180,
    icon: X,
    tone: "from-slate-950 to-slate-700",
  },
];

const faqs = [
  {
    question: "How does TaskBoost work?",
    answer:
      "Choose an available task, complete the social action, and submit the requested proof. Once your submission is reviewed and approved, the reward is added to your TaskBoost balance.",
  },
  {
    question: "Is it free to join?",
    answer:
      "Yes. Creating an account is free. You can browse available tasks and choose the ones that work for you—there is no subscription fee to get started.",
  },
  {
    question: "How do I withdraw my earnings?",
    answer:
      "When your available balance reaches the minimum withdrawal amount, you can submit a payout request to your supported Nigerian bank account or wallet. Requests are reviewed before payment.",
  },
  {
    question: "When will a task reward show in my balance?",
    answer:
      "Rewards are added after your proof is reviewed and the task is approved. You can track the status of every submission from your dashboard.",
  },
];

const money = (amount: number) => `₦${new Intl.NumberFormat("en-NG").format(amount)}`;

function Landing() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [filter, setFilter] = useState<Filter>("All tasks");
  const [weeklyTasks, setWeeklyTasks] = useState(8);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const filteredTasks =
    filter === "All tasks" ? taskSamples : taskSamples.filter((task) => task.platform === filter);
  const monthlyEstimate = Math.round((weeklyTasks * 250 * 52) / 12);

  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="tb-page min-h-screen overflow-hidden bg-white text-slate-950">
      <div className="bg-slate-950 px-4 py-2.5 text-center text-xs font-medium text-white sm:text-sm">
        <span className="inline-flex items-center gap-2">
          <Sparkles className="h-3.5 w-3.5 text-emerald-300" aria-hidden="true" />
          Your social media time can do more. Start earning for free.
          <Link
            to="/auth"
            search={{ mode: "signup" }}
            className="hidden items-center gap-1 font-semibold text-emerald-300 hover:text-white sm:inline-flex"
          >
            Join TaskBoost <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </span>
      </div>

      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5 sm:px-8">
          <Link to="/" aria-label="TaskBoost home" className="flex items-center gap-2.5">
            <span className="grid h-10 w-10 place-items-center rounded-[14px] bg-slate-950 text-emerald-300 shadow-lg shadow-slate-950/10">
              <Sparkles className="h-5 w-5" aria-hidden="true" />
            </span>
            <span className="text-[19px] font-extrabold tracking-[-0.06em] text-slate-950">
              task<span className="text-emerald-600">boost</span>
            </span>
          </Link>

          <nav aria-label="Main navigation" className="hidden items-center gap-8 md:flex">
            <a
              href="#how-it-works"
              className="text-sm font-medium text-slate-600 transition hover:text-slate-950"
            >
              How it works
            </a>
            <a
              href="#task-board"
              className="text-sm font-medium text-slate-600 transition hover:text-slate-950"
            >
              Explore tasks
            </a>
            <a
              href="#why-taskboost"
              className="text-sm font-medium text-slate-600 transition hover:text-slate-950"
            >
              Why TaskBoost
            </a>
            <a
              href="#faq"
              className="text-sm font-medium text-slate-600 transition hover:text-slate-950"
            >
              FAQs
            </a>
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <Link
              to="/auth"
              className="rounded-full px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-slate-950"
            >
              Sign in
            </Link>
            <Link
              to="/auth"
              search={{ mode: "signup" }}
              className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-5 py-3 text-sm font-bold text-slate-950 shadow-lg shadow-emerald-500/20 transition hover:-translate-y-0.5 hover:bg-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
            >
              Get started <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>

          <button
            type="button"
            className="grid h-10 w-10 place-items-center rounded-full border border-slate-200 text-slate-800 transition hover:bg-slate-50 md:hidden"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {menuOpen && (
          <nav
            id="mobile-navigation"
            aria-label="Mobile navigation"
            className="border-t border-slate-100 bg-white px-5 pb-5 pt-3 shadow-lg md:hidden"
          >
            <div className="mx-auto grid max-w-7xl gap-1">
              {[
                ["How it works", "#how-it-works"],
                ["Explore tasks", "#task-board"],
                ["Why TaskBoost", "#why-taskboost"],
                ["FAQs", "#faq"],
              ].map(([label, href]) => (
                <a
                  key={href}
                  href={href}
                  onClick={closeMenu}
                  className="rounded-xl px-3 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  {label}
                </a>
              ))}
              <Link
                to="/auth"
                search={{ mode: "signup" }}
                onClick={closeMenu}
                className="mt-2 flex items-center justify-center gap-2 rounded-full bg-emerald-500 px-5 py-3 text-sm font-bold text-slate-950"
              >
                Create free account <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </nav>
        )}
      </header>

      <main>
        <section className="relative isolate">
          <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_78%_6%,rgba(110,231,183,0.16),transparent_31%),linear-gradient(180deg,#f7fbf9_0%,#ffffff_90%)]" />
          <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 pb-16 pt-12 sm:px-8 sm:pb-20 sm:pt-16 lg:min-h-[660px] lg:grid-cols-[1.02fr_0.98fr] lg:gap-16 lg:pb-24 lg:pt-20">
            <div className="relative z-10 max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/80 px-3.5 py-2 text-xs font-bold uppercase tracking-[0.13em] text-emerald-800 shadow-sm sm:text-[11px]">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
                Made for creators in Nigeria
              </div>
              <h1 className="mt-6 max-w-[680px] text-[clamp(3.1rem,7vw,5.65rem)] font-black leading-[0.98] tracking-[-0.075em] text-slate-950">
                Make your
                <br className="hidden sm:block" /> social time
                <br />
                <span className="relative inline-block text-emerald-600">
                  pay off.
                  <svg
                    viewBox="0 0 300 18"
                    aria-hidden="true"
                    className="absolute -bottom-2 left-0 h-3 w-full text-emerald-300"
                    preserveAspectRatio="none"
                  >
                    <path
                      d="M3 12C60 3 205 2 296 10"
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeWidth="6"
                    />
                  </svg>
                </span>
              </h1>
              <p className="mt-6 max-w-xl text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
                Turn a few everyday taps into extra income. Complete simple social tasks, earn
                naira, and cash out when you’re ready.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link
                  to="/auth"
                  search={{ mode: "signup" }}
                  className="inline-flex min-h-14 items-center justify-center gap-2 rounded-full bg-emerald-500 px-7 text-sm font-extrabold text-slate-950 shadow-xl shadow-emerald-500/20 transition hover:-translate-y-0.5 hover:bg-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                >
                  Start earning for free <ArrowRight className="h-4 w-4" />
                </Link>
                <a
                  href="#how-it-works"
                  className="inline-flex min-h-14 items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-7 text-sm font-bold text-slate-800 transition hover:border-slate-300 hover:bg-slate-50"
                >
                  See how it works <ArrowDown className="h-4 w-4" />
                </a>
              </div>

              <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-slate-200/80 pt-5 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-emerald-100 text-emerald-700">
                    <Check className="h-4 w-4" />
                  </span>
                  Free to join
                </div>
                <div className="flex items-center gap-2">
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-emerald-100 text-emerald-700">
                    <Check className="h-4 w-4" />
                  </span>
                  Tasks on your terms
                </div>
                <div className="flex items-center gap-2">
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-emerald-100 text-emerald-700">
                    <Check className="h-4 w-4" />
                  </span>
                  Naira rewards
                </div>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-[540px] lg:ml-auto">
              <div className="absolute -right-6 -top-6 h-28 w-28 rounded-full bg-emerald-200/60 blur-3xl sm:-right-10 sm:-top-10 sm:h-40 sm:w-40" />
              <div className="absolute -bottom-8 -left-8 h-36 w-36 rounded-full bg-blue-200/55 blur-3xl" />
              <div className="relative overflow-hidden rounded-[2rem] bg-slate-200 shadow-[0_35px_90px_-35px_rgba(15,23,42,0.35)] ring-1 ring-slate-900/5 sm:rounded-[2.5rem]">
                <img
                  src="/taskboost-creator.webp"
                  alt="A Nigerian creator checking her phone at a bright home workspace"
                  className="aspect-[4/4.35] w-full object-cover object-[54%_center] sm:aspect-[4/4.1]"
                  fetchPriority="high"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-white/5" />
                <div className="absolute bottom-5 left-5 right-5 flex items-center justify-between text-white sm:bottom-7 sm:left-7 sm:right-7">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/75">
                      Your next little win
                    </p>
                    <p className="mt-1 text-lg font-bold sm:text-xl">One task at a time.</p>
                  </div>
                  <span className="grid h-11 w-11 place-items-center rounded-full border border-white/30 bg-white/15 backdrop-blur-md">
                    <ArrowUpRight className="h-5 w-5" />
                  </span>
                </div>
              </div>

              <div className="absolute -left-3 top-8 flex items-center gap-3 rounded-2xl border border-white/80 bg-white/95 p-3.5 shadow-xl shadow-slate-900/10 backdrop-blur sm:-left-10 sm:top-12 sm:p-4">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-100 text-emerald-700">
                  <Banknote className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-[11px] font-medium text-slate-500">Welcome reward</p>
                  <p className="text-base font-extrabold tracking-tight text-slate-950">
                    ₦200 bonus
                  </p>
                </div>
                <CircleCheck className="ml-1 h-4 w-4 text-emerald-500" />
              </div>

              <div className="absolute -right-2 top-[55%] rounded-2xl border border-white/80 bg-white/95 p-3.5 shadow-xl shadow-slate-900/10 backdrop-blur sm:-right-8 sm:p-4">
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-violet-100 text-violet-700">
                    <Instagram className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-[11px] font-medium text-slate-500">Quick task reward</p>
                    <p className="text-base font-extrabold tracking-tight text-slate-950">
                      Earn as you go
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-slate-100 bg-white" aria-label="Supported platforms">
          <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-8 sm:px-8 md:flex-row md:items-center md:justify-between">
            <div className="max-w-xs">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                One account
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-800">
                Five places to find your next task
              </p>
            </div>
            <div className="grid grid-cols-2 gap-x-5 gap-y-4 text-slate-500 sm:flex sm:flex-wrap sm:items-center sm:gap-x-7">
              <PlatformMark icon={Instagram} name="Instagram" tone="text-fuchsia-600" />
              <PlatformMark icon={Music2} name="TikTok" tone="text-slate-950" />
              <PlatformMark icon={Youtube} name="YouTube" tone="text-red-600" />
              <PlatformMark icon={Facebook} name="Facebook" tone="text-blue-600" />
              <PlatformMark icon={X} name="X" tone="text-slate-950" />
            </div>
          </div>
        </section>

        <section
          id="how-it-works"
          className="scroll-mt-24 bg-[#f7faf9] px-5 py-20 sm:px-8 sm:py-28"
        >
          <div className="mx-auto max-w-7xl">
            <SectionIntro
              eyebrow="Simple by design"
              title={
                <>
                  Three small steps.
                  <br className="hidden sm:block" /> A little more in your pocket.
                </>
              }
              description="No complicated setup. Pick up tasks when you have a spare moment, then keep track of every reward in one place."
            />
            <div className="mt-12 grid gap-4 md:grid-cols-3 md:gap-5">
              <StepCard
                number="01"
                icon={UsersRound}
                title="Create your account"
                body="Sign up for free in just a few minutes. Your account keeps tasks, submissions, and rewards together."
                accent="bg-blue-50 text-blue-700"
              />
              <StepCard
                number="02"
                icon={Sparkles}
                title="Choose a task"
                body="Find a social action that suits you. Complete it and send in the proof requested on the task."
                accent="bg-emerald-50 text-emerald-700"
              />
              <StepCard
                number="03"
                icon={WalletCards}
                title="Get your reward"
                body="Once approved, your reward is added to your balance. Request a withdrawal when you’re ready."
                accent="bg-violet-50 text-violet-700"
              />
            </div>
          </div>
        </section>

        <section id="task-board" className="scroll-mt-24 px-5 py-20 sm:px-8 sm:py-28">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <SectionIntro
                eyebrow="A preview of the task board"
                title={
                  <>
                    Pick what fits
                    <br className="hidden sm:block" /> your day.
                  </>
                }
                description="From quick likes to channel follows, discover simple actions you can complete in your own time."
                align="left"
              />
              <Link
                to="/auth"
                search={{ mode: "signup" }}
                className="mb-1 inline-flex w-fit items-center gap-2 text-sm font-bold text-emerald-700 transition hover:gap-3"
              >
                Browse tasks after signup <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div
              className="mt-9 flex gap-2 overflow-x-auto pb-2"
              role="group"
              aria-label="Filter task previews"
            >
              {(["All tasks", "Instagram", "TikTok", "YouTube", "Facebook", "X"] as Filter[]).map(
                (item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setFilter(item)}
                    aria-pressed={filter === item}
                    className={`shrink-0 rounded-full border px-4 py-2.5 text-sm font-semibold transition ${
                      filter === item
                        ? "border-slate-950 bg-slate-950 text-white shadow-md shadow-slate-950/10"
                        : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-950"
                    }`}
                  >
                    {item}
                  </button>
                ),
              )}
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredTasks.map((task) => {
                const Icon = task.icon;
                return (
                  <article
                    key={task.platform}
                    className="group rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-xl hover:shadow-slate-900/5 sm:p-6"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div
                        className={`grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br ${task.tone} text-white shadow-md`}
                      >
                        <Icon className="h-5 w-5" aria-hidden="true" />
                      </div>
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-800">
                        <Sparkles className="h-3.5 w-3.5" /> Sample task
                      </span>
                    </div>
                    <p className="mt-6 text-xs font-bold uppercase tracking-[0.13em] text-slate-400">
                      {task.platform}
                    </p>
                    <h3 className="mt-1 text-lg font-bold tracking-tight text-slate-950">
                      {task.title}
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">{task.detail}</p>
                    <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                      <span className="text-xs font-medium text-slate-500">Example reward</span>
                      <span className="text-lg font-extrabold tracking-tight text-emerald-700">
                        {money(task.reward)}
                      </span>
                    </div>
                  </article>
                );
              })}
            </div>
            <p className="mt-4 text-xs leading-5 text-slate-400">
              Examples shown for illustration. Task availability and rewards may vary.
            </p>
          </div>
        </section>

        <section
          id="why-taskboost"
          className="scroll-mt-24 bg-slate-950 px-5 py-20 text-white sm:px-8 sm:py-24"
        >
          <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-20">
            <div>
              <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-emerald-300">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" /> Your pace, your choice
              </p>
              <h2 className="mt-5 max-w-xl text-4xl font-black leading-[1.05] tracking-[-0.06em] sm:text-5xl">
                Little moments can add up.
              </h2>
              <p className="mt-5 max-w-lg text-base leading-7 text-slate-300">
                Use the time you already spend online to take on bite-sized tasks. See an example
                estimate, then decide what works for you.
              </p>
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <div className="flex items-start gap-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/10 text-emerald-300">
                    <Clock3 className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-sm font-bold">Fit your schedule</p>
                    <p className="mt-1 text-xs leading-5 text-slate-400">
                      Pick tasks when you have a spare moment.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/10 text-emerald-300">
                    <ShieldCheck className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-sm font-bold">Track every step</p>
                    <p className="mt-1 text-xs leading-5 text-slate-400">
                      Follow submissions and rewards in your account.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-5 shadow-2xl shadow-black/20 backdrop-blur sm:p-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-slate-300">Earnings estimator</p>
                  <p className="mt-1 text-xs text-slate-500">A simple example, just for planning</p>
                </div>
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-emerald-400/15 text-emerald-300">
                  <Banknote className="h-5 w-5" />
                </span>
              </div>
              <div className="mt-8 rounded-2xl bg-white/[0.06] p-5 sm:p-6">
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <p className="text-xs font-medium text-slate-400">Tasks per week</p>
                    <p className="mt-1 text-3xl font-extrabold tracking-tight text-white">
                      {weeklyTasks}{" "}
                      <span className="text-base font-medium text-slate-400">tasks</span>
                    </p>
                  </div>
                  <p className="text-right text-xs text-slate-500">
                    Based on an example
                    <br />
                    average reward of ₦250
                  </p>
                </div>
                <input
                  aria-label="Tasks per week"
                  type="range"
                  min="1"
                  max="30"
                  value={weeklyTasks}
                  onChange={(event) => setWeeklyTasks(Number(event.target.value))}
                  className="mt-6 h-2 w-full cursor-pointer accent-emerald-400"
                />
                <div className="mt-2 flex justify-between text-[11px] text-slate-500">
                  <span>1 task</span>
                  <span>30 tasks</span>
                </div>
              </div>
              <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-medium text-slate-400">Illustrative monthly total</p>
                  <p
                    aria-live="polite"
                    className="mt-1 text-4xl font-black tracking-[-0.05em] text-emerald-300 sm:text-5xl"
                  >
                    {money(monthlyEstimate)}
                  </p>
                </div>
                <span className="rounded-full border border-white/10 px-3 py-1.5 text-[11px] font-semibold text-slate-400">
                  Not a guaranteed amount
                </span>
              </div>
              <p className="mt-5 border-t border-white/10 pt-4 text-xs leading-5 text-slate-500">
                Actual rewards depend on the tasks available, their listed rates, and approval of
                your submissions.
              </p>
            </div>
          </div>
        </section>

        <section className="px-5 py-20 sm:px-8 sm:py-28">
          <div className="mx-auto max-w-7xl">
            <SectionIntro
              eyebrow="Built for peace of mind"
              title={
                <>
                  A clearer way to
                  <br className="hidden sm:block" /> earn online.
                </>
              }
              description="The important details stay easy to find, from your current balance to the status of a task you’ve submitted."
            />
            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Benefit
                icon={BadgeCheck}
                title="Clear task details"
                body="Know what to do, what proof is needed, and the listed reward before you begin."
              />
              <Benefit
                icon={WalletCards}
                title="One earnings view"
                body="Keep approved rewards and withdrawal requests together in your account."
              />
              <Benefit
                icon={ShieldCheck}
                title="Reviewed submissions"
                body="Submissions are checked before rewards are added to your balance."
              />
              <Benefit
                icon={UsersRound}
                title="Invite your people"
                body="Share your referral link and earn a referral bonus when eligible friends join."
              />
            </div>
          </div>
        </section>

        <section className="px-5 pb-20 sm:px-8 sm:pb-28">
          <div className="mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-emerald-50">
            <div className="grid items-center gap-8 px-6 py-10 sm:px-10 sm:py-12 lg:grid-cols-[1fr_auto] lg:px-14">
              <div className="max-w-2xl">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-800">
                  A little extra for your circle
                </p>
                <h2 className="mt-3 text-3xl font-black tracking-[-0.055em] text-slate-950 sm:text-4xl">
                  Invite a friend. Grow together.
                </h2>
                <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600 sm:text-base">
                  Share TaskBoost with someone who’d enjoy earning from simple social tasks.
                  Eligible referrals can earn you a ₦300 bonus.
                </p>
              </div>
              <Link
                to="/auth"
                search={{ mode: "signup" }}
                className="inline-flex min-h-12 w-fit items-center justify-center gap-2 rounded-full bg-slate-950 px-6 text-sm font-bold text-white transition hover:bg-slate-800"
              >
                Get your invite link <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        <section id="faq" className="scroll-mt-24 bg-[#f7faf9] px-5 py-20 sm:px-8 sm:py-28">
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.75fr_1.25fr] lg:gap-20">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">
                Good to know
              </p>
              <h2 className="mt-4 text-4xl font-black leading-[1.06] tracking-[-0.06em] text-slate-950 sm:text-5xl">
                Questions?
                <br />
                We’ve got you.
              </h2>
              <p className="mt-5 max-w-sm text-base leading-7 text-slate-600">
                A few quick answers to help you get started with confidence.
              </p>
              <Link
                to="/auth"
                className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-emerald-700 hover:text-emerald-800"
              >
                Get started <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="divide-y divide-slate-200 rounded-3xl border border-slate-200 bg-white px-5 sm:px-7">
              {faqs.map((faq, index) => {
                const expanded = openFaq === index;
                return (
                  <div key={faq.question}>
                    <h3>
                      <button
                        type="button"
                        className="flex w-full items-center justify-between gap-5 py-5 text-left text-sm font-bold text-slate-900 sm:py-6 sm:text-base"
                        aria-expanded={expanded}
                        aria-controls={`faq-answer-${index}`}
                        onClick={() => setOpenFaq(expanded ? null : index)}
                      >
                        {faq.question}
                        <span
                          className={`grid h-8 w-8 shrink-0 place-items-center rounded-full transition ${expanded ? "rotate-180 bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-500"}`}
                        >
                          <ChevronDown className="h-4 w-4" />
                        </span>
                      </button>
                    </h3>
                    <div id={`faq-answer-${index}`} hidden={!expanded}>
                      <p className="-mt-1 max-w-2xl pb-5 pr-8 text-sm leading-6 text-slate-600 sm:pb-6">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="px-5 py-16 sm:px-8 sm:py-24">
          <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-slate-950 px-6 py-12 text-center text-white sm:rounded-[2.5rem] sm:px-12 sm:py-16">
            <div className="pointer-events-none absolute -left-20 -top-24 h-72 w-72 rounded-full bg-emerald-400/20 blur-[90px]" />
            <div className="pointer-events-none absolute -bottom-40 -right-20 h-80 w-80 rounded-full bg-blue-500/20 blur-[100px]" />
            <div className="relative mx-auto max-w-2xl">
              <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-emerald-400 text-slate-950">
                <Sparkles className="h-5 w-5" />
              </span>
              <h2 className="mt-5 text-3xl font-black tracking-[-0.06em] sm:text-5xl">
                Ready to make your time count?
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-slate-300 sm:text-base">
                Create your free account, explore the task board, and see where your next small win
                comes from.
              </p>
              <Link
                to="/auth"
                search={{ mode: "signup" }}
                className="mt-7 inline-flex min-h-14 items-center justify-center gap-2 rounded-full bg-emerald-400 px-7 text-sm font-extrabold text-slate-950 shadow-xl shadow-emerald-400/20 transition hover:-translate-y-0.5 hover:bg-emerald-300"
              >
                Create your free account <ArrowRight className="h-4 w-4" />
              </Link>
              <p className="mt-4 text-xs text-slate-400">
                No subscription. Start when you’re ready.
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white px-5 py-10 sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-7 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link to="/" className="inline-flex items-center gap-2.5">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-slate-950 text-emerald-300">
                <Sparkles className="h-4 w-4" />
              </span>
              <span className="text-lg font-extrabold tracking-[-0.06em] text-slate-950">
                task<span className="text-emerald-600">boost</span>
              </span>
            </Link>
            <p className="mt-2 text-xs text-slate-500">Make your social time count.</p>
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm font-medium text-slate-500">
            <a href="#how-it-works" className="hover:text-slate-950">
              How it works
            </a>
            <a href="#task-board" className="hover:text-slate-950">
              Explore tasks
            </a>
            <a href="#faq" className="hover:text-slate-950">
              FAQs
            </a>
            <Link to="/auth" className="hover:text-slate-950">
              Sign in
            </Link>
          </div>
          <p className="text-xs text-slate-400">
            © {new Date().getFullYear()} TaskBoost. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

function PlatformMark({
  icon: Icon,
  name,
  tone,
}: {
  icon: typeof Instagram;
  name: string;
  tone: string;
}) {
  return (
    <span className="inline-flex min-w-0 items-center gap-2 whitespace-nowrap text-sm font-bold text-slate-600">
      <Icon className={`h-[18px] w-[18px] ${tone}`} aria-hidden="true" /> {name}
    </span>
  );
}

function SectionIntro({
  eyebrow,
  title,
  description,
  align = "center",
}: {
  eyebrow: string;
  title: React.ReactNode;
  description: string;
  align?: "center" | "left";
}) {
  return (
    <div className={`${align === "center" ? "mx-auto text-center" : "text-left"} max-w-2xl`}>
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">{eyebrow}</p>
      <h2 className="mt-4 text-4xl font-black leading-[1.06] tracking-[-0.06em] text-slate-950 sm:text-5xl">
        {title}
      </h2>
      <p className="mt-4 text-sm leading-6 text-slate-600 sm:text-base sm:leading-7">
        {description}
      </p>
    </div>
  );
}

function StepCard({
  number,
  icon: Icon,
  title,
  body,
  accent,
}: {
  number: string;
  icon: typeof UsersRound;
  title: string;
  body: string;
  accent: string;
}) {
  return (
    <article className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-900/5 sm:p-7">
      <div className="flex items-start justify-between">
        <span className={`grid h-12 w-12 place-items-center rounded-2xl ${accent}`}>
          <Icon className="h-5 w-5" />
        </span>
        <span className="text-sm font-extrabold tracking-[0.16em] text-slate-300">{number}</span>
      </div>
      <h3 className="mt-7 text-lg font-bold tracking-tight text-slate-950">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-500">{body}</p>
    </article>
  );
}

function Benefit({
  icon: Icon,
  title,
  body,
}: {
  icon: typeof BadgeCheck;
  title: string;
  body: string;
}) {
  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-5 transition hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-950/5 sm:p-6">
      <span className="grid h-11 w-11 place-items-center rounded-2xl bg-emerald-50 text-emerald-700">
        <Icon className="h-5 w-5" />
      </span>
      <h3 className="mt-5 text-base font-bold tracking-tight text-slate-950">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-500">{body}</p>
    </article>
  );
}
