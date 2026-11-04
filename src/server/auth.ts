import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { readJsonArray, updateJsonArray } from "./storage/jsonStore";
import type { AdminRecord, AdminPublic } from "./types";

export const AUTH_COOKIE = "cynbit_admin_token";

function jwtSecret(): string {
  const s = process.env.JWT_SECRET;
  if (!s || s.length < 16) {
    // Dev fallback only — production MUST set a long random JWT_SECRET.
    return "cynbit-dev-only-secret-change-in-production-32chars";
  }
  return s;
}

export function signToken(admin: AdminPublic): string {
  return jwt.sign(
    { sub: admin.id, email: admin.email, role: admin.role },
    jwtSecret(),
    { expiresIn: "8h" }
  );
}

export function verifyToken(token: string): { sub: string; email: string; role: string } | null {
  try {
    const decoded = jwt.verify(token, jwtSecret()) as {
      sub: string;
      email: string;
      role: string;
    };
    return decoded;
  } catch {
    return null;
  }
}

export async function getSessionAdmin(): Promise<AdminPublic | null> {
  const store = await cookies();
  const token = store.get(AUTH_COOKIE)?.value;
  if (!token) return null;
  const payload = verifyToken(token);
  if (!payload) return null;
  const admins = await readJsonArray<AdminRecord>("admins.json");
  const found = admins.find((a) => a.id === payload.sub);
  if (!found) return null;
  return toPublic(found);
}

export function toPublic(a: AdminRecord): AdminPublic {
  return { id: a.id, name: a.name, email: a.email, role: a.role, createdAt: a.createdAt };
}

export async function verifyAdminCredentials(
  email: string,
  password: string
): Promise<AdminPublic | null> {
  await ensureSeededAdmin();
  const admins = await readJsonArray<AdminRecord>("admins.json");
  const admin = admins.find((a) => a.email.toLowerCase() === email.toLowerCase());
  if (!admin) return null;
  const ok = await bcrypt.compare(password, admin.password);
  if (!ok) return null;
  return toPublic(admin);
}

/**
 * Seed the first admin from environment variables if admins.json is empty.
 * Credentials come ONLY from env (ADMIN_EMAIL / ADMIN_PASSWORD / ADMIN_NAME).
 * For local dev convenience, documented defaults are used when env is unset.
 */
export async function ensureSeededAdmin(): Promise<void> {
  const existing = await readJsonArray<AdminRecord>("admins.json");
  if (existing.length > 0) return;

  const email = (process.env.ADMIN_EMAIL || "admin@cynbit.in").toLowerCase();
  const password = process.env.ADMIN_PASSWORD || "Admin@123";
  const name = process.env.ADMIN_NAME || "Cynbit Admin";

  const hash = await bcrypt.hash(password, 12);
  const record: AdminRecord = {
    id: `adm-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    name,
    email,
    password: hash,
    role: "ADMIN",
    createdAt: new Date().toISOString(),
  };
  await updateJsonArray<AdminRecord>("admins.json", (cur) =>
    cur.length === 0 ? [record] : cur
  );
}

export function cookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8, // 8 hours
  };
}
