"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  Sparkles,
  Wand2,
  ShieldCheck,
  Zap,
  Compass,
} from "lucide-react";
import { TripForm } from "@/components/TripForm";
import { PackingListView } from "@/components/PackingList";
import { ResultSkeleton } from "@/components/ResultSkeleton";
import { ResultToolbar } from "@/components/ResultToolbar";
import { RateLimitBanner } from "@/components/RateLimitBanner";
import { decodeTrip } from "@/lib/share";
import { loadLastRun, saveLastRun, clearLastRun } from "@/lib/storage";
import type { PackingList, TripInput } from "@/lib/schemas";

export default function Home() {
  return (
    <React.Suspense fallback={null}>
      <HomeInner />
    </React.Suspense>
  );
}

function HomeInner() {
  const searchParams = useSearchParams();

  const [loading, setLoading] = React.useState(false);
  const [input, setInput] = React.useState<TripInput | null>(null);
  const [result, setResult] = React.useState<PackingList | null>(null);
  const [defaults, setDefaults] = React.useState<Partial<TripInput> | undefined>();
  const [resetAt, setResetAt] = React.useState<number | null>(null);

  const resultRef = React.useRef<HTMLDivElement>(null);
  const resultSectionRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const token = searchParams.get("trip");
    if (token) {
      const decoded = decodeTrip(token);
      if (decoded) {
        setDefaults(decoded);
        return;
      }
    }
    const cached = loadLastRun();
    if (cached) {
      setDefaults(cached.input);
      setInput(cached.input);
      setResult(cached.result);
    }
  }, [searchParams]);

  const handleSubmit = async (data: TripInput) => {
    setLoading(true);
    setResult(null);
    setInput(data);
    // Smooth scroll to result on mobile
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      setTimeout(() => {
        resultSectionRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);
    }
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.status === 429) {
        const j = await res.json().catch(() => ({}));
        const reset = Number(j?.resetAt) || Date.now() + 60_000;
        setResetAt(reset);
        toast.error("Daily limit reached", {
          description: "You've used all 3 generations for today.",
        });
        return;
      }

      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        toast.error(j?.error || "Something went wrong");
        return;
      }

      const j = (await res.json()) as { input: TripInput; result: PackingList };
      setResult(j.result);
      setInput(j.input);
      saveLastRun({ input: j.input, result: j.result, generatedAt: Date.now() });
      toast.success("Your packing list is ready");
    } catch (e) {
      console.error(e);
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setInput(null);
    clearLastRun();
  };

  const hasResult = !!(result && input);

  return (
    <div className="relative">
      {/* Aurora background */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[600px] bg-aurora opacity-70"
      />

      <div className="mx-auto w-full max-w-6xl px-4 pb-16 pt-10 sm:px-6 sm:pt-14">
        {/* Hero */}
        <motion.section
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mx-auto mb-10 max-w-3xl text-center"
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/60 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
            <Sparkles className="h-3 w-3 text-amber-500" />
            <span>AI-powered • No signup required</span>
          </div>
          <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Never forget the{" "}
            <span className="text-gradient-brand">small things</span> again.
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-balance text-base leading-relaxed text-muted-foreground sm:text-lg">
            Tell us about your trip — get a thorough, climate-aware packing list
            tuned to the easily-forgotten essentials.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5 text-amber-500" />
              Generated in seconds
            </span>
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
              No login, no tracking
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Compass className="h-3.5 w-3.5 text-sky-500" />
              Climate &amp; culture aware
            </span>
          </div>
        </motion.section>

        {/* Main grid */}
        <div className="grid gap-6 lg:grid-cols-12 lg:gap-8">
          {/* Form column */}
          <motion.aside
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.05 }}
            className="lg:col-span-5 lg:sticky lg:top-20 lg:self-start"
          >
            <div className="rounded-3xl border border-border/60 bg-card/80 p-6 shadow-xl shadow-black/5 backdrop-blur-sm sm:p-7">
              <div className="mb-5 flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Wand2 className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-base font-semibold leading-none">
                    Plan your trip
                  </h2>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Six fields. One smart list.
                  </p>
                </div>
              </div>

              {resetAt && resetAt > Date.now() ? (
                <div className="mb-4">
                  <RateLimitBanner
                    resetAt={resetAt}
                    onReset={() => setResetAt(null)}
                  />
                </div>
              ) : null}

              <TripForm
                onSubmit={handleSubmit}
                loading={loading}
                disabled={!!resetAt && resetAt > Date.now()}
                defaultValues={defaults}
              />
            </div>
          </motion.aside>

          {/* Result column */}
          <section
            ref={resultSectionRef}
            className="scroll-mt-20 lg:col-span-7"
          >
            {loading ? (
              <ResultSkeleton />
            ) : hasResult ? (
              <div className="space-y-4">
                <ResultToolbar
                  input={input!}
                  result={result!}
                  targetRef={resultRef}
                  onReset={handleReset}
                />
                <PackingListView
                  ref={resultRef}
                  input={input!}
                  result={result!}
                />
              </div>
            ) : (
              <EmptyState />
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
  const tips = [
    {
      icon: Compass,
      title: "Climate-aware",
      desc: "Forecasts typical weather for your destination & month.",
    },
    {
      icon: Sparkles,
      title: "Forgotten essentials",
      desc: "Surfaces the small items travelers always forget.",
    },
    {
      icon: ShieldCheck,
      title: "Culturally aware",
      desc: "Respects local dress codes & customs.",
    },
  ];
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.1 }}
      className="flex h-full min-h-[420px] flex-col justify-center rounded-3xl border border-dashed border-border/70 bg-card/40 p-8 backdrop-blur-sm"
    >
      <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500/15 to-indigo-500/15 ring-1 ring-primary/20">
        <Sparkles className="h-6 w-6 text-primary" />
      </div>
      <h3 className="text-center text-lg font-semibold">
        Your packing list will appear here
      </h3>
      <p className="mx-auto mt-1.5 max-w-sm text-center text-sm text-muted-foreground">
        Fill in your trip details and we'll generate a tailored list in seconds.
      </p>
      <div className="mx-auto mt-8 grid w-full max-w-md gap-3 sm:grid-cols-3">
        {tips.map((tip) => {
          const Icon = tip.icon;
          return (
            <div
              key={tip.title}
              className="rounded-xl border border-border/50 bg-background/50 p-3 text-center"
            >
              <Icon className="mx-auto mb-1.5 h-4 w-4 text-primary" />
              <p className="text-xs font-medium">{tip.title}</p>
              <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">
                {tip.desc}
              </p>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
