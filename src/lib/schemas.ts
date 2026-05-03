import { z } from "zod";

export const TRIP_TYPES = [
  "business",
  "casual",
  "adventure",
  "beach",
  "hiking",
  "family",
  "romantic",
  "backpacking",
  "city-break",
  "other",
] as const;

export const TRANSPORTS = [
  "flight",
  "train",
  "car",
  "bus",
  "cruise",
] as const;

export const GENDERS = [
  "male",
  "female",
  "non-binary",
  "prefer-not-to-say",
] as const;

export const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

export const CATEGORIES = [
  "Clothing",
  "Toiletries",
  "Electronics",
  "Documents",
  "Accessories",
  "Special Items",
] as const;

export const TripInputSchema = z.object({
  destination: z
    .string()
    .trim()
    .min(2, "Destination must be at least 2 characters")
    .max(80, "Destination is too long"),
  days: z
    .number({ message: "Enter a number" })
    .int("Must be a whole number")
    .min(1, "At least 1 day")
    .max(60, "Max 60 days"),
  month: z.enum(MONTHS),
  tripType: z.enum(TRIP_TYPES),
  transport: z.enum(TRANSPORTS),
  gender: z.enum(GENDERS).default("prefer-not-to-say"),
  extras: z.string().trim().max(300, "Keep it under 300 chars").default(""),
});

export type TripInput = z.infer<typeof TripInputSchema>;
export type TripInputForm = z.input<typeof TripInputSchema>;

export const PackingItemSchema = z.object({
  name: z.string().min(1),
  quantity: z.string().optional(),
  note: z.string().optional(),
});

export const PackingCategorySchema = z.object({
  name: z.enum(CATEGORIES),
  items: z.array(PackingItemSchema).min(0),
});

export const PackingListSchema = z.object({
  summary: z.string().min(1),
  categories: z.array(PackingCategorySchema).min(1),
});

export type PackingItem = z.infer<typeof PackingItemSchema>;
export type PackingCategory = z.infer<typeof PackingCategorySchema>;
export type PackingList = z.infer<typeof PackingListSchema>;
