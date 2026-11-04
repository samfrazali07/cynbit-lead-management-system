import { AUTH_COOKIE } from "@/server/auth";
import { jsonResponse } from "@/server/rateLimit";

export const dynamic = "force-dynamic";

export async function POST() {
  const res = jsonResponse({ ok: true });
  res.headers.set("Set-Cookie", `${AUTH_COOKIE}=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax`);
  return res;
}
