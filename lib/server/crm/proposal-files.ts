import { randomUUID } from "node:crypto";
import { promises as fs } from "node:fs";
import { Proposal, ProposalAttachment } from "@/lib/crm/types";
import { crmRepositories } from "@/lib/server/repositories/crm-repository";
import { resolveDataPath } from "@/lib/server/storage/json-store";
import { CrmValidationError } from "@/lib/server/validation/crm";

/**
 * PDF attachments for proposals. Files live in DATA_DIR/crm/files (never under public/),
 * are only served to authenticated admins, and must really be PDFs (checked by content).
 */

export const MAX_PDF_BYTES = 10 * 1024 * 1024;
export const MAX_ATTACHMENTS = 10;
const FILE_ID = /^att-[0-9a-f-]{36}$/;

export function isPdf(bytes: Uint8Array): boolean {
  // "%PDF-" signature
  return bytes.length > 5 && bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46 && bytes[4] === 0x2d;
}

/** Keeps a readable file name without path or control characters, always ending in .pdf. */
export function safePdfName(name: string): string {
  const base = (name.split(/[\\/]/).pop() || "")
    .replace(/[\u0000-\u001f\u007f"<>:|?*]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 120);
  const withoutExt = base.replace(/\.pdf$/i, "") || "teklif";
  return `${withoutExt}.pdf`;
}

const filePath = (fileId: string) => resolveDataPath("crm", "files", `${fileId}.pdf`);

export async function addProposalAttachments(
  proposalId: string,
  files: { name: string; bytes: Uint8Array }[]
): Promise<Proposal | null> {
  const proposal = await crmRepositories.proposals.findById(proposalId);
  if (!proposal) return null;
  if (files.length === 0) throw new CrmValidationError("Dosya seçilmedi");
  if ((proposal.attachments?.length ?? 0) + files.length > MAX_ATTACHMENTS) {
    throw new CrmValidationError(`Bir teklife en fazla ${MAX_ATTACHMENTS} PDF eklenebilir`);
  }
  for (const file of files) {
    if (file.bytes.length > MAX_PDF_BYTES) throw new CrmValidationError(`${file.name} 10 MB sınırını aşıyor`);
    if (!isPdf(file.bytes)) throw new CrmValidationError(`${file.name} geçerli bir PDF dosyası değil`);
  }

  await fs.mkdir(resolveDataPath("crm", "files"), { recursive: true });
  const added: ProposalAttachment[] = [];
  for (const file of files) {
    const attachment: ProposalAttachment = {
      id: `att-${randomUUID()}`,
      name: safePdfName(file.name),
      size: file.bytes.length,
      uploadedAt: new Date().toISOString(),
    };
    await fs.writeFile(filePath(attachment.id), file.bytes);
    added.push(attachment);
  }

  return crmRepositories.proposals.update(proposalId, (current) => ({
    attachments: [...(current.attachments ?? []), ...added],
    history: [
      ...current.history,
      ...added.map((attachment) => ({ at: attachment.uploadedAt, action: "dosya_eklendi" as const, note: attachment.name })),
    ],
  }));
}

export async function readProposalAttachment(
  proposalId: string,
  fileId: string
): Promise<{ attachment: ProposalAttachment; data: Buffer } | null> {
  if (!FILE_ID.test(fileId)) return null;
  const proposal = await crmRepositories.proposals.findById(proposalId);
  const attachment = proposal?.attachments?.find((item) => item.id === fileId);
  if (!attachment) return null;
  try {
    return { attachment, data: await fs.readFile(filePath(fileId)) };
  } catch {
    return null;
  }
}

/** Removes the attachment from the proposal; the file is kept on disk (soft delete). */
export async function removeProposalAttachment(proposalId: string, fileId: string): Promise<Proposal | null> {
  const proposal = await crmRepositories.proposals.findById(proposalId);
  const attachment = proposal?.attachments?.find((item) => item.id === fileId);
  if (!proposal || !attachment) return null;
  return crmRepositories.proposals.update(proposalId, (current) => ({
    attachments: (current.attachments ?? []).filter((item) => item.id !== fileId),
    history: [...current.history, { at: new Date().toISOString(), action: "dosya_silindi", note: attachment.name }],
  }));
}
