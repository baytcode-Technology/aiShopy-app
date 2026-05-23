import type { CreateStorePayload } from "@src/types/store";
import { z } from "zod";

const slugRegex = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/;
const reserved = new Set(["api", "app", "www", "admin", "mail", "support"]);

export const createStoreFormSchema = z.object({
  name: z.string().trim().min(1, "Store name is required").max(200),
  slug: z
    .string()
    .trim()
    .min(3, "Slug must be at least 3 characters")
    .max(63, "Slug must be at most 63 characters")
    .transform((s) => s.toLowerCase())
    .refine((s) => slugRegex.test(s), {
      message: "Use lowercase letters, numbers, and hyphens only",
    })
    .refine((s) => !reserved.has(s), {
      message: "This slug is reserved. Choose another.",
    }),
  whatsapp_number: z
    .string()
    .trim()
    .min(8, "WhatsApp number is required")
    .max(20, "WhatsApp number is too long"),
  currency: z
    .string()
    .trim()
    .length(3, "Currency must be exactly 3 letters (e.g. INR)")
    .transform((s) => s.toUpperCase())
    .refine((s) => /^[A-Z]{3}$/.test(s), {
      message: "Use a 3-letter currency code (e.g. INR)",
    }),
  description: z.string().trim().max(2000).optional().nullable(),
  industry: z.string().trim().max(100).optional().nullable(),
});

export type CreateStoreFormValues = z.infer<typeof createStoreFormSchema>;

export function slugifyFromName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 63);
}

export function toCreateStorePayload(
  values: CreateStoreFormValues,
): CreateStorePayload {
  return {
    name: values.name,
    slug: values.slug,
    whatsapp_number: values.whatsapp_number,
    currency: values.currency,
    description: values.description?.trim() || null,
    industry: values.industry?.trim() || null,
  };
}
