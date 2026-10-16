import { promises as fs } from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";

/**
 * Minimal file-based persistence used by the repositories.
 * Data lives under DATA_DIR (default: ./data) which must be writable and persistent
 * on the host (VPS / cPanel Node.js). Writes are atomic (tmp file + rename) and
 * serialized per file so concurrent requests cannot corrupt a document.
 */

export function getDataDir(): string {
  return path.resolve(process.env.DATA_DIR || path.join(process.cwd(), "data"));
}

export function resolveDataPath(...segments: string[]): string {
  const base = getDataDir();
  const target = path.resolve(base, ...segments);
  if (target !== base && !target.startsWith(base + path.sep)) {
    throw new Error("Invalid data path");
  }
  return target;
}

const writeQueues = new Map<string, Promise<unknown>>();

/** Runs `task` after every previously queued task for the same file finished. */
export function withFileLock<T>(filePath: string, task: () => Promise<T>): Promise<T> {
  const previous = writeQueues.get(filePath) ?? Promise.resolve();
  const next = previous.catch(() => undefined).then(task);
  writeQueues.set(
    filePath,
    next.finally(() => {
      if (writeQueues.get(filePath) === next) writeQueues.delete(filePath);
    })
  );
  return next;
}

export async function readJsonFile<T>(filePath: string, fallback: T): Promise<T> {
  try {
    const raw = await fs.readFile(filePath, "utf8");
    return JSON.parse(raw) as T;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return fallback;
    throw error;
  }
}

export async function writeJsonFile<T>(filePath: string, data: T): Promise<void> {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  const tmpPath = `${filePath}.${randomUUID()}.tmp`;
  await fs.writeFile(tmpPath, JSON.stringify(data, null, 2), "utf8");
  await fs.rename(tmpPath, filePath);
}

export async function appendLine(filePath: string, line: string): Promise<void> {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.appendFile(filePath, `${line}\n`, "utf8");
}

export async function readLines(filePath: string): Promise<string[]> {
  try {
    const raw = await fs.readFile(filePath, "utf8");
    return raw.split("\n").filter(Boolean);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  }
}

export async function listFiles(dirPath: string): Promise<string[]> {
  try {
    return await fs.readdir(dirPath);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  }
}

export async function removeFile(filePath: string): Promise<void> {
  await fs.rm(filePath, { force: true });
}
