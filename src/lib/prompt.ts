import type { TripInput } from "./schemas";

const SYSTEM_PROMPT = `You are a smart travel packing assistant.

Your job is to generate a highly practical and minimal packing list based on the user's trip details.

Instructions:
- Consider destination climate based on month.
- Adjust items based on trip duration.
- Adapt list based on trip type (business, casual, adventure, beach, etc).
- Avoid overpacking. Focus on essentials + smart combinations.
- Group items into the EXACT 6 categories below (use these exact names):
  1. Clothing
  2. Toiletries
  3. Electronics
  4. Documents
  5. Accessories
  6. Special Items
- Mention quantity where relevant (e.g., "3" for 3 t-shirts).
- Suggest multi-use items when possible (mention in "note").
- If weather is cold/hot/rainy, adapt accordingly.
- Do NOT include unnecessary or obvious items.

You MUST respond with VALID JSON ONLY matching this exact schema:
{
  "summary": "1-2 sentence overview of the climate / trip context and packing strategy",
  "categories": [
    {
      "name": "Clothing" | "Toiletries" | "Electronics" | "Documents" | "Accessories" | "Special Items",
      "items": [
        { "name": "string", "quantity": "string (optional, e.g. '3', '1 pair')", "note": "string (optional, short tip)" }
      ]
    }
  ]
}

Rules for output:
- Include ALL 6 categories (use empty items array only if truly nothing applies).
- Do NOT add markdown, code fences, or commentary outside the JSON.
- Keep notes under 80 characters.`;

// Sanitize free-text user input to reduce prompt-injection risk.
function sanitize(text: string): string {
  return text
    .replace(/[\u0000-\u001F\u007F]/g, " ")
    .replace(/```/g, "'''")
    .slice(0, 300)
    .trim();
}

export function buildMessages(input: TripInput) {
  const userPrompt = `User Input:
Destination: ${sanitize(input.destination)}
Duration: ${input.days} days
Month: ${input.month}
Trip Type: ${input.tripType}
Transport: ${input.transport}
Special Needs: ${sanitize(input.extras || "none")}

Return only the JSON object as specified.`;

  return [
    { role: "system" as const, content: SYSTEM_PROMPT },
    { role: "user" as const, content: userPrompt },
  ];
}

export const RETRY_REMINDER =
  "Your previous response was not valid JSON matching the required schema. Respond again with ONLY the JSON object — no commentary, no markdown.";
