import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { createProposal } from "@/lib/server/crm/crm-service";
import {
  addProposalAttachments,
  isPdf,
  readProposalAttachment,
  removeProposalAttachment,
  safePdfName,
} from "@/lib/server/crm/proposal-files";
import { CrmValidationError, normalizeClient } from "@/lib/server/validation/crm";
import { contractState, daysUntil } from "@/lib/crm/calc";

const previousDataDir = process.env.DATA_DIR;
let dataDir = "";

beforeEach(() => {
  if (dataDir) rmSync(dataDir, { recursive: true, force: true });
  dataDir = mkdtempSync(path.join(tmpdir(), "dv-files-"));
  process.env.DATA_DIR = dataDir;
});

afterAll(() => {
  if (dataDir) rmSync(dataDir, { recursive: true, force: true });
  process.env.DATA_DIR = previousDataDir;
});

const pdfBytes = new TextEncoder().encode("%PDF-1.4\n1 0 obj << >> endobj\n%%EOF");
const proposalInput = {
  title: "Paket",
  clientName: "Kahve Durağı",
  items: [{ service: "Sosyal Medya Yönetimi", quantity: 1, unitPrice: 1000 }],
};

describe("proposal PDF attachments", () => {
  it("stores a PDF, records it in history and serves it back (Happy Path)", async () => {
    // 1. Arrange
    const proposal = await createProposal(proposalInput);

    // 2. Act
    const updated = await addProposalAttachments(proposal.id, [{ name: "C:\\Belgeler\\teklif sunumu.PDF", bytes: pdfBytes }]);
    const attachment = updated?.attachments?.[0];
    const file = attachment ? await readProposalAttachment(proposal.id, attachment.id) : null;

    // 3. Assert
    expect(attachment).toMatchObject({ name: "teklif sunumu.pdf", size: pdfBytes.length });
    expect(updated?.history.at(-1)).toMatchObject({ action: "dosya_eklendi", note: "teklif sunumu.pdf" });
    expect(file?.data.equals(Buffer.from(pdfBytes))).toBe(true);
  });

  it("rejects non-PDF content even with a .pdf name (Edge Case 1)", async () => {
    // 1. Arrange
    const proposal = await createProposal(proposalInput);
    const fake = new TextEncoder().encode("<html><script>alert(1)</script></html>");

    // 2. Act & 3. Assert
    await expect(addProposalAttachments(proposal.id, [{ name: "teklif.pdf", bytes: fake }])).rejects.toThrow(CrmValidationError);
    await expect(addProposalAttachments(proposal.id, [])).rejects.toThrow(CrmValidationError);
    expect(await addProposalAttachments("tkl-missing", [{ name: "a.pdf", bytes: pdfBytes }])).toBeNull();
  });

  it("hides removed files and refuses path-like file ids (Edge Case 2)", async () => {
    // 1. Arrange
    const proposal = await createProposal(proposalInput);
    const updated = await addProposalAttachments(proposal.id, [{ name: "a.pdf", bytes: pdfBytes }]);
    const fileId = updated?.attachments?.[0].id as string;

    // 2. Act
    const afterRemove = await removeProposalAttachment(proposal.id, fileId);

    // 3. Assert
    expect(afterRemove?.attachments).toEqual([]);
    expect(afterRemove?.history.at(-1)?.action).toBe("dosya_silindi");
    expect(await readProposalAttachment(proposal.id, fileId)).toBeNull();
    expect(await readProposalAttachment(proposal.id, "../../content")).toBeNull();
  });
});

describe("isPdf / safePdfName", () => {
  it("recognises the PDF signature and keeps readable names (Happy Path)", () => {
    // 1. Arrange & 2. Act & 3. Assert
    expect(isPdf(pdfBytes)).toBe(true);
    expect(safePdfName("Kahve Durağı Teklif.pdf")).toBe("Kahve Durağı Teklif.pdf");
  });

  it("strips paths and unsafe characters (Edge Case 1)", () => {
    // 1. Arrange & 2. Act & 3. Assert
    expect(safePdfName('../../etc/"evil"<name>?.pdf')).toBe("evilname.pdf");
    expect(safePdfName("rapor")).toBe("rapor.pdf");
  });

  it("falls back for empty names and short buffers (Edge Case 2)", () => {
    // 1. Arrange & 2. Act & 3. Assert
    expect(safePdfName("")).toBe("teklif.pdf");
    expect(isPdf(new Uint8Array([0x25, 0x50]))).toBe(false);
  });
});

describe("client contract end date", () => {
  const base = { name: "Kahve Durağı", status: "aktif" };

  it("accepts an end date after the start date (Happy Path)", () => {
    // 1. Arrange & 2. Act
    const client = normalizeClient({ ...base, startDate: "2026-01-01", endDate: "2026-12-31" });

    // 3. Assert
    expect(client.endDate).toBe("2026-12-31");
  });

  it("rejects an end date before the start date (Edge Case 1)", () => {
    // 1. Arrange & 2. Act & 3. Assert
    expect(() => normalizeClient({ ...base, startDate: "2026-06-01", endDate: "2026-05-31" })).toThrow(CrmValidationError);
  });

  it("classifies contracts as running, ending soon or ended (Edge Case 2)", () => {
    // 1. Arrange
    const today = "2026-10-16";

    // 2. Act & 3. Assert
    expect(contractState(undefined, today)).toBeNull();
    expect(contractState("2026-12-31", today)).toBe("devam");
    expect(contractState("2026-11-15", today)).toBe("yaklasiyor");
    expect(contractState("2026-10-15", today)).toBe("doldu");
    expect(daysUntil("2026-10-16", today)).toBe(0);
    expect(daysUntil("2027-03-29", "2027-03-27")).toBe(2); // across a DST change
  });
});
