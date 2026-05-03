import type { PackingList, TripInput } from "./schemas";

const KEY = "packplanner:last";

export type CachedRun = {
  input: TripInput;
  result: PackingList;
  generatedAt: number;
};

export function saveLastRun(run: CachedRun) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(run));
  } catch {
    // ignore quota / privacy errors
  }
}

export function loadLastRun(): CachedRun | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CachedRun;
    if (!parsed || !parsed.input || !parsed.result) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearLastRun() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}
