"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shirt,
  SprayCan,
  Smartphone,
  FileText,
  Glasses,
  Sparkles,
  Lightbulb,
  ListChecks,
  Check,
  type LucideIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import type { PackingCategory, PackingList, TripInput } from "@/lib/schemas";

type CategoryName = PackingCategory["name"];

const CATEGORY_META: Record<
  CategoryName,
  {
    icon: LucideIcon;
    accent: string;
    iconBg: string;
    ring: string;
  }
> = {
  Clothing: {
    icon: Shirt,
    accent: "from-sky-500/15 to-sky-500/0",
    iconBg: "bg-sky-500/15 text-sky-600 dark:text-sky-400",
    ring: "ring-sky-500/20",
  },
  Toiletries: {
    icon: SprayCan,
    accent: "from-emerald-500/15 to-emerald-500/0",
    iconBg: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
    ring: "ring-emerald-500/20",
  },
  Electronics: {
    icon: Smartphone,
    accent: "from-indigo-500/15 to-indigo-500/0",
    iconBg: "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400",
    ring: "ring-indigo-500/20",
  },
  Documents: {
    icon: FileText,
    accent: "from-amber-500/15 to-amber-500/0",
    iconBg: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
    ring: "ring-amber-500/20",
  },
  Accessories: {
    icon: Glasses,
    accent: "from-rose-500/15 to-rose-500/0",
    iconBg: "bg-rose-500/15 text-rose-600 dark:text-rose-400",
    ring: "ring-rose-500/20",
  },
  "Special Items": {
    icon: Sparkles,
    accent: "from-fuchsia-500/15 to-fuchsia-500/0",
    iconBg: "bg-fuchsia-500/15 text-fuchsia-600 dark:text-fuchsia-400",
    ring: "ring-fuchsia-500/20",
  },
};

function itemKey(catIdx: number, itemIdx: number) {
  return `${catIdx}:${itemIdx}`;
}

export const PackingListView = React.forwardRef<
  HTMLDivElement,
  { input: TripInput; result: PackingList }
>(function PackingListView({ input, result }, ref) {
  const [checked, setChecked] = React.useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = React.useState<CategoryName | "all">("all");

  const total = React.useMemo(
    () => result.categories.reduce((acc, c) => acc + c.items.length, 0),
    [result]
  );
  const packed = Object.values(checked).filter(Boolean).length;
  const pct = total === 0 ? 0 : Math.round((packed / total) * 100);

  const visibleCategories =
    activeTab === "all"
      ? result.categories
      : result.categories.filter((c) => c.name === activeTab);

  const tabs: (CategoryName | "all")[] = [
    "all",
    ...result.categories.map((c) => c.name),
  ];

  return (
    <div ref={ref} className="space-y-5">
      {/* Trip summary header */}
      <div className="rounded-2xl border bg-gradient-to-br from-card to-card/50 p-5 shadow-sm">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <Badge className="bg-primary/10 text-primary hover:bg-primary/15">
            {input.destination}
          </Badge>
          <Badge variant="outline">
            {input.days} day{input.days === 1 ? "" : "s"}
          </Badge>
          <Badge variant="outline">{input.month}</Badge>
          <Badge variant="outline" className="capitalize">
            {input.tripType}
          </Badge>
          <Badge variant="outline" className="capitalize">
            {input.transport}
          </Badge>
        </div>
        <p className="flex items-start gap-2 text-sm leading-relaxed text-muted-foreground">
          <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
          <span>{result.summary}</span>
        </p>
      </div>

      {/* Progress */}
      <div className="rounded-2xl border bg-card p-4 shadow-sm">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="flex items-center gap-1.5 font-medium">
            <ListChecks className="h-4 w-4 text-primary" />
            Packing progress
          </span>
          <span className="tabular-nums text-muted-foreground">
            <span className="font-semibold text-foreground">{packed}</span>
            <span className="mx-1 opacity-50">/</span>
            {total}{" "}
            <span className="ml-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
              {pct}%
            </span>
          </span>
        </div>
        <Progress value={pct} aria-label="Packing progress" className="h-2" />
      </div>

      {/* Category tabs (horizontal scroll on mobile) */}
      <div className="scrollbar-thin -mx-1 overflow-x-auto px-1 pb-1">
        <div className="flex gap-1.5">
          {tabs.map((t) => {
            const isAll = t === "all";
            const active = activeTab === t;
            const meta = isAll ? null : CATEGORY_META[t];
            const Icon = meta?.icon;
            const count = isAll
              ? total
              : result.categories.find((c) => c.name === t)?.items.length ?? 0;
            return (
              <button
                key={t}
                type="button"
                onClick={() => setActiveTab(t)}
                className={cn(
                  "flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all",
                  active
                    ? "border-primary bg-primary text-primary-foreground shadow-sm"
                    : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"
                )}
              >
                {Icon ? <Icon className="h-3.5 w-3.5" /> : null}
                <span>{isAll ? "All" : t}</span>
                <span
                  className={cn(
                    "rounded-full px-1.5 py-0.5 text-[10px] tabular-nums",
                    active
                      ? "bg-white/20 text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Categories grid */}
      <div className="grid gap-4 md:grid-cols-2">
        <AnimatePresence mode="popLayout">
          {visibleCategories.map((cat) => {
            const catIdx = result.categories.findIndex((c) => c.name === cat.name);
            const meta = CATEGORY_META[cat.name];
            const Icon = meta.icon;
            const catTotal = cat.items.length;
            const catPacked = cat.items.filter(
              (_, idx) => checked[itemKey(catIdx, idx)]
            ).length;
            const catPct = catTotal === 0 ? 0 : (catPacked / catTotal) * 100;
            return (
              <motion.div
                key={cat.name}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.25 }}
              >
                <Card
                  className={cn(
                    "relative h-full overflow-hidden border-border/60 bg-gradient-to-b shadow-sm ring-1 transition-shadow hover:shadow-md",
                    meta.accent,
                    meta.ring
                  )}
                >
                  {/* Header */}
                  <div className="flex items-center justify-between gap-3 border-b border-border/40 px-5 pb-3 pt-4">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={cn(
                          "flex h-9 w-9 items-center justify-center rounded-xl",
                          meta.iconBg
                        )}
                      >
                        <Icon className="h-4.5 w-4.5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold leading-tight">
                          {cat.name}
                        </h3>
                        <p className="text-[11px] text-muted-foreground">
                          {catPacked} / {catTotal} packed
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs tabular-nums font-medium text-muted-foreground">
                        {Math.round(catPct)}%
                      </span>
                    </div>
                  </div>

                  <CardContent className="px-5 pb-5 pt-3">
                    {cat.items.length === 0 ? (
                      <p className="py-2 text-xs italic text-muted-foreground">
                        Nothing required for this trip.
                      </p>
                    ) : (
                      <ul className="space-y-1.5">
                        {cat.items.map((item, itemIdx) => {
                          const k = itemKey(catIdx, itemIdx);
                          const isChecked = !!checked[k];
                          return (
                            <motion.li
                              key={k}
                              initial={{ opacity: 0, x: -4 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: itemIdx * 0.015 }}
                              className={cn(
                                "group flex items-start gap-2.5 rounded-lg px-2 py-1.5 transition-colors hover:bg-background/60",
                                isChecked && "opacity-60"
                              )}
                            >
                              <Checkbox
                                id={k}
                                checked={isChecked}
                                onCheckedChange={(v) =>
                                  setChecked((s) => ({ ...s, [k]: !!v }))
                                }
                                className="mt-0.5"
                              />
                              <label
                                htmlFor={k}
                                className="flex-1 cursor-pointer text-sm leading-snug"
                              >
                                <span className="flex flex-wrap items-baseline gap-x-1.5">
                                  <span
                                    className={cn(
                                      "font-medium",
                                      isChecked && "line-through"
                                    )}
                                  >
                                    {item.name}
                                  </span>
                                  {item.quantity ? (
                                    <span className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-medium tabular-nums text-muted-foreground">
                                      ×{item.quantity}
                                    </span>
                                  ) : null}
                                </span>
                                {item.note ? (
                                  <span className="mt-0.5 block text-[11px] leading-snug text-muted-foreground">
                                    {item.note}
                                  </span>
                                ) : null}
                              </label>
                              {isChecked ? (
                                <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
                              ) : null}
                            </motion.li>
                          );
                        })}
                      </ul>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
});
