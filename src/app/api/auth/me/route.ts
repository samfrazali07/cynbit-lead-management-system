import { getSessionAdmin } from "@/server/auth";
import { jsonResponse } from "@/server/rateLimit";

export const dynamic = "force-dynamic";

export async function GET() {
  const admin = await getSessionAdmin();
  if (!admin) return jsonResponse({ error: "Unauthorized" }, 401);
  return jsonResponse({ ok: true, admin });
}
