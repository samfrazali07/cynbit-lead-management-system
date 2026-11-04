import { z } from "zod";
import { SERVICES, BUDGETS, TIMELINES, STATUSES } from "./types";

export function normalizePhone(raw: string): string {
  let p = raw.replace(/[\s\-()]/g, "");
  if (p.startsWith("+91")) p = p.slice(3);
  else if (p.startsWith("91") && p.length === 12) p = p.slice(2);
  else if (p.startsWith("0") && p.length === 11) p = p.slice(1);
  return p;
}

const indianPhone = z
  .string()
  .transform((v) => normalizePhone(v))
  .refine((v) => /^[6-9]\d{9}$/.test(v), {
    message: "Enter a valid 10-digit Indian mobile number (starting with 6–9)",
  });

export const createEnquirySchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Full name must be at least 2 characters")
    .max(80, "Full name must be under 80 characters"),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Enter a valid email address")
    .max(120),
  phone: indianPhone,
  companyName: z.string().trim().max(100).optional().default(""),
  serviceRequired: z.enum(SERVICES as unknown as [string, ...string[]], {
    message: "Please select a service",
  }),
  budget: z.enum(BUDGETS as unknown as [string, ...string[]], {
    message: "Please select a budget range",
  }),
  timeline: z.enum(TIMELINES as unknown as [string, ...string[]], {
    message: "Please select a timeline",
  }),
  projectDescription: z
    .string()
    .trim()
    .min(20, "Please describe your project in at least 20 characters")
    .max(5000, "Project description must be under 5000 characters"),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

export const statusUpdateSchema = z.object({
  status: z.enum(STATUSES as unknown as [string, ...string[]], {
    message: "Invalid status",
  }),
});

export type CreateEnquiryInput = z.infer<typeof createEnquirySchema>;
