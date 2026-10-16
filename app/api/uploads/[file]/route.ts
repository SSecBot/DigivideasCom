import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "node:fs";
import { resolveDataPath } from "@/lib/server/storage/json-store";
import { IMAGE_CONTENT_TYPES, UPLOAD_FILE_PATTERN } from "@/lib/server/uploads/image-upload";

export async function GET(_request: NextRequest, { params }: { params: { file: string } }) {
  if (!UPLOAD_FILE_PATTERN.test(params.file)) {
    return new NextResponse("Not found", { status: 404 });
  }
  try {
    const data = await fs.readFile(resolveDataPath("uploads", params.file));
    const ext = params.file.split(".").pop() as string;
    return new NextResponse(data, {
      headers: {
        "Content-Type": IMAGE_CONTENT_TYPES[ext],
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
