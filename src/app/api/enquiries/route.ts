import { createEnquirySchema } from "@/server/validators";
import { createEnquiry, listEnquiries } from "@/server/services/enquiryService";
import { getSessionAdmin } from "@/server/auth";
import { checkRateLimit, clientIp, jsonResponse } from "@/server/rateLimit";

export const dynamic = "force-dynamic";

// POST — public customer submission
export async function POST(req: Request) {
  const ip = clientIp(req);
  if (!checkRateLimit(`enquiry:${ip}`, 5, 10 * 60 * 1000)) {
    return jsonResponse({ error: "Too many submissions. Please wait a few minutes." }, 429);
  }
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonResponse({ error: "Invalid request body" }, 400);
  }
  const parsed = createEnquirySchema.safeParse(body);
  if (!parsed.success) {
    return jsonResponse({ error: "Validation failed", issues: parsed.error.flatten() }, 422);
  }
  try {
    const created = await createEnquiry(parsed.data);
    return jsonResponse({ ok: true, enquiry: created }, 201);
  } catch (err) {
    console.error("[POST /api/enquiries]", err);
    return jsonResponse({ error: "Could not save your enquiry. Please try again." }, 500);
  }
}

// GET — admin only, with search / filter / sort / pagination
export async function GET(req: Request) {
  const admin = await getSessionAdmin();
  if (!admin) return jsonResponse({ error: "Unauthorized" }, 401);

  const url = new URL(req.url);
  const search = (url.searchParams.get("search") || "").toLowerCase().trim();
  const service = url.searchParams.get("service") || "";
  const status = url.searchParams.get("status") || "";
  const sort = url.searchParams.get("sort") || "newest";
  const page = Math.max(1, parseInt(url.searchParams.get("page") || "1", 10) || 1);
  const pageSize = Math.min(100, Math.max(1, parseInt(url.searchParams.get("pageSize") || "20", 10) || 20));

  let all = await listEnquiries();
  if (service) all = all.filter((r) => r.serviceRequired === service);
  if (status) all = all.filter((r) => r.status === status);
  if (search) {
    all = all.filter((r) =>
      [r.inquiryId, r.fullName, r.email, r.phone, r.companyName, r.serviceRequired]
        .join(" ")
        .toLowerCase()
        .includes(search)
    );
  }
  if (sort === "oldest") all.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  else all.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const total = all.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const items = all.slice((page - 1) * pageSize, page * pageSize);
  return jsonResponse({ ok: true, items, total, page, pageSize, totalPages });
}
