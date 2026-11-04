import { readJsonArray, updateJsonArray } from "../storage/jsonStore";
import type { Inquiry, EnquiryStatus } from "../types";
import type { CreateEnquiryInput } from "../validators";

const FILE = "inquiries.json";

function nextInquiryId(existing: Inquiry[]): string {
  const year = new Date().getFullYear();
  let max = 0;
  for (const r of existing) {
    const m = r.inquiryId.match(new RegExp(`^CYN-${year}-(\\d+)$`));
    if (m) max = Math.max(max, parseInt(m[1], 10));
  }
  // Also consider any year to avoid collisions after year rollover
  for (const r of existing) {
    const m = r.inquiryId.match(/^CYN-\d{4}-(\d+)$/);
    if (m) max = Math.max(max, parseInt(m[1], 10));
  }
  return `CYN-${year}-${String(max + 1).padStart(4, "0")}`;
}

export async function listEnquiries(): Promise<Inquiry[]> {
  const all = await readJsonArray<Inquiry>(FILE);
  return [...all].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export async function getEnquiry(id: string): Promise<Inquiry | null> {
  const all = await readJsonArray<Inquiry>(FILE);
  return all.find((r) => r.inquiryId === id) ?? null;
}

export async function createEnquiry(input: CreateEnquiryInput): Promise<Inquiry> {
  let created: Inquiry | null = null;
  await updateJsonArray<Inquiry>(FILE, (current) => {
    const now = new Date().toISOString();
    created = {
      inquiryId: nextInquiryId(current),
      fullName: input.fullName,
      email: input.email,
      phone: input.phone,
      companyName: input.companyName ?? "",
      serviceRequired: input.serviceRequired,
      budget: input.budget,
      timeline: input.timeline,
      projectDescription: input.projectDescription,
      status: "NEW",
      createdAt: now,
      updatedAt: now,
    };
    return [...current, created];
  });
  if (!created) throw new Error("Failed to create enquiry");
  return created;
}

export async function updateEnquiryStatus(
  id: string,
  status: EnquiryStatus
): Promise<Inquiry | null> {
  let updated: Inquiry | null = null;
  await updateJsonArray<Inquiry>(FILE, (current) =>
    current.map((r) => {
      if (r.inquiryId === id) {
        updated = { ...r, status, updatedAt: new Date().toISOString() };
        return updated;
      }
      return r;
    })
  );
  return updated;
}

export async function deleteEnquiry(id: string): Promise<boolean> {
  let deleted = false;
  await updateJsonArray<Inquiry>(FILE, (current) => {
    const next = current.filter((r) => r.inquiryId !== id);
    deleted = next.length !== current.length;
    return next;
  });
  return deleted;
}

export async function computeStats() {
  const all = await readJsonArray<Inquiry>(FILE);
  const byStatus = (s: EnquiryStatus) => all.filter((r) => r.status === s).length;
  const recent = [...all]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);
  const byService: Record<string, number> = {};
  for (const r of all) byService[r.serviceRequired] = (byService[r.serviceRequired] ?? 0) + 1;
  return {
    total: all.length,
    newCount: byStatus("NEW"),
    inProgress: byStatus("IN_PROGRESS"),
    contacted: byStatus("CONTACTED"),
    completed: byStatus("COMPLETED"),
    recent,
    byService,
  };
}
