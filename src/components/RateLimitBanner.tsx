"use client";

import * as React from "react";
import { ShieldAlert } from "lucide-react";

function formatRemaining(ms: number): string {
  if (ms <= 0) return "now";
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m`;
  const s = totalSec % 60;
  return `${s}s`;
}

export function RateLimitBanner({
  resetAt,
  onReset,
}: {
  resetAt: number; // epoch ms
  onReset?: () => void;
}) {
  const [now, setNow] = React.useState(() => Date.now());
  React.useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const remaining = resetAt - now;
  React.useEffect(() => {
    if (remaining <= 0 && onReset) onReset();
  }, [remaining, onReset]);

  return (
    <div
      role="alert"
      className="flex items-start gap-3 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive"
    >
      <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
      <div>
        <p className="font-medium">Daily limit reached (3 / day per IP)</p>
        <p className="text-destructive/90">
          Try again in <span className="tabular-nums">{formatRemaining(remaining)}</span>.
        </p>
      </div>
    </div>
  );
}
