"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

  // Hydrate from share link or localStorage on mount
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
      toast.success("Packing list ready");
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

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:py-12">
      <motion.section
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-2xl shadow-slate-950/20 backdrop-blur-xl"
      >
        <div className="pointer-events-none absolute -top-16 -right-16 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-secondary/15 blur-3xl" />

        <div className="relative text-center sm:text-left">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-primary shadow-sm shadow-primary/10">
            AI travel pack builder
          </div>
          <h1 className="mt-5 text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Smart travel packing, in seconds.
          </h1>
          <div className="mt-6 flex flex-wrap justify-center gap-3 text-xs text-slate-300 sm:justify-start">
            <span className="rounded-full bg-slate-900/70 px-3 py-1">Fast setup</span>
            <span className="rounded-full bg-slate-900/70 px-3 py-1">Minimal lists</span>
            <span className="rounded-full bg-slate-900/70 px-3 py-1">Trip-ready</span>
          </div>
        </div>
      </motion.section>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Form */}
        <Card className="lg:col-span-2 border-white/10 bg-slate-950/90 shadow-xl shadow-slate-950/20">
          <CardHeader>
            <CardTitle className="text-lg">Trip details</CardTitle>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>

        {/* Result */}
        <div className="lg:col-span-3">
          {loading ? (
            <ResultSkeleton />
          ) : result && input ? (
            <div className="space-y-4">
              <ResultToolbar
                input={input}
                result={result}
                targetRef={resultRef}
                onReset={handleReset}
              />
              <PackingListView ref={resultRef} input={input} result={result} />
            </div>
          ) : (
            <EmptyState />
          )}
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex h-full min-h-[280px] flex-col items-center justify-center rounded-[1.5rem] border border-dashed border-white/10 bg-slate-950/70 p-10 text-center shadow-lg shadow-slate-950/20">
      <p className="text-sm text-slate-300">
        Your packing list will appear here.
      </p>
      <p className="mt-2 text-sm text-slate-400">
        Fill in the trip details and hit <span className="font-semibold text-white">Generate</span>.
      </p>
      <div className="mt-6 rounded-full bg-slate-900/70 px-4 py-2 text-xs uppercase tracking-[0.22em] text-slate-300">
        Ready when you are
      </div>
    </div>
  );
}
