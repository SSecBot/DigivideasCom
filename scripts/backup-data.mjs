#!/usr/bin/env node
/**
 * Command-line backup of the site's data folder (same format as the admin "Yedekleme" tab).
 * Used by scripts/guncelle.sh before every update; can also be run by hand or from cron:
 *
 *   node scripts/backup-data.mjs                     -> reason "manuel"
 *   node scripts/backup-data.mjs guncelleme-oncesi
 *
 * DATA_DIR is read from the environment, .env or .env.local (default: ./data).
 * The backup is written to DATA_DIR/backups and can be restored from the admin panel.
 */
import { promises as fs, existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { gzipSync } from "node:zlib";

const ALLOWED_REASONS = new Set(["manuel", "guncelleme-oncesi"]);
const TEXT_EXTENSIONS = new Set([".json", ".jsonl", ".txt", ".csv"]);

function readEnvValue(key) {
  if (process.env[key]) return process.env[key];
  for (const file of [".env.local", ".env.production", ".env"]) {
    if (!existsSync(file)) continue;
    const line = readFileSync(file, "utf8")
      .split(/\r?\n/)
      .find((entry) => entry.startsWith(`${key}=`));
    const value = line?.slice(key.length + 1).trim().replace(/^["']|["']$/g, "");
    if (value) return value;
  }
  return undefined;
}

async function walk(dir, base, out) {
  let entries;
  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch (error) {
    if (error.code === "ENOENT") return;
    throw error;
  }
  for (const entry of entries) {
    const absolute = path.join(dir, entry.name);
    const relative = path.relative(base, absolute).split(path.sep).join("/");
    if (relative === "backups" || relative.startsWith("backups/") || relative.endsWith(".tmp")) continue;
    if (entry.isDirectory()) await walk(absolute, base, out);
    else if (entry.isFile()) out.push(relative);
  }
}

function timestamp(date) {
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}-${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`;
}

async function main() {
  const reason = process.argv[2] || "manuel";
  if (!ALLOWED_REASONS.has(reason)) {
    console.error(`Geçersiz neden: ${reason}. Kullanılabilir: ${[...ALLOWED_REASONS].join(", ")}`);
    process.exit(2);
  }
  const dataDir = path.resolve(readEnvValue("DATA_DIR") || path.join(process.cwd(), "data"));
  const relativePaths = [];
  await walk(dataDir, dataDir, relativePaths);

  if (relativePaths.length === 0) {
    console.log(`[yedek] ${dataDir} içinde yedeklenecek veri yok (ilk kurulum veya eski sürüm). Atlandı.`);
    return;
  }

  const files = [];
  for (const relative of relativePaths.sort()) {
    const buffer = await fs.readFile(path.join(dataDir, relative));
    const text = TEXT_EXTENSIONS.has(path.extname(relative).toLowerCase());
    files.push({ path: relative, encoding: text ? "utf8" : "base64", data: buffer.toString(text ? "utf8" : "base64") });
  }
  const now = new Date();
  const document = { format: "digivideas-backup", version: 1, createdAt: now.toISOString(), reason, files };
  const compressed = gzipSync(Buffer.from(JSON.stringify(document), "utf8"), { level: 6 });

  const backupDir = path.join(dataDir, "backups");
  await fs.mkdir(backupDir, { recursive: true });
  let name = `digivideas-yedek-${timestamp(now)}-${reason}.json.gz`;
  for (let n = 2; existsSync(path.join(backupDir, name)); n += 1) {
    name = `digivideas-yedek-${timestamp(now)}-${reason}-${n}.json.gz`;
  }
  await fs.writeFile(path.join(backupDir, name), compressed);
  console.log(`[yedek] ${files.length} dosya yedeklendi → ${path.join(backupDir, name)} (${(compressed.length / 1024).toFixed(0)} KB)`);
}

main().catch((error) => {
  console.error("[yedek] Yedek alınamadı:", error);
  process.exit(1);
});
