"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { AlertTriangle, DatabaseBackup, Download, Loader2, RotateCcw, ShieldCheck, Trash2, Upload } from "lucide-react";
import { LegacyImport } from "@/components/admin/backups/LegacyImport";

interface BackupInfo {
  name: string;
  createdAt: string;
  reason: string;
  reasonLabel: string;
  size: number;
}

async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, { cache: "no-store", ...init });
  const body = (await response.json().catch(() => ({}))) as T & { error?: string };
  if (!response.ok) throw new Error(body.error || `İstek başarısız (${response.status})`);
  return body;
}

function formatSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1).replace(".", ",")} MB`;
}

const CONFIRM_TEXT = "GERİ YÜKLE";

export function BackupPanel({ onDataChanged }: { onDataChanged: () => void }) {
  const [backups, setBackups] = useState<BackupInfo[]>([]);
  const [contentCustomized, setContentCustomized] = useState(true);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [restoring, setRestoring] = useState<BackupInfo | null>(null);
  const [confirmText, setConfirmText] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    try {
      const data = await api<{ backups: BackupInfo[]; contentCustomized: boolean }>("/api/admin/backups");
      setBackups(data.backups);
      setContentCustomized(data.contentCustomized);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const action = async (label: string, task: () => Promise<string>) => {
    setBusy(label);
    setError("");
    setMessage("");
    try {
      setMessage(await task());
      await load();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy("");
    }
  };

  const latest = backups[0];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Yedekleme</h2>
          <p className="text-xs text-zinc-400 font-mono mt-1">
            Tüm site verisi: içerikler, talepler, analiz, müşteriler, teklifler, ödemeler, takvim, görseller ve PDF&apos;ler.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => action("create", async () => {
              const info = await api<BackupInfo>("/api/admin/backups", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" });
              return `Yedek alındı: ${info.name}`;
            })}
            disabled={Boolean(busy)}
            className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 disabled:opacity-60 text-slate-950 font-bold text-xs px-4 py-2.5 rounded-xl"
          >
            {busy === "create" ? <Loader2 className="w-4 h-4 animate-spin" /> : <DatabaseBackup className="w-4 h-4" />} Şimdi yedek al
          </button>
          <input
            ref={fileInput}
            type="file"
            accept=".gz,application/gzip"
            className="hidden"
            aria-label="Yedek dosyası seç"
            onChange={(e) => {
              const file = e.target.files?.[0];
              e.target.value = "";
              if (!file) return;
              action("upload", async () => {
                const form = new FormData();
                form.append("file", file);
                const info = await api<BackupInfo>("/api/admin/backups/upload", { method: "POST", body: form });
                return `Yedek dosyası yüklendi: ${info.name}. Listeden geri yükleyebilirsiniz.`;
              });
            }}
          />
          <button
            onClick={() => fileInput.current?.click()}
            disabled={Boolean(busy)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-zinc-200 disabled:opacity-60"
          >
            {busy === "upload" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />} Yedek dosyası yükle
          </button>
        </div>
      </div>

      <LegacyImport contentCustomized={contentCustomized} onDone={() => { load(); onDataChanged(); }} />

      <div className="p-4 rounded-2xl bg-slate-900/70 border border-white/10 text-xs text-zinc-300 space-y-1.5">
        <p className="flex items-center gap-2 text-white font-semibold">
          <ShieldCheck className="w-4 h-4 text-emerald-400" /> Otomatik yedekler açık
        </p>
        <p>• Sunucu her başladığında (her güncellemeden sonra, veriler değişmeden önce) ve her gün bir kez yedek alınır.</p>
        <p>• &ldquo;Verileri Sıfırla&rdquo; ve &ldquo;Geri yükle&rdquo; işlemlerinden önce mevcut durum mutlaka yedeklenir.</p>
        <p>• Son 14 otomatik ve son 40 diğer yedek saklanır. Önemli yedekleri bilgisayarınıza da indirin.</p>
        <p className="text-zinc-400">
          Son yedek: {latest ? `${new Date(latest.createdAt).toLocaleString("tr-TR")} (${latest.reasonLabel})` : "henüz yok"}
        </p>
      </div>

      {error && (
        <div role="alert" className="p-4 rounded-2xl bg-red-500/10 border border-red-500/40 text-sm text-red-300 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" /> {error}
        </div>
      )}
      {message && <div role="status" className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-sm text-emerald-200">{message}</div>}

      {loading ? (
        <div className="h-32 rounded-2xl bg-slate-900/60 animate-pulse" aria-busy="true" />
      ) : backups.length === 0 ? (
        <p className="p-8 rounded-2xl bg-slate-950/60 border border-white/10 text-center text-sm text-zinc-400">
          Henüz yedek yok. &ldquo;Şimdi yedek al&rdquo; ile ilk yedeği oluşturun.
        </p>
      ) : (
        <div className="space-y-2">
          {backups.map((backup) => (
            <div key={backup.name} className="p-4 rounded-2xl bg-slate-900/70 border border-white/10 flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white">{new Date(backup.createdAt).toLocaleString("tr-TR")}</p>
                <p className="text-[11px] font-mono text-zinc-400 truncate">
                  {backup.reasonLabel} · {formatSize(backup.size)} · {backup.name}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <a
                  href={`/api/admin/backups/${encodeURIComponent(backup.name)}`}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-zinc-200"
                >
                  <Download className="w-3.5 h-3.5" /> İndir
                </a>
                <button
                  onClick={() => {
                    setRestoring(backup);
                    setConfirmText("");
                  }}
                  disabled={Boolean(busy)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-amber-400/15 hover:bg-amber-400/25 text-xs text-amber-200 disabled:opacity-60"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Geri yükle
                </button>
                <button
                  onClick={() => {
                    if (confirm(`${backup.name} silinsin mi? Bu yedek kalıcı olarak kaldırılır.`)) {
                      action("delete", async () => {
                        await api(`/api/admin/backups/${encodeURIComponent(backup.name)}`, { method: "DELETE" });
                        return "Yedek silindi.";
                      });
                    }
                  }}
                  disabled={Boolean(busy)}
                  className="p-2 rounded-lg text-zinc-500 hover:text-red-300 disabled:opacity-60"
                  aria-label={`${backup.name} sil`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {restoring && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Yedeği geri yükle">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const target = restoring;
              setRestoring(null);
              action("restore", async () => {
                const result = await api<{ safetyBackup: BackupInfo; restoredFiles: number }>(
                  `/api/admin/backups/${encodeURIComponent(target.name)}/restore`,
                  { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ confirm: CONFIRM_TEXT }) }
                );
                onDataChanged();
                return `Geri yüklendi (${result.restoredFiles} dosya). Önceki durum "${result.safetyBackup.name}" olarak yedeklendi; gerekirse ona geri dönebilirsiniz.`;
              });
            }}
            className="bg-slate-900 border border-white/15 rounded-3xl p-6 max-w-md w-full space-y-4"
          >
            <h3 className="text-lg font-bold text-white">Yedeği geri yükle</h3>
            <p className="text-sm text-zinc-300">
              Sitedeki <strong>tüm veriler</strong> {new Date(restoring.createdAt).toLocaleString("tr-TR")} tarihli yedekteki hâline döner. Şu anki durum
              önce otomatik olarak yedeklenir.
            </p>
            <label htmlFor="restore-confirm" className="block text-xs font-mono text-zinc-400">
              Onaylamak için <strong className="text-white">{CONFIRM_TEXT}</strong> yazın
            </label>
            <input
              id="restore-confirm"
              autoFocus
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              className="w-full bg-slate-950 border border-white/15 focus:border-brand-500 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none"
            />
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setRestoring(null)} className="px-4 py-2.5 rounded-xl text-xs text-zinc-300 hover:bg-white/5">
                Vazgeç
              </button>
              <button
                type="submit"
                disabled={confirmText.trim().toLocaleUpperCase("tr") !== CONFIRM_TEXT}
                className="inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-300 disabled:opacity-40 text-slate-950 font-bold text-xs px-4 py-2.5 rounded-xl"
              >
                <RotateCcw className="w-4 h-4" /> Geri yükle
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
