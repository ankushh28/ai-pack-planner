"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Loader2, Sparkles } from "lucide-react";
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
import {
  TripInputSchema,
  TRIP_TYPES,
  TRANSPORTS,
  MONTHS,
  type TripInput,
  type TripInputForm,
} from "@/lib/schemas";

const fieldAnim = {
  initial: { opacity: 0, y: 8 },
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

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="space-y-4"
      aria-busy={loading}
    >
      <motion.div
        {...fieldAnim}
        transition={{ delay: 0.0 }}
        className="space-y-1.5"
      >
        <Label htmlFor="destination">Destination</Label>
        <Input
          id="destination"
          placeholder="Tokyo, Japan"
          autoComplete="off"
          {...form.register("destination")}
        />
        {errors.destination ? (
          <p className="text-xs text-destructive">{errors.destination.message}</p>
        ) : null}
      </motion.div>

      <div className="grid gap-4 sm:grid-cols-2">
        <motion.div {...fieldAnim} transition={{ delay: 0.05 }} className="space-y-1.5">
          <Label htmlFor="days">Duration (days)</Label>
          <Input
            id="days"
            type="number"
            min={1}
            max={60}
            {...form.register("days", { valueAsNumber: true })}
          />
          {errors.days ? (
            <p className="text-xs text-destructive">{errors.days.message}</p>
          ) : null}
        </motion.div>

        <motion.div {...fieldAnim} transition={{ delay: 0.1 }} className="space-y-1.5">
          <Label htmlFor="month">Month</Label>
          <Select
            value={form.watch("month")}
            onValueChange={(v) => form.setValue("month", v as TripInputForm["month"], { shouldValidate: true })}
          >
            <SelectTrigger id="month">
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
        </motion.div>

        <motion.div {...fieldAnim} transition={{ delay: 0.15 }} className="space-y-1.5">
          <Label htmlFor="tripType">Trip type</Label>
          <Select
            value={form.watch("tripType")}
            onValueChange={(v) => form.setValue("tripType", v as TripInputForm["tripType"], { shouldValidate: true })}
          >
            <SelectTrigger id="tripType" className="capitalize">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              {TRIP_TYPES.map((t) => (
                <SelectItem key={t} value={t} className="capitalize">
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </motion.div>

        <motion.div {...fieldAnim} transition={{ delay: 0.2 }} className="space-y-1.5">
          <Label htmlFor="transport">Transport</Label>
          <Select
            value={form.watch("transport")}
            onValueChange={(v) => form.setValue("transport", v as TripInputForm["transport"], { shouldValidate: true })}
          >
            <SelectTrigger id="transport" className="capitalize">
              <SelectValue placeholder="Select transport" />
            </SelectTrigger>
            <SelectContent>
              {TRANSPORTS.map((t) => (
                <SelectItem key={t} value={t} className="capitalize">
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </motion.div>
      </div>

      <motion.div {...fieldAnim} transition={{ delay: 0.25 }} className="space-y-1.5">
        <Label htmlFor="extras">Special needs (optional)</Label>
        <Textarea
          id="extras"
          rows={3}
          placeholder="e.g. medication, scuba gear, traveling with toddler…"
          maxLength={300}
          {...form.register("extras")}
        />
        {errors.extras ? (
          <p className="text-xs text-destructive">{errors.extras.message}</p>
        ) : null}
      </motion.div>

      <motion.div {...fieldAnim} transition={{ delay: 0.3 }}>
        <Button
          type="submit"
          disabled={loading || disabled}
          className="w-full sm:w-auto"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Packing your bag…
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Generate packing list
            </>
          )}
        </Button>
      </motion.div>
    </form>
  );
}
