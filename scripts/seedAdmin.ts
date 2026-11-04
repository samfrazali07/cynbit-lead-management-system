/**
 * Seed the first admin into server/data/admins.json.
 *
 * Usage (from project root):
 *   ADMIN_EMAIL=you@cynbit.in ADMIN_PASSWORD='StrongPass@123' ADMIN_NAME='Your Name' npx tsx scripts/seedAdmin.ts
 *
 * Credentials come ONLY from environment variables — never hardcoded.
 * The password is bcrypt-hashed before storage. Safe to re-run: it will
 * not duplicate an existing admin with the same email.
 */
import { promises as fs } from "fs";
import path from "path";
import bcrypt from "bcryptjs";

async function main() {
  const email = (process.env.ADMIN_EMAIL || "").toLowerCase().trim();
  const password = process.env.ADMIN_PASSWORD || "";
  const name = process.env.ADMIN_NAME || "Cynbit Admin";

  if (!email || !password) {
    console.error("Missing ADMIN_EMAIL / ADMIN_PASSWORD env vars.");
    console.error("Example: ADMIN_EMAIL=admin@cynbit.in ADMIN_PASSWORD='...' npx tsx scripts/seedAdmin.ts");
    process.exit(1);
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    console.error("ADMIN_EMAIL is not a valid email.");
    process.exit(1);
  }
  if (password.length < 8) {
    console.error("ADMIN_PASSWORD must be at least 8 characters.");
    process.exit(1);
  }

  const file = path.join(process.cwd(), "server", "data", "admins.json");
  await fs.mkdir(path.dirname(file), { recursive: true });

  let admins: Array<Record<string, unknown>> = [];
  try {
    const raw = await fs.readFile(file, "utf-8");
    admins = JSON.parse(raw || "[]");
    if (!Array.isArray(admins)) admins = [];
  } catch {
    admins = [];
  }

  if (admins.some((a) => String(a.email).toLowerCase() === email)) {
    console.log(`Admin ${email} already exists. Nothing to do.`);
    return;
  }

  const hash = await bcrypt.hash(password, 12);
  admins.push({
    id: `adm-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    name,
    email,
    password: hash,
    role: "ADMIN",
    createdAt: new Date().toISOString(),
  });

  const tmp = `${file}.tmp-${process.pid}`;
  await fs.writeFile(tmp, JSON.stringify(admins, null, 2), "utf-8");
  await fs.rename(tmp, file);
  console.log(`Seeded admin ${email} into ${file}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
