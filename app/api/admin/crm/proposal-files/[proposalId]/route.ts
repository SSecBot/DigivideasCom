import { NextRequest, NextResponse } from "next/server";
import { MAX_ATTACHMENTS, MAX_PDF_BYTES, addProposalAttachments } from "@/lib/server/crm/proposal-files";
import { CrmValidationError } from "@/lib/server/validation/crm";
import { jsonError, requireAdmin } from "@/lib/server/http";

/** Uploads one or more PDF files to a proposal (multipart field "files"). */
export async function POST(request: NextRequest, { params }: { params: { proposalId: string } }) {
  const denied = requireAdmin(request);
  if (denied) return denied;

  const declared = Number(request.headers.get("content-length") || 0);
  if (declared > MAX_PDF_BYTES * MAX_ATTACHMENTS + 1_000_000) return jsonError("Dosyalar çok büyük", 413);

  const form = await request.formData().catch(() => null);
  const files = form?.getAll("files").filter((entry): entry is File => entry instanceof File) ?? [];

  try {
    const proposal = await addProposalAttachments(
      params.proposalId,
      await Promise.all(files.map(async (file) => ({ name: file.name, bytes: new Uint8Array(await file.arrayBuffer()) })))
    );
    return proposal ? NextResponse.json(proposal, { status: 201 }) : jsonError("Teklif bulunamadı", 404);
  } catch (error) {
    if (error instanceof CrmValidationError) return jsonError(error.message, 422);
    throw error;
  }
}
