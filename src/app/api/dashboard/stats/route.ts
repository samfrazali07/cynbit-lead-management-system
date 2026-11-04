import { computeStats } from "@/server/services/enquiryService";
import { getSessionAdmin } from "@/server/auth";
import { jsonResponse } from "@/server/rateLimit";

export const dynamic = "force-dynamic";

export async function GET() {
  const admin = await getSessionAdmin();
  if (!admin) return jsonResponse({ error: "Unauthorized" }, 401);
  const stats = await computeStats();
  return jsonResponse({ ok: true, stats });
}
