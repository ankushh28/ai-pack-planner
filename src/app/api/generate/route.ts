import { NextResponse } from "next/server";
import { TripInputSchema, PackingListSchema } from "@/lib/schemas";
import { getGroq, GROQ_MODEL } from "@/lib/groq";
import { buildMessages, RETRY_REMINDER } from "@/lib/prompt";
import { getRatelimit, getClientIp } from "@/lib/ratelimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  // 1) Validate body
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = TripInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const input = parsed.data;

  // 2) Rate limit (3/day/IP)
  const rl = getRatelimit();
  if (rl) {
    const ip = getClientIp(request.headers);
    const result = await rl.limit(ip);
    const headers = {
      "X-RateLimit-Limit": String(result.limit),
      "X-RateLimit-Remaining": String(result.remaining),
      "X-RateLimit-Reset": String(result.reset),
    };
    if (!result.success) {
      return NextResponse.json(
        {
          error: "Daily limit reached. Try again later.",
          limit: result.limit,
          remaining: result.remaining,
          resetAt: result.reset,
        },
        { status: 429, headers }
      );
    }
    // Continue; we'll attach headers on success too.
    request.headers.set("x-ratelimit-headers", JSON.stringify(headers));
  }

  // 3) Call Groq
  let groq;
  try {
    groq = getGroq();
  } catch (e) {
    return NextResponse.json(
      { error: "Server is not configured (GROQ_API_KEY missing)" },
      { status: 500 }
    );
  }

  const messages = buildMessages(input);

  async function callModel(
    msgs: { role: "system" | "user" | "assistant"; content: string }[]
  ) {
    const res = await groq!.chat.completions.create({
      model: GROQ_MODEL,
      messages: msgs,
      temperature: 0.4,
      max_tokens: 2048,
      response_format: { type: "json_object" },
    });
    return res.choices[0]?.message?.content ?? "";
  }

  let raw: string;
  try {
    raw = await callModel(messages);
  } catch (e) {
    console.error("Groq call failed:", e);
    return NextResponse.json(
      { error: "AI provider failed. Please try again." },
      { status: 502 }
    );
  }

  // 4) Parse + validate; one retry on schema mismatch
  function tryParse(text: string) {
    try {
      const obj = JSON.parse(text);
      const out = PackingListSchema.safeParse(obj);
      return out;
    } catch {
      return null;
    }
  }

  let validated = tryParse(raw);
  if (!validated || !validated.success) {
    try {
      const retry = await callModel([
        ...messages,
        { role: "assistant", content: raw },
        { role: "user", content: RETRY_REMINDER },
      ]);
      validated = tryParse(retry);
    } catch (e) {
      console.error("Groq retry failed:", e);
    }
  }

  if (!validated || !validated.success) {
    return NextResponse.json(
      { error: "AI returned an unexpected format. Please retry." },
      { status: 502 }
    );
  }

  // 5) Respond
  const rlHeaders = (() => {
    const raw = request.headers.get("x-ratelimit-headers");
    if (!raw) return undefined;
    try {
      return JSON.parse(raw) as Record<string, string>;
    } catch {
      return undefined;
    }
  })();

  return NextResponse.json(
    { input, result: validated.data },
    { status: 200, headers: rlHeaders }
  );
}
