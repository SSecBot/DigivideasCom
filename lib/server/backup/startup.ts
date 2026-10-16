import { createBackup, ensureDailyBackup, listBackups } from "@/lib/server/backup/backup-service";
import { getDataDir, listFiles } from "@/lib/server/storage/json-store";

/**
 * Called once when the Node.js server starts (see instrumentation.ts):
 * - takes a "sunucu-baslangici" backup, so data that existed before an update
 *   (deploy = restart) is saved before any request can change it;
 * - then checks every hour whether the daily automatic backup is due.
 */
export async function startBackupSchedule() {
  try {
    const hasData = (await listFiles(getDataDir())).some((name) => name !== "backups");
    const latest = (await listBackups())[0];
    const recent = latest && Date.now() - Date.parse(latest.createdAt) < 10 * 60 * 1000;
    if (hasData && !recent) await createBackup("sunucu-baslangici");
  } catch (error) {
    console.error("[yedek] Başlangıç yedeği alınamadı:", error);
  }

  const timer = setInterval(() => {
    ensureDailyBackup().catch((error) => console.error("[yedek] Günlük yedek alınamadı:", error));
  }, 60 * 60 * 1000);
  timer.unref?.();
}
