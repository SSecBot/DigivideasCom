import { promises as fs } from "node:fs";
import path from "node:path";
import { gunzipSync, gzipSync } from "node:zlib";
import { getDataDir, resolveDataPath } from "@/lib/server/storage/json-store";

/**
 * Full backups of DATA_DIR (CMS content, inquiries, analytics, leads, CRM, uploads, PDFs).
 * A backup is one gzip-compressed JSON file in DATA_DIR/backups:
 *   digivideas-yedek-YYYYMMDD-HHMMSS-<reason>.json.gz
 * Text files are stored as UTF-8, binaries (images/PDFs) as base64. The same format is
 * written by scripts/backup-data.mjs, so backups taken before an update can be restored here.
 */

export const BACKUP_FORMAT = "digivideas-backup";
export const BACKUP_REASONS = {
  manuel: "Elle alınan yedek",
  gunluk: "Günlük otomatik yedek",
  "sunucu-baslangici": "Sunucu başlangıcı (güncelleme sonrası)",
  "guncelleme-oncesi": "Güncelleme öncesi",
  "geri-yukleme-oncesi": "Geri yükleme öncesi",
  "sifirlama-oncesi": "Verileri sıfırlama öncesi",
  "eski-veri-aktarimi-oncesi": "Eski panel verisi aktarımı öncesi",
  yuklenen: "Bilgisayardan yüklenen yedek",
} as const;
export type BackupReason = keyof typeof BACKUP_REASONS;

const NAME_PATTERN = /^digivideas-yedek-(\d{8})-(\d{6})-([a-z-]+)(?:-\d+)?\.json\.gz$/;
const TEXT_EXTENSIONS = new Set([".json", ".jsonl", ".txt", ".csv"]);
const KEEP_DAILY = 14;
const KEEP_OTHER = 40;
const MAX_UPLOAD_BYTES = 500 * 1024 * 1024;

export class BackupError extends Error {}

export interface BackupFileEntry {
  path: string; // relative to DATA_DIR, forward slashes
  encoding: "utf8" | "base64";
  data: string;
}

export interface BackupDocument {
  format: typeof BACKUP_FORMAT;
  version: 1;
  createdAt: string;
  reason: string;
  files: BackupFileEntry[];
}

export interface BackupInfo {
  name: string;
  createdAt: string; // ISO
  reason: string;
  reasonLabel: string;
  size: number;
}

const backupDir = () => resolveDataPath("backups");

function isExcluded(relative: string): boolean {
  return relative === "backups" || relative.startsWith("backups/") || relative.endsWith(".tmp");
}

async function walk(dir: string, base: string, out: string[]) {
  let entries: import("node:fs").Dirent[];
  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return;
    throw error;
  }
  for (const entry of entries) {
    const absolute = path.join(dir, entry.name);
    const relative = path.relative(base, absolute).split(path.sep).join("/");
    if (isExcluded(relative)) continue;
    if (entry.isDirectory()) await walk(absolute, base, out);
    else if (entry.isFile()) out.push(relative);
  }
}

function timestamp(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}-${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`;
}

export function parseBackupName(name: string): { createdAt: string; reason: string } | null {
  const match = name.match(NAME_PATTERN);
  if (!match) return null;
  const [, d, t, reason] = match;
  const iso = `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6, 8)}T${t.slice(0, 2)}:${t.slice(2, 4)}:${t.slice(4, 6)}`;
  return { createdAt: new Date(iso).toISOString(), reason };
}

export async function buildBackupDocument(reason: string, now = new Date()): Promise<BackupDocument> {
  const base = getDataDir();
  const relativePaths: string[] = [];
  await walk(base, base, relativePaths);
  const files: BackupFileEntry[] = [];
  for (const relative of relativePaths.sort()) {
    const buffer = await fs.readFile(path.join(base, relative));
    const text = TEXT_EXTENSIONS.has(path.extname(relative).toLowerCase());
    files.push({ path: relative, encoding: text ? "utf8" : "base64", data: buffer.toString(text ? "utf8" : "base64") });
  }
  return { format: BACKUP_FORMAT, version: 1, createdAt: now.toISOString(), reason, files };
}

export function parseBackupBuffer(buffer: Buffer): BackupDocument {
  let document: BackupDocument;
  try {
    document = JSON.parse(gunzipSync(buffer).toString("utf8")) as BackupDocument;
  } catch {
    throw new BackupError("Dosya geçerli bir digivideas yedeği değil (açılamadı)");
  }
  if (document?.format !== BACKUP_FORMAT || document.version !== 1 || !Array.isArray(document.files)) {
    throw new BackupError("Dosya geçerli bir digivideas yedeği değil");
  }
  for (const file of document.files) {
    if (typeof file.path !== "string" || typeof file.data !== "string" || !["utf8", "base64"].includes(file.encoding)) {
      throw new BackupError("Yedek dosyası bozuk");
    }
    const normalized = path.posix.normalize(file.path);
    if (normalized.startsWith("..") || path.posix.isAbsolute(normalized) || isExcluded(normalized)) {
      throw new BackupError(`Yedekte geçersiz dosya yolu: ${file.path}`);
    }
  }
  return document;
}

async function uniqueName(reason: string, now: Date): Promise<string> {
  const stem = `digivideas-yedek-${timestamp(now)}-${reason}`;
  let name = `${stem}.json.gz`;
  for (let n = 2; ; n += 1) {
    try {
      await fs.access(path.join(backupDir(), name));
      name = `${stem}-${n}.json.gz`;
    } catch {
      return name;
    }
  }
}

export async function createBackup(reason: BackupReason): Promise<BackupInfo> {
  const now = new Date();
  const document = await buildBackupDocument(reason, now);
  const compressed = gzipSync(Buffer.from(JSON.stringify(document), "utf8"), { level: 6 });
  await fs.mkdir(backupDir(), { recursive: true });
  const name = await uniqueName(reason, now);
  const tmp = path.join(backupDir(), `${name}.tmp`);
  await fs.writeFile(tmp, compressed);
  await fs.rename(tmp, path.join(backupDir(), name));
  await pruneBackups();
  return { name, createdAt: now.toISOString(), reason, reasonLabel: labelFor(reason), size: compressed.length };
}

function labelFor(reason: string): string {
  return (BACKUP_REASONS as Record<string, string>)[reason] ?? reason;
}

export async function listBackups(): Promise<BackupInfo[]> {
  let names: string[] = [];
  try {
    names = await fs.readdir(backupDir());
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
  }
  const backups: BackupInfo[] = [];
  for (const name of names) {
    const parsed = parseBackupName(name);
    if (!parsed) continue;
    const stat = await fs.stat(path.join(backupDir(), name));
    backups.push({ name, ...parsed, reasonLabel: labelFor(parsed.reason), size: stat.size });
  }
  return backups.sort((a, b) => b.name.localeCompare(a.name));
}

/** Keeps the newest KEEP_DAILY daily/startup backups and KEEP_OTHER of everything else. */
export async function pruneBackups(): Promise<void> {
  const backups = await listBackups();
  const automatic = backups.filter((b) => b.reason === "gunluk" || b.reason === "sunucu-baslangici");
  const other = backups.filter((b) => !automatic.includes(b));
  const remove = [...automatic.slice(KEEP_DAILY), ...other.slice(KEEP_OTHER)];
  await Promise.all(remove.map((b) => fs.rm(path.join(backupDir(), b.name), { force: true })));
}

export async function readBackupFile(name: string): Promise<Buffer> {
  if (!parseBackupName(name)) throw new BackupError("Geçersiz yedek adı");
  try {
    return await fs.readFile(path.join(backupDir(), name));
  } catch {
    throw new BackupError("Yedek bulunamadı");
  }
}

export async function deleteBackup(name: string): Promise<void> {
  if (!parseBackupName(name)) throw new BackupError("Geçersiz yedek adı");
  await fs.rm(path.join(backupDir(), name), { force: true });
}

/** Stores an uploaded backup file (after validating it) so it can be restored from the list. */
export async function importBackupFile(buffer: Buffer): Promise<BackupInfo> {
  if (buffer.length > MAX_UPLOAD_BYTES) throw new BackupError("Yedek dosyası çok büyük (en fazla 500 MB)");
  parseBackupBuffer(buffer);
  const now = new Date();
  await fs.mkdir(backupDir(), { recursive: true });
  const name = await uniqueName("yuklenen", now);
  await fs.writeFile(path.join(backupDir(), name), buffer);
  return { name, createdAt: now.toISOString(), reason: "yuklenen", reasonLabel: labelFor("yuklenen"), size: buffer.length };
}

/**
 * Replaces the current data with a backup. A "geri-yukleme-oncesi" backup of the current
 * state is always taken first, so a restore can itself be undone.
 */
export async function restoreBackup(name: string): Promise<{ safetyBackup: BackupInfo; restoredFiles: number }> {
  const document = parseBackupBuffer(await readBackupFile(name));
  const safetyBackup = await createBackup("geri-yukleme-oncesi");

  const base = getDataDir();
  const current: string[] = [];
  await walk(base, base, current);
  await Promise.all(current.map((relative) => fs.rm(path.join(base, relative), { force: true })));

  for (const file of document.files) {
    const target = resolveDataPath(...file.path.split("/"));
    await fs.mkdir(path.dirname(target), { recursive: true });
    await fs.writeFile(target, Buffer.from(file.data, file.encoding));
  }
  return { safetyBackup, restoredFiles: document.files.length };
}

let lastAutomaticCheck = 0;

/** Creates the daily backup when the newest backup is older than 24 hours. */
export async function ensureDailyBackup(now = Date.now()): Promise<BackupInfo | null> {
  if (now - lastAutomaticCheck < 30 * 60 * 1000) return null;
  lastAutomaticCheck = now;
  const latest = (await listBackups())[0];
  if (latest && now - Date.parse(latest.createdAt) < 24 * 60 * 60 * 1000) return null;
  return createBackup("gunluk");
}
