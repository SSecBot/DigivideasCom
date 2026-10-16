/**
 * Server start hook: automatic backups (start-up + daily), Node.js runtime only.
 * BACKUP_DISABLED=1 turns it off; in development it only runs with BACKUP_IN_DEV=1.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const enabled =
      process.env.BACKUP_DISABLED !== "1" && (process.env.NODE_ENV === "production" || process.env.BACKUP_IN_DEV === "1");
    if (enabled) {
      const { startBackupSchedule } = await import("./lib/server/backup/startup");
      await startBackupSchedule();
    }
  }
}
