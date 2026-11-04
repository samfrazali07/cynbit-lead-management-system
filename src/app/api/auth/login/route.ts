import { loginSchema } from "@/server/validators";
import { verifyAdminCredentials, signToken, AUTH_COOKIE, cookieOptions } from "@/server/auth";
import { checkRateLimit, clientIp, jsonResponse } from "@/server/rateLimit";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const ip = clientIp(req);
  if (!checkRateLimit(`login:${ip}`, 10, 15 * 60 * 1000)) {
    return jsonResponse({ error: "Too many login attempts. Try again in 15 minutes." }, 429);
  }
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonResponse({ error: "Invalid request body" }, 400);
  }
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return jsonResponse({ error: "Validation failed", issues: parsed.error.flatten() }, 422);
  }
  const admin = await verifyAdminCredentials(parsed.data.email, parsed.data.password);
  if (!admin) {
    return jsonResponse({ error: "Invalid email or password" }, 401);
  }
  const token = signToken(admin);
  const res = jsonResponse({ ok: true, admin });
  res.headers.set("Set-Cookie", `${AUTH_COOKIE}=${token}; HttpOnly; Path=/; Max-Age=${cookieOptions().maxAge}; SameSite=Lax${process.env.NODE_ENV === "production" ? "; Secure" : ""}`);
  return res;
}
