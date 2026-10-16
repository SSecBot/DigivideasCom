import { LeadTier, PlaceLead } from "@/lib/leads/types";

export const SECTOR_PRESETS = [
  "Kafe",
  "Restoran",
  "Pastane",
  "Güzellik salonu",
  "Kuaför",
  "Berber",
  "Diş kliniği",
  "Estetik klinik",
  "Spor salonu",
  "Pilates stüdyosu",
  "Butik giyim mağazası",
  "Kuyumcu",
  "Mobilya mağazası",
  "Emlak ofisi",
  "Otel",
  "Düğün salonu",
  "Veteriner",
  "Oto galeri",
  "Sürücü kursu",
  "Anaokulu",
];

export const TIER_STYLES: Record<LeadTier, string> = {
  Sıcak: "bg-brand-500 text-slate-950",
  Ilık: "bg-amber-400/20 text-amber-300 border border-amber-400/40",
  Soğuk: "bg-white/5 text-zinc-400 border border-white/10",
};

/** wa.me link for Turkish mobile numbers (05xx / +90 5xx); null for landlines. */
export function whatsappLink(place: PlaceLead, message?: string): string | null {
  const digits = (place.internationalPhone || place.phone || "").replace(/[^0-9]/g, "");
  let normalized = digits;
  if (digits.startsWith("0")) normalized = `9${digits}`;
  else if (digits.startsWith("5") && digits.length === 10) normalized = `90${digits}`;
  if (!/^905\d{9}$/.test(normalized)) return null;
  return `https://wa.me/${normalized}${message ? `?text=${encodeURIComponent(message)}` : ""}`;
}

export function mapEmbedUrl(place: PlaceLead): string | null {
  if (place.lat === undefined || place.lng === undefined) return null;
  return `https://maps.google.com/maps?q=${place.lat},${place.lng}&z=16&output=embed`;
}

export function downloadCsv(filename: string, rows: (string | number | undefined)[][]) {
  const csv = rows
    .map((row) => row.map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`).join(";"))
    .join("\n");
  const blob = new Blob([`﻿${csv}`], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export async function leadsFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
    cache: "no-store",
  });
  const body = (await response.json().catch(() => ({}))) as T & { error?: string };
  if (!response.ok) throw new Error(body.error || `İstek başarısız (${response.status})`);
  return body;
}
