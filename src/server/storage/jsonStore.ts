import { promises as fs } from "fs";
import path from "path";

/**
 * File-Based JSON Storage Service
 * --------------------------------
 * Single responsibility: safe read/write of JSON files on disk.
 * - Auto-creates missing files/directories
 * - Handles corrupted JSON by backing up and resetting
 * - Serializes writes with a per-file promise queue (mutex) to prevent
 *   concurrent-write corruption
 * - Atomic writes via temp file + rename
 * Business logic lives in services/, never here.
 */

const DATA_DIR = path.join(process.cwd(), "server", "data");

export function dataDir() {
  return DATA_DIR;
}

export function filePath(name: string) {
  return path.join(DATA_DIR, name);
}

// Per-file write queue (mutex). Each entry is the tail promise of the queue.
const queues = new Map<string, Promise<unknown>>();

async function withLock<T>(key: string, fn: () => Promise<T>): Promise<T> {
  const prev = queues.get(key) ?? Promise.resolve();
  let release!: () => void;
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  const next = prev.then(() => gate);
  queues.set(key, next);
  await prev.catch(() => {});
  try {
    return await fn();
  } finally {
    release();
    // Clean up if we're still the tail
    if (queues.get(key) === next) queues.delete(key);
  }
}

async function ensureDir() {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

async function ensureFile(file: string, fallback: string) {
  await ensureDir();
  try {
    await fs.access(file);
  } catch {
    await fs.writeFile(file, fallback, "utf-8");
  }
}

/** Read a JSON array file safely. Returns [] on missing/corrupt (with backup). */
export async function readJsonArray<T>(filename: string): Promise<T[]> {
  const file = filePath(filename);
  await ensureFile(file, "[]");
  const raw = await fs.readFile(file, "utf-8").catch(() => "[]");
  const trimmed = raw.trim();
  if (!trimmed) return [];
  try {
    const parsed = JSON.parse(trimmed);
    if (!Array.isArray(parsed)) return [];
    return parsed as T[];
  } catch {
    // Corrupted file: back it up, reset to empty, never crash the API.
    const backup = `${file}.corrupt-${Date.now()}.bak`;
    await fs.writeFile(backup, raw, "utf-8").catch(() => {});
    await fs.writeFile(file, "[]", "utf-8").catch(() => {});
    return [];
  }
}

/** Atomically replace a JSON array file. Serialized per file. */
export async function writeJsonArray<T>(filename: string, data: T[]): Promise<void> {
  const file = filePath(filename);
  await withLock(file, async () => {
    await ensureDir();
    const tmp = `${file}.tmp-${process.pid}-${Date.now()}`;
    await fs.writeFile(tmp, JSON.stringify(data, null, 2), "utf-8");
    await fs.rename(tmp, file);
  });
}

/**
 * Read-modify-write helper. The updater runs inside the file lock so
 * concurrent requests can never interleave and lose records.
 */
export async function updateJsonArray<T>(
  filename: string,
  updater: (current: T[]) => T[]
): Promise<T[]> {
  const file = filePath(filename);
  return withLock(file, async () => {
    const current = await readJsonArray<T>(filename);
    const next = updater(current);
    await ensureDir();
    const tmp = `${file}.tmp-${process.pid}-${Date.now()}`;
    await fs.writeFile(tmp, JSON.stringify(next, null, 2), "utf-8");
    await fs.rename(tmp, file);
    return next;
  });
}

export async function ensureStorageFiles() {
  await ensureFile(filePath("inquiries.json"), "[]");
  await ensureFile(filePath("admins.json"), "[]");
}
