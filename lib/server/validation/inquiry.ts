import { ContactInquiry } from "@/lib/types/cms";
import { clampString } from "@/lib/utils/sanitize";

export type InquiryInput = Omit<ContactInquiry, "id" | "createdAt" | "deletedAt">;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_PATTERN = /^[0-9+()\s-]{7,20}$/;

/** Returns the cleaned inquiry or a user-facing error message. */
export function validateInquiry(body: unknown): { data?: InquiryInput; error?: string } {
  if (!body || typeof body !== "object") return { error: "Geçersiz form verisi" };
  const raw = body as Record<string, unknown>;

  const data: InquiryInput = {
    name: clampString(raw.name, 120).trim(),
    email: clampString(raw.email, 200).trim().toLowerCase(),
    phone: clampString(raw.phone, 30).trim(),
    company: clampString(raw.company, 160).trim() || undefined,
    service: clampString(raw.service, 160).trim(),
    message: clampString(raw.message, 5_000).trim(),
  };

  if (data.name.length < 2) return { error: "Lütfen adınızı ve soyadınızı girin" };
  if (!EMAIL_PATTERN.test(data.email)) return { error: "Geçerli bir e-posta adresi girin" };
  if (!PHONE_PATTERN.test(data.phone)) return { error: "Geçerli bir telefon numarası girin" };
  if (!data.service) return { error: "Lütfen bir hizmet seçin" };
  if (data.message.length < 10) return { error: "Mesajınız en az 10 karakter olmalıdır" };
  return { data };
}
