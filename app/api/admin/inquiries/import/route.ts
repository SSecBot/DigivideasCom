import { NextRequest, NextResponse } from "next/server";
import { inquiryRepository } from "@/lib/server/repositories/inquiry-repository";
import { validateInquiry } from "@/lib/server/validation/inquiry";
import { jsonError, readJsonBody, requireAdmin } from "@/lib/server/http";
import { ContactInquiry } from "@/lib/types/cms";

/** Imports contact requests that the old version stored only in the admin's browser. */
export async function POST(request: NextRequest) {
  const denied = requireAdmin(request);
  if (denied) return denied;
  const body = await readJsonBody<{ items?: unknown }>(request, 2_000_000);
  if (!body || !Array.isArray(body.items)) return jsonError("Liste bekleniyordu", 400);

  const valid: ContactInquiry[] = [];
  for (const raw of body.items.slice(0, 5_000)) {
    const record = (raw ?? {}) as Record<string, unknown>;
    const { data } = validateInquiry(record);
    const id = typeof record.id === "string" ? record.id.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 80) : "";
    const createdAt = typeof record.createdAt === "string" && !Number.isNaN(Date.parse(record.createdAt)) ? record.createdAt : "";
    if (data && id && createdAt) valid.push({ ...data, id, createdAt });
  }
  const imported = await inquiryRepository.importMany(valid);
  return NextResponse.json({ imported, skipped: body.items.length - imported });
}
