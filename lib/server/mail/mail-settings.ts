import { readJsonFile, resolveDataPath, withFileLock, writeJsonFile } from "@/lib/server/storage/json-store";
import { openSecret, sealSecret } from "@/lib/server/security/secret-box";

/**
 * SMTP account the site sends mail from — entered in the admin panel ("E-posta ayarları").
 * The password is stored encrypted (AES-256-GCM) and never sent back to the browser.
 */

export interface StoredMailSettings {
  host: string;
  port: number;
  secure: boolean; // true = SSL/TLS (465), false = STARTTLS (587)
  user: string;
  passwordSealed?: string;
  fromName: string;
  fromEmail: string;
  notifyEmail: string; // where "ödeme alındı" notifications go
  updatedAt?: string;
}

export interface MailSettingsView extends Omit<StoredMailSettings, "passwordSealed"> {
  hasPassword: boolean;
  configured: boolean;
}

export class MailSettingsError extends Error {}

const FILE = () => resolveDataPath("settings", "mail.json");
const EMPTY: StoredMailSettings = { host: "", port: 587, secure: false, user: "", fromName: "digivideas", fromEmail: "", notifyEmail: "" };
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function readMailSettings(): Promise<StoredMailSettings> {
  return { ...EMPTY, ...(await readJsonFile<Partial<StoredMailSettings>>(FILE(), {})) };
}

export function isMailConfigured(settings: StoredMailSettings): boolean {
  return Boolean(settings.host && settings.port && settings.fromEmail && (settings.user ? settings.passwordSealed : true));
}

export function toView(settings: StoredMailSettings): MailSettingsView {
  const { passwordSealed, ...rest } = settings;
  return { ...rest, hasPassword: Boolean(passwordSealed), configured: isMailConfigured(settings) };
}

export function mailPassword(settings: StoredMailSettings): string | undefined {
  return settings.passwordSealed ? openSecret(settings.passwordSealed) : undefined;
}

/** Validates and saves; an empty password keeps the stored one. */
export async function saveMailSettings(input: Record<string, unknown>): Promise<StoredMailSettings> {
  const text = (value: unknown, max: number) => (typeof value === "string" ? value.trim().slice(0, max) : "");
  const host = text(input.host, 200).toLowerCase();
  const port = Number(input.port);
  const fromEmail = text(input.fromEmail, 200).toLowerCase();
  const notifyEmail = text(input.notifyEmail, 200).toLowerCase();
  if (!/^[a-z0-9.-]+$/.test(host)) throw new MailSettingsError("SMTP sunucusu geçersiz (ör. smtp.gmail.com)");
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new MailSettingsError("Port geçersiz (ör. 587 veya 465)");
  if (!EMAIL.test(fromEmail)) throw new MailSettingsError("Gönderen e-posta adresi geçersiz");
  if (notifyEmail && !EMAIL.test(notifyEmail)) throw new MailSettingsError("Bildirim e-posta adresi geçersiz");

  return withFileLock(FILE(), async () => {
    const current = await readMailSettings();
    const password = typeof input.password === "string" ? input.password : "";
    const next: StoredMailSettings = {
      host,
      port,
      secure: input.secure === true,
      user: text(input.user, 200),
      passwordSealed: password ? sealSecret(password.slice(0, 500)) : current.passwordSealed,
      fromName: text(input.fromName, 100) || "digivideas",
      fromEmail,
      notifyEmail: notifyEmail || fromEmail,
      updatedAt: new Date().toISOString(),
    };
    await writeJsonFile(FILE(), next);
    return next;
  });
}
