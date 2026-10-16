import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { contentRepository } from "@/lib/server/repositories/content-repository";
import {
  ContentValidationError,
  isContentCollection,
  normalizeCollection,
  normalizeNarrative,
} from "@/lib/server/validation/content";
import { jsonError, readJsonBody, requireAdmin } from "@/lib/server/http";

const MAX_BODY_BYTES = 25 * 1024 * 1024;

export async function PUT(request: NextRequest, { params }: { params: { collection: string } }) {
  const denied = requireAdmin(request);
  if (denied) return denied;

  const body = await readJsonBody<{ items?: unknown; narrative?: unknown }>(request, MAX_BODY_BYTES);
  if (!body) return jsonError("Geçersiz veya çok büyük istek gövdesi", 400);

  try {
    let snapshot;
    if (params.collection === "narrative") {
      snapshot = await contentRepository.saveNarrative(normalizeNarrative(body.narrative));
    } else if (isContentCollection(params.collection)) {
      snapshot = await contentRepository.replaceCollection(
        params.collection,
        normalizeCollection(params.collection, body.items)
      );
    } else {
      return jsonError("Bilinmeyen içerik koleksiyonu", 404);
    }
    revalidatePath("/", "layout");
    return NextResponse.json(snapshot);
  } catch (error) {
    if (error instanceof ContentValidationError) return jsonError(error.message, 422);
    throw error;
  }
}
