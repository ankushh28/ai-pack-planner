"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { CategoryIcon } from "@/components/CategoryIcon";
import type { PackingList, TripInput } from "@/lib/schemas";

function itemKey(catIdx: number, itemIdx: number) {
  return `${catIdx}:${itemIdx}`;
}

export const PackingListView = React.forwardRef<
  HTMLDivElement,
  { input: TripInput; result: PackingList }
>(function PackingListView({ input, result }, ref) {
  const [checked, setChecked] = React.useState<Record<string, boolean>>({});

  const total = React.useMemo(
    () => result.categories.reduce((acc, c) => acc + c.items.length, 0),
    [result]
  );
  const packed = Object.values(checked).filter(Boolean).length;
  const pct = total === 0 ? 0 : Math.round((packed / total) * 100);

  return (
    <div ref={ref} className="space-y-4">
      {/* Trip summary chips */}
      <div className="flex flex-wrap gap-2">
        <Badge variant="secondary">{input.destination}</Badge>
        <Badge variant="secondary">{input.days} days</Badge>
        <Badge variant="secondary">{input.month}</Badge>
        <Badge variant="secondary" className="capitalize">
          {input.tripType}
        </Badge>
        <Badge variant="secondary" className="capitalize">
          {input.transport}
        </Badge>
      </div>

      {/* Summary line */}
      <p className="text-sm text-muted-foreground">{result.summary}</p>

      {/* Progress bar */}
      <div className="rounded-lg border bg-card p-3">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-medium">Packing progress</span>
          <span className="tabular-nums text-muted-foreground">
            {packed} / {total} packed ({pct}%)
          </span>
        </div>
        <Progress value={pct} aria-label="Packing progress" />
      </div>

      {/* Categories grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {result.categories.map((cat, catIdx) => (
          <motion.div
            key={cat.name}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: catIdx * 0.05, duration: 0.25 }}
          >
            <Card className="h-full">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <CategoryIcon
                    name={cat.name}
                    className="h-4 w-4 text-primary"
                  />
                  {cat.name}
                </CardTitle>
                <span className="text-xs text-muted-foreground">
                  {cat.items.length}
                </span>
              </CardHeader>
              <CardContent>
                {cat.items.length === 0 ? (
                  <p className="text-xs italic text-muted-foreground">
                    Nothing required.
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {cat.items.map((item, itemIdx) => {
                      const k = itemKey(catIdx, itemIdx);
                      const isChecked = !!checked[k];
                      return (
                        <motion.li
                          key={k}
                          initial={{ opacity: 0, x: -4 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{
                            delay: catIdx * 0.05 + itemIdx * 0.02,
                          }}
                          className="flex items-start gap-2 text-sm"
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
                            className={
                              "flex-1 cursor-pointer leading-snug" +
                              (isChecked
                                ? " text-muted-foreground line-through"
                                : "")
                            }
                          >
                            <span className="font-medium">{item.name}</span>
                            {item.quantity ? (
                              <span className="ml-1 text-muted-foreground">
                                · {item.quantity}
                              </span>
                            ) : null}
                            {item.note ? (
                              <span className="block text-xs text-muted-foreground">
                                {item.note}
                              </span>
                            ) : null}
                          </label>
                        </motion.li>
                      );
                    })}
                  </ul>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
});
