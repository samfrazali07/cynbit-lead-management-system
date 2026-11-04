import { ensureStorageFiles, readJsonArray } from "@/server/storage/jsonStore";
import { jsonResponse } from "@/server/rateLimit";
import type { Inquiry } from "@/server/types";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await ensureStorageFiles();
    const inquiries = await readJsonArray<Inquiry>("inquiries.json");
    return jsonResponse({
      ok: true,
      storage: "file-json",
      inquiries: inquiries.length,
      time: new Date().toISOString(),
    });
  } catch {
    return jsonResponse({ ok: false, error: "Storage unavailable" }, 500);
  }
}
