import { statusUpdateSchema } from "@/server/validators";
import { updateEnquiryStatus } from "@/server/services/enquiryService";
import { getSessionAdmin } from "@/server/auth";
import { jsonResponse } from "@/server/rateLimit";
import type { EnquiryStatus } from "@/server/types";

export const dynamic = "force-dynamic";

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const admin = await getSessionAdmin();
  if (!admin) return jsonResponse({ error: "Unauthorized" }, 401);
  const { id } = await ctx.params;
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonResponse({ error: "Invalid request body" }, 400);
  }
  const parsed = statusUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return jsonResponse({ error: "Validation failed", issues: parsed.error.flatten() }, 422);
  }
  const updated = await updateEnquiryStatus(
    decodeURIComponent(id),
    parsed.data.status as EnquiryStatus
  );
  if (!updated) return jsonResponse({ error: "Enquiry not found" }, 404);
  return jsonResponse({ ok: true, enquiry: updated });
}
