import type { TripInput } from "./schemas";
import { TripInputSchema } from "./schemas";

// Encode trip input into a URL-safe base64 string.
export function encodeTrip(input: TripInput): string {
  const json = JSON.stringify(input);
  if (typeof window === "undefined") {
    return Buffer.from(json, "utf-8").toString("base64url");
  }
  const b64 = btoa(unescape(encodeURIComponent(json)));
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function decodeTrip(token: string): TripInput | null {
  try {
    let b64 = token.replace(/-/g, "+").replace(/_/g, "/");
    while (b64.length % 4 !== 0) b64 += "=";
    let json: string;
    if (typeof window === "undefined") {
      json = Buffer.from(b64, "base64").toString("utf-8");
    } else {
      json = decodeURIComponent(escape(atob(b64)));
    }
    const parsed = TripInputSchema.safeParse(JSON.parse(json));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

export function buildShareUrl(input: TripInput): string {
  const token = encodeTrip(input);
  if (typeof window === "undefined") return `?trip=${token}`;
  const url = new URL(window.location.href);
  url.searchParams.set("trip", token);
  return url.toString();
}
