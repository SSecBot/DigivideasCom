import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { gzipSync } from "node:zlib";
import { execFileSync } from "node:child_process";
import {
  BackupError,
  createBackup,
  importBackupFile,
  listBackups,
  parseBackupBuffer,
  readBackupFile,
  restoreBackup,
} from "@/lib/server/backup/backup-service";

const previousDataDir = process.env.DATA_DIR;
let dataDir = "";

beforeEach(() => {
  if (dataDir) rmSync(dataDir, { recursive: true, force: true });
  dataDir = mkdtempSync(path.join(tmpdir(), "dv-backup-"));
  process.env.DATA_DIR = dataDir;
  mkdirSync(path.join(dataDir, "uploads"), { recursive: true });
  mkdirSync(path.join(dataDir, "crm"), { recursive: true });
  writeFileSync(path.join(dataDir, "content.json"), JSON.stringify({ services: [{ id: "srv-1", title: "Özgün" }] }));
  writeFileSync(path.join(dataDir, "crm", "clients.json"), "[]");
  writeFileSync(path.join(dataDir, "uploads", "logo.png"), Buffer.from([0x89, 0x50, 0x4e, 0x47, 0, 1, 2, 255]));
});

afterAll(() => {
  if (dataDir) rmSync(dataDir, { recursive: true, force: true });
  process.env.DATA_DIR = previousDataDir;
});

describe("backups", () => {
  it("backs up everything and restores it byte-for-byte (Happy Path)", async () => {
    // 1. Arrange
    const backup = await createBackup("manuel");
    writeFileSync(path.join(dataDir, "content.json"), JSON.stringify({ services: [] })); // later change
    writeFileSync(path.join(dataDir, "uploads", "new.png"), "x"); // file added after the backup

    // 2. Act
    const result = await restoreBackup(backup.name);

    // 3. Assert
    expect(result.restoredFiles).toBe(3);
    expect(JSON.parse(readFileSync(path.join(dataDir, "content.json"), "utf8")).services[0].title).toBe("Özgün");
    expect(Array.from(readFileSync(path.join(dataDir, "uploads", "logo.png")))).toEqual([0x89, 0x50, 0x4e, 0x47, 0, 1, 2, 255]);
    expect(existsSync(path.join(dataDir, "uploads", "new.png"))).toBe(false);
    // the state before the restore was saved too, so the restore itself can be undone
    const reasons = (await listBackups()).map((b) => b.reason);
    expect(reasons).toContain("geri-yukleme-oncesi");
  });

  it("never includes the backups folder in a backup (Edge Case 1)", async () => {
    // 1. Arrange
    await createBackup("manuel");

    // 2. Act
    const second = await createBackup("manuel");
    const document = parseBackupBuffer(await readBackupFile(second.name));

    // 3. Assert
    expect(document.files.map((f) => f.path).sort()).toEqual(["content.json", "crm/clients.json", "uploads/logo.png"]);
    expect(await listBackups()).toHaveLength(2);
  });

  it("rejects foreign files, path traversal and bad names (Edge Case 2)", async () => {
    // 1. Arrange
    const evil = gzipSync(
      Buffer.from(JSON.stringify({ format: "digivideas-backup", version: 1, files: [{ path: "../../etc/x", encoding: "utf8", data: "" }] }))
    );

    // 2. Act & 3. Assert
    await expect(importBackupFile(evil)).rejects.toThrow(BackupError);
    await expect(importBackupFile(Buffer.from("not gzip"))).rejects.toThrow(BackupError);
    await expect(readBackupFile("../content.json")).rejects.toThrow(BackupError);
  });

  it("restores backups written by the command-line script (Happy Path)", async () => {
    // 1. Arrange: run scripts/backup-data.mjs against the same data folder
    execFileSync(process.execPath, [path.resolve("scripts/backup-data.mjs"), "guncelleme-oncesi"], {
      env: { ...process.env, DATA_DIR: dataDir },
    });
    const [cliBackup] = await listBackups();
    writeFileSync(path.join(dataDir, "crm", "clients.json"), '[{"id":"cli-1"}]');

    // 2. Act
    await restoreBackup(cliBackup.name);

    // 3. Assert
    expect(cliBackup.reason).toBe("guncelleme-oncesi");
    expect(readFileSync(path.join(dataDir, "crm", "clients.json"), "utf8")).toBe("[]");
  });
});
