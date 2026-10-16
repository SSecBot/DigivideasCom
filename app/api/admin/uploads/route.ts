import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { promises as fs } from "node:fs";
import { resolveDataPath } from "@/lib/server/storage/json-store";
import { MAX_UPLOAD_BYTES, detectImageExtension } from "@/lib/server/uploads/image-upload";
import { jsonError, requireAdmin } from "@/lib/server/http";

export async function POST(request: NextRequest) {
  const denied = requireAdmin(request);
  if (denied) return denied;

  const form = await request.formData().catch(() => null);
  const files = form?.getAll("files").filter((entry): entry is File => entry instanceof File) ?? [];
  if (files.length === 0) return jsonError("Dosya bulunamadı", 400);
  if (files.length > 20) return jsonError("Tek seferde en fazla 20 görsel yüklenebilir", 400);

  const dir = resolveDataPath("uploads");
  await fs.mkdir(dir, { recursive: true });

  const urls: string[] = [];
  for (const file of files) {
    if (file.size > MAX_UPLOAD_BYTES) return jsonError(`${file.name} 15 MB sınırını aşıyor`, 413);
    const bytes = new Uint8Array(await file.arrayBuffer());
    const ext = detectImageExtension(bytes);
    if (!ext) return jsonError(`${file.name} desteklenmeyen biçimde (PNG, JPG, WEBP, GIF)`, 415);
    const name = `${randomUUID()}.${ext}`;
    await fs.writeFile(resolveDataPath("uploads", name), bytes);
    urls.push(`/api/uploads/${name}`);
  }

  return NextResponse.json({ urls });
}
