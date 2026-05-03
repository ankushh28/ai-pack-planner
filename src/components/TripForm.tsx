"use client";

import * as React from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import {
  Loader2,
  Sparkles,
  MapPin,
  Calendar,
  CalendarDays,
  Plane,
  Train,
  Car,
  Bus,
  Ship,
  Briefcase,
  Coffee,
  Mountain,
  Waves,
  TreePine,
  Users,
  Heart,
  Backpack,
  Building2,
  HelpCircle,
  User,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  TripInputSchema,
  TRIP_TYPES,
  TRANSPORTS,
  GENDERS,
  MONTHS,
  type TripInput,
  type TripInputForm,
} from "@/lib/schemas";

const TRIP_TYPE_META: Record<
  (typeof TRIP_TYPES)[number],
  { icon: LucideIcon; label: string }
> = {
  business: { icon: Briefcase, label: "Business" },
  casual: { icon: Coffee, label: "Casual" },
  adventure: { icon: Mountain, label: "Adventure" },
  beach: { icon: Waves, label: "Beach" },
  hiking: { icon: TreePine, label: "Hiking" },
  family: { icon: Users, label: "Family" },
  romantic: { icon: Heart, label: "Romantic" },
  backpacking: { icon: Backpack, label: "Backpacking" },
  "city-break": { icon: Building2, label: "City Break" },
  other: { icon: HelpCircle, label: "Other" },
};

const TRANSPORT_META: Record<
  (typeof TRANSPORTS)[number],
  { icon: LucideIcon; label: string }
> = {
  flight: { icon: Plane, label: "Flight" },
  train: { icon: Train, label: "Train" },
  car: { icon: Car, label: "Car" },
  bus: { icon: Bus, label: "Bus" },
  cruise: { icon: Ship, label: "Cruise" },
};

const GENDER_LABEL: Record<(typeof GENDERS)[number], string> = {
  male: "Male",
  female: "Female",
  "non-binary": "Non-binary",
  "prefer-not-to-say": "Prefer not to say",
};

const fieldAnim = {
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0 },
};

export function TripForm({
  onSubmit,
  loading,
  disabled,
  defaultValues,
}: {
  onSubmit: (data: TripInput) => void | Promise<void>;
  loading?: boolean;
  disabled?: boolean;
  defaultValues?: Partial<TripInput>;
}) {
  const form = useForm<TripInputForm, unknown, TripInput>({
    resolver: zodResolver(TripInputSchema),
    defaultValues: {
      destination: "",
      days: 5,
      month: "January",
      tripType: "casual",
      transport: "flight",
      gender: "prefer-not-to-say",
      extras: "",
      ...defaultValues,
    },
    mode: "onTouched",
  });

  React.useEffect(() => {
    if (defaultValues) form.reset({ ...form.getValues(), ...defaultValues });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(defaultValues)]);

  const errors = form.formState.errors;
  const days = form.watch("days") || 1;

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="space-y-6"
      aria-busy={loading}
    >
      {/* Destination */}
      <motion.div
        {...fieldAnim}
        transition={{ delay: 0 }}
        className="space-y-2"
      >
        <Label
          htmlFor="destination"
          className="flex items-center gap-1.5 text-sm font-medium"
        >
          <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
          Destination
        </Label>
        <div className="relative">
          <Input
            id="destination"
            placeholder="e.g. Tokyo, Japan"
            autoComplete="off"
            className="h-11 pl-3"
            {...form.register("destination")}
          />
        </div>
        {errors.destination ? (
          <p className="text-xs text-destructive">{errors.destination.message}</p>
        ) : null}
      </motion.div>

      {/* Days + Month */}
      <motion.div
        {...fieldAnim}
        transition={{ delay: 0.05 }}
        className="grid gap-4 sm:grid-cols-2"
      >
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label
              htmlFor="days"
              className="flex items-center gap-1.5 text-sm font-medium"
            >
              <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
              Duration
            </Label>
            <span className="text-xs tabular-nums text-muted-foreground">
              {days} day{days === 1 ? "" : "s"}
            </span>
          </div>
          <Input
            id="days"
            type="number"
            min={1}
            max={60}
            className="h-11"
            {...form.register("days", { valueAsNumber: true })}
          />
          {errors.days ? (
            <p className="text-xs text-destructive">{errors.days.message}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="month"
            className="flex items-center gap-1.5 text-sm font-medium"
          >
            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
            Month of travel
          </Label>
          <Controller
            control={form.control}
            name="month"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="month" className="h-11">
                  <SelectValue placeholder="Select month" />
                </SelectTrigger>
                <SelectContent>
                  {MONTHS.map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
      </motion.div>

      {/* Trip type */}
      <motion.div {...fieldAnim} transition={{ delay: 0.1 }} className="space-y-2">
        <Label className="text-sm font-medium">Trip type</Label>
        <Controller
          control={form.control}
          name="tripType"
          render={({ field }) => (
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
              {TRIP_TYPES.map((t) => {
                const meta = TRIP_TYPE_META[t];
                const Icon = meta.icon;
                const active = field.value === t;
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => field.onChange(t)}
                    className={cn(
                      "group flex flex-col items-center gap-1 rounded-xl border px-2 py-3 text-xs font-medium transition-all",
                      "hover:border-primary/40 hover:bg-accent/50",
                      active
                        ? "border-primary bg-primary/10 text-primary shadow-sm shadow-primary/10"
                        : "border-border bg-card text-foreground"
                    )}
                    aria-pressed={active}
                  >
                    <Icon
                      className={cn(
                        "h-4 w-4 transition-transform group-hover:scale-110",
                        active ? "text-primary" : "text-muted-foreground"
                      )}
                    />
                    <span>{meta.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        />
      </motion.div>

      {/* Transport */}
      <motion.div {...fieldAnim} transition={{ delay: 0.15 }} className="space-y-2">
        <Label className="text-sm font-medium">Transport</Label>
        <Controller
          control={form.control}
          name="transport"
          render={({ field }) => (
            <div className="grid grid-cols-5 gap-2">
              {TRANSPORTS.map((t) => {
                const meta = TRANSPORT_META[t];
                const Icon = meta.icon;
                const active = field.value === t;
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => field.onChange(t)}
                    className={cn(
                      "group flex flex-col items-center gap-1 rounded-xl border px-2 py-3 text-xs font-medium transition-all",
                      "hover:border-primary/40 hover:bg-accent/50",
                      active
                        ? "border-primary bg-primary/10 text-primary shadow-sm shadow-primary/10"
                        : "border-border bg-card text-foreground"
                    )}
                    aria-pressed={active}
                  >
                    <Icon
                      className={cn(
                        "h-4 w-4 transition-transform group-hover:scale-110",
                        active ? "text-primary" : "text-muted-foreground"
                      )}
                    />
                    <span>{meta.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        />
      </motion.div>

      {/* Gender */}
      <motion.div {...fieldAnim} transition={{ delay: 0.2 }} className="space-y-2">
        <Label className="flex items-center gap-1.5 text-sm font-medium">
          <User className="h-3.5 w-3.5 text-muted-foreground" />
          Gender{" "}
          <span className="text-xs font-normal text-muted-foreground">
            (helps tailor essentials)
          </span>
        </Label>
        <Controller
          control={form.control}
          name="gender"
          render={({ field }) => (
            <div className="flex flex-wrap gap-2">
              {GENDERS.map((g) => {
                const active = field.value === g;
                return (
                  <button
                    key={g}
                    type="button"
                    onClick={() => field.onChange(g)}
                    className={cn(
                      "rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all",
                      "hover:border-primary/40 hover:bg-accent/50",
                      active
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-card text-muted-foreground"
                    )}
                    aria-pressed={active}
                  >
                    {GENDER_LABEL[g]}
                  </button>
                );
              })}
            </div>
          )}
        />
      </motion.div>

      {/* Extras */}
      <motion.div
        {...fieldAnim}
        transition={{ delay: 0.25 }}
        className="space-y-2"
      >
        <Label htmlFor="extras" className="text-sm font-medium">
          Special needs or context{" "}
          <span className="font-normal text-muted-foreground">(optional)</span>
        </Label>
        <Textarea
          id="extras"
          rows={3}
          placeholder="e.g. traveling with a toddler, vegetarian, scuba certified, prescription meds…"
          maxLength={300}
          className="resize-none"
          {...form.register("extras")}
        />
        <div className="flex justify-between">
          {errors.extras ? (
            <p className="text-xs text-destructive">{errors.extras.message}</p>
          ) : (
            <span className="text-xs text-muted-foreground">
              The more context, the smarter the list.
            </span>
          )}
          <span className="text-xs tabular-nums text-muted-foreground">
            {(form.watch("extras") || "").length}/300
          </span>
        </div>
      </motion.div>

      {/* Submit */}
      <motion.div {...fieldAnim} transition={{ delay: 0.3 }}>
        <Button
          type="submit"
          disabled={loading || disabled}
          size="lg"
          className="group h-12 w-full bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-lg shadow-sky-500/20 transition-all hover:shadow-xl hover:shadow-sky-500/30 hover:brightness-110 disabled:opacity-60"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Crafting your packing list…
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4 transition-transform group-hover:rotate-12" />
              Generate packing list
            </>
          )}
        </Button>
      </motion.div>
    </form>
  );
}
