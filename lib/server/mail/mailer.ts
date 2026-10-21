import nodemailer from "nodemailer";
import { MailSettingsError, isMailConfigured, mailPassword, readMailSettings } from "@/lib/server/mail/mail-settings";

export interface MailMessage {
  to: string;
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
}

/** Sends one e-mail through the SMTP account configured in the admin panel. */
export async function sendMail(message: MailMessage): Promise<void> {
  const settings = await readMailSettings();
  if (!isMailConfigured(settings)) {
    throw new MailSettingsError("E-posta ayarları yapılmamış (Siparişler → E-posta ayarları).");
  }
  const transport = nodemailer.createTransport({
    host: settings.host,
    port: settings.port,
    secure: settings.secure,
    auth: settings.user ? { user: settings.user, pass: mailPassword(settings) } : undefined,
    connectionTimeout: 15_000,
    greetingTimeout: 15_000,
    socketTimeout: 30_000,
  });
  await transport.sendMail({
    from: { name: settings.fromName, address: settings.fromEmail },
    to: message.to,
    replyTo: message.replyTo || settings.fromEmail,
    subject: message.subject,
    text: message.text,
    html: message.html,
  });
}
