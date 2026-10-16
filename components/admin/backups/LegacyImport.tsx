"use client";

import React, { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle2, History, Loader2 } from "lucide-react";
import { ContentSnapshot } from "@/lib/types/cms";
import {
  LEGACY_COLLECTIONS,
  LEGACY_IMPORTED_FLAG,
  LegacyData,
  collectDataUrls,
  dataUrlToFile,
  legacySummary,
  mergeById,
  readLegacyData,
  replaceDataUrls,
} from "@/lib/admin/legacy-import";
import { uploadImages } from "@/lib/store/admin-cms-store";

/**
 * Moves edits made with the first (browser-only) admin panel to the server.
 * Order: download the old data to the computer → server backup → upload inline images
 * → write collections. The browser's old data is left untouched.
 */

async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, { ...init, headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) } });
  const body = (await response.json().catch(() => ({}))) as T & { error?: string };
  if (!response.ok) throw new Error(body.error || `İstek başarısız (${response.status})`);
  return body;
}

function downloadJson(filename: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function useLegacyData(): { legacy: LegacyData | null; importedAt: string | null } {
  const [state, setState] = useState<{ legacy: LegacyData | null; importedAt: string | null }>({ legacy: null, importedAt: null });
  useEffect(() => {
    try {
      setState({ legacy: readLegacyData(window.localStorage), importedAt: window.localStorage.getItem(LEGACY_IMPORTED_FLAG) });
    } catch {
      // storage blocked: nothing to import
    }
  }, []);
  return state;
}

export function LegacyImport({ contentCustomized, onDone }: { contentCustomized: boolean; onDone: () => void }) {
  const { legacy, importedAt } = useLegacyData();
  const [mode, setMode] = useState<"merge" | "replace">("merge");
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState<string | null>(null);

  // A server that still has the default content cannot lose anything: the old edits replace it
  useEffect(() => setMode(contentCustomized ? "merge" : "replace"), [contentCustomized]);

  if (!legacy) return null;

  const run = async () => {
    setBusy(true);
    setError("");
    try {
      setProgress("Eski veriler bilgisayarınıza indiriliyor…");
      downloadJson(`digivideas-eski-panel-verisi-${new Date().toISOString().slice(0, 10)}.json`, legacy);

      setProgress("Sunucuda yedek alınıyor…");
      await api("/api/admin/backups", { method: "POST", body: JSON.stringify({ reason: "eski-veri-aktarimi-oncesi" }) });

      // Old uploads were stored inline as base64; move them to real files
      const dataUrls = Array.from(collectDataUrls(legacy)).filter((url) => /^data:image\/(png|jpe?g|webp|gif);/i.test(url));
      const replacements = new Map<string, string>();
      for (let i = 0; i < dataUrls.length; i += 1) {
        setProgress(`Görseller aktarılıyor (${i + 1}/${dataUrls.length})…`);
        const [url] = await uploadImages([dataUrlToFile(dataUrls[i], i)]);
        replacements.set(dataUrls[i], url);
      }
      const prepared = replaceDataUrls(legacy, replacements);

      setProgress("İçerikler sunucuya yazılıyor…");
      const server = await api<ContentSnapshot>("/api/admin/content");
      const report: string[] = [];
      for (const collection of LEGACY_COLLECTIONS) {
        const items = prepared[collection];
        if (!items) continue;
        const next =
          mode === "replace"
            ? { items, added: items.length }
            : mergeById(server[collection] as { id: string; slug?: string }[], items as { id: string; slug?: string }[]);
        if (mode === "merge" && next.added === 0) continue;
        await api(`/api/admin/content/${collection}`, { method: "PUT", body: JSON.stringify({ items: next.items }) });
        report.push(`${collection}: ${mode === "replace" ? `${items.length} kayıt` : `${next.added} yeni kayıt`}`);
      }
      if (prepared.narrative && (mode === "replace" || !contentCustomized)) {
        await api("/api/admin/content/narrative", { method: "PUT", body: JSON.stringify({ narrative: prepared.narrative }) });
        report.push("site ayarları");
      }
      if (prepared.inquiries?.length) {
        const result = await api<{ imported: number }>("/api/admin/inquiries/import", {
          method: "POST",
          body: JSON.stringify({ items: prepared.inquiries }),
        });
        report.push(`${result.imported} talep`);
      }

      window.localStorage.setItem(LEGACY_IMPORTED_FLAG, new Date().toISOString());
      setDone(report.length ? report.join(", ") : "Sunucuda zaten hepsi vardı, yeni kayıt eklenmedi.");
      onDone();
    } catch (e) {
      setError(`${(e as Error).message}. Hiçbir veri silinmedi: eski veriler tarayıcıda ve indirilen dosyada duruyor, sunucu yedeği de alındı.`);
    } finally {
      setBusy(false);
      setProgress("");
    }
  };

  return (
    <section className="p-5 rounded-2xl bg-amber-400/10 border border-amber-400/40 space-y-4">
      <div className="flex items-start gap-3">
        <History className="w-5 h-5 text-amber-300 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-white">Bu tarayıcıda eski panelden kalma değişiklikler bulundu</h3>
          <p className="text-xs text-zinc-300">
            Önceki sürüm panel değişikliklerini yalnızca bu tarayıcıda saklıyordu: {legacySummary(legacy).join(", ")}.
            Sunucuya aktarırsanız siteyi herkes bu haliyle görür.
          </p>
          {importedAt && (
            <p className="text-[11px] font-mono text-emerald-300">
              Daha önce {new Date(importedAt).toLocaleString("tr-TR")} tarihinde aktarıldı. Tekrar aktarmak güvenlidir (mevcut kayıtlar korunur).
            </p>
          )}
        </div>
      </div>

      <fieldset className="space-y-2 text-xs text-zinc-200">
        <legend className="sr-only">Aktarım yöntemi</legend>
        <label className="flex items-start gap-2 cursor-pointer">
          <input type="radio" name="legacy-mode" checked={mode === "merge"} onChange={() => setMode("merge")} className="mt-0.5 accent-orange-500" />
          <span>
            <strong>Birleştir (önerilen{contentCustomized ? "" : " değil"})</strong> — sunucudaki kayıtlara dokunulmaz, yalnızca sunucuda olmayan eski kayıtlar eklenir.
          </span>
        </label>
        <label className="flex items-start gap-2 cursor-pointer">
          <input type="radio" name="legacy-mode" checked={mode === "replace"} onChange={() => setMode("replace")} className="mt-0.5 accent-orange-500" />
          <span>
            <strong>Eski verilerle değiştir{contentCustomized ? "" : " (önerilen)"}</strong> — eski paneldeki hâli aynen sunucuya yazılır.
            {contentCustomized && (
              <span className="text-amber-300"> Sunucuda yeni panelden yapılmış değişiklikler var; bunların üzerine yazılır (öncesinde yedek alınır).</span>
            )}
          </span>
        </label>
      </fieldset>

      {error && (
        <p role="alert" className="text-xs text-red-300 flex items-start gap-1.5">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" /> {error}
        </p>
      )}
      {done && (
        <p role="status" className="text-xs text-emerald-300 flex items-start gap-1.5">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> Aktarıldı: {done}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={run}
          disabled={busy}
          className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 disabled:opacity-60 text-slate-950 font-bold text-xs px-4 py-2.5 rounded-xl"
        >
          {busy && <Loader2 className="w-4 h-4 animate-spin" />}
          Yedekle ve sunucuya aktar
        </button>
        {progress && <span className="text-xs text-zinc-300">{progress}</span>}
      </div>
    </section>
  );
}
