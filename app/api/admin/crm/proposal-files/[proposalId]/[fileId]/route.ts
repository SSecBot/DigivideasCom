import { NextRequest, NextResponse } from "next/server";
import { readProposalAttachment, removeProposalAttachment } from "@/lib/server/crm/proposal-files";
import { jsonError, requireAdmin } from "@/lib/server/http";

type Params = { params: { proposalId: string; fileId: string } };

/** Streams a proposal PDF to an authenticated admin (inline view, or ?download=1). */
export async function GET(request: NextRequest, { params }: Params) {
  const denied = requireAdmin(request);
  if (denied) return denied;
  const file = await readProposalAttachment(params.proposalId, params.fileId);
  if (!file) return jsonError("Dosya bulunamadı", 404);

  const download = request.nextUrl.searchParams.get("download") === "1";
  const encodedName = encodeURIComponent(file.attachment.name);
  return new NextResponse(new Uint8Array(file.data), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `${download ? "attachment" : "inline"}; filename*=UTF-8''${encodedName}`,
      "Content-Length": String(file.data.length),
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "SAMEORIGIN",
      "Referrer-Policy": "no-referrer",
      "X-Robots-Tag": "noindex",
    },
  });
}

export async function DELETE(request: NextRequest, { params }: Params) {
  const denied = requireAdmin(request);
  if (denied) return denied;
  const proposal = await removeProposalAttachment(params.proposalId, params.fileId);
  return proposal ? NextResponse.json(proposal) : jsonError("Dosya bulunamadı", 404);
}
