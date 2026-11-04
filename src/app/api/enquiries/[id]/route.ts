import { getEnquiry, deleteEnquiry } from "@/server/services/enquiryService";
import { getSessionAdmin } from "@/server/auth";
import { jsonResponse } from "@/server/rateLimit";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const admin = await getSessionAdmin();
  if (!admin) return jsonResponse({ error: "Unauthorized" }, 401);
  const { id } = await ctx.params;
  const enquiry = await getEnquiry(decodeURIComponent(id));
  if (!enquiry) return jsonResponse({ error: "Enquiry not found" }, 404);
  return jsonResponse({ ok: true, enquiry });
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const admin = await getSessionAdmin();
  if (!admin) return jsonResponse({ error: "Unauthorized" }, 401);
  const { id } = await ctx.params;
  const ok = await deleteEnquiry(decodeURIComponent(id));
  if (!ok) return jsonResponse({ error: "Enquiry not found" }, 404);
  return jsonResponse({ ok: true });
}
