export type EnquiryStatus = "NEW" | "IN_PROGRESS" | "CONTACTED" | "COMPLETED";

export interface Inquiry {
  inquiryId: string;
  fullName: string;
  email: string;
  phone: string;
  companyName: string;
  serviceRequired: string;
  budget: string;
  timeline: string;
  projectDescription: string;
  status: EnquiryStatus;
  createdAt: string;
  updatedAt: string;
}

export interface AdminRecord {
  id: string;
  name: string;
  email: string;
  password: string;
  role: "ADMIN";
  createdAt: string;
}

export interface AdminPublic {
  id: string;
  name: string;
  email: string;
  role: "ADMIN";
  createdAt: string;
}

export const SERVICES = [
  "AI Automation",
  "Website Development",
  "Mobile App Development",
  "Full Stack Development",
  "SaaS Development",
  "Cloud Solutions",
  "Digital Marketing",
  "Other",
] as const;

export const BUDGETS = [
  "Below ₹10,000",
  "₹10,000 – ₹50,000",
  "₹50,000 – ₹1,00,000",
  "₹1,00,000 – ₹5,00,000",
  "Above ₹5,00,000",
] as const;

export const TIMELINES = [
  "Immediately",
  "Within 1 Month",
  "1–3 Months",
  "Flexible",
] as const;

export const STATUSES: EnquiryStatus[] = ["NEW", "IN_PROGRESS", "CONTACTED", "COMPLETED"];
