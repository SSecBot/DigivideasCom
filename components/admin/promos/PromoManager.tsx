"use client";

import React, { useState } from "react";
import { Edit2, ExternalLink, Megaphone, Plus, Save, Trash2, Upload, X } from "lucide-react";
import { PromoItem } from "@/lib/types/cms";
import { safeHref } from "@/lib/utils/sanitize";

type PromoDraft = Partial<PromoItem> & { brand: string; title: string; url: string };

interface PromoManagerProps {
  promos: PromoItem[];
  onSave: (promo: PromoDraft) => Promise<boolean>;
  onDelete: (id: string) => void;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>, onSuccess: (url: string) => void) => void;
}

const EMPTY: PromoDraft = {
  brand: "",
  title: "",
  url: "https://",
  description: "",
  ctaText: "Ziyaret Et",
  badge: "",
  imageUrl: "",
  highlights: [],
  status: "published",
};

const inputClass =
  "w-full bg-slate-950 border border-white/10 focus:border-brand-500 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none";

export function PromoManager({ promos, onSave, onDelete, onUpload }: PromoManagerProps) {
  const [editing, setEditing] = useState<PromoDraft | null>(null);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    if (!/^https?:\/\/[^\s.]+\.[^\s]+$/i.test(editing.url.trim())) {
      setError("Bağlantı https:// ile başlayan geçerli bir adres olmalı");
      return;
    }
    const ok = await onSave({ ...editing, url: editing.url.trim(), highlights: (editing.highlights ?? []).filter(Boolean) });
    if (!ok) return;
    setEditing(null);
    setError("");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Reklamlarımız</h2>
          <p className="text-xs text-zinc-400 font-mono mt-1">
            Ana sayfada &ldquo;Hikayemiz&rdquo; bölümünden önce gösterilen kendi reklam alanlarımız.
          </p>
        </div>
        <button
          onClick={() => setEditing({ ...EMPTY, order: promos.length + 1 })}
          className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-slate-950 font-bold text-xs px-4 py-2.5 rounded-xl self-start"
        >
          <Plus className="w-4 h-4" /> Yeni Reklam
        </button>
      </div>

      {promos.length === 0 ? (
        <div className="p-10 rounded-2xl bg-slate-950/60 border border-white/10 text-center space-y-2">
          <Megaphone className="w-8 h-8 text-zinc-500 mx-auto" />
          <p className="text-sm text-zinc-300">Henüz reklam yok. Ana sayfadaki reklam alanı gizli.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {[...promos]
            .sort((a, b) => a.order - b.order)
            .map((promo) => (
              <div key={promo.id} className="p-4 rounded-2xl bg-slate-900/70 border border-white/10 flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">{promo.brand}</span>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-md ${promo.status === "published" ? "bg-emerald-500/15 text-emerald-300" : "bg-white/5 text-zinc-400"}`}
                    >
                      {promo.status === "published" ? "Yayında" : "Taslak"}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-300 truncate">{promo.title}</p>
                  <a href={safeHref(promo.url)} target="_blank" rel="noopener noreferrer" className="text-[11px] font-mono text-brand-400 inline-flex items-center gap-1 hover:underline">
                    {promo.url} <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setEditing({ ...promo })}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-zinc-200"
                  >
                    <Edit2 className="w-3.5 h-3.5" /> Düzenle
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`${promo.brand} reklamı silinsin mi?`)) onDelete(promo.id);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/5 hover:bg-red-500/20 text-xs text-zinc-400 hover:text-red-300"
                    aria-label={`${promo.brand} reklamını sil`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
          <form
            onSubmit={submit}
            className="bg-slate-900 border border-white/15 rounded-3xl p-5 sm:p-8 max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="text-lg font-bold text-white">{editing.id ? "Reklamı Düzenle" : "Yeni Reklam"}</h3>
              <button type="button" onClick={() => setEditing(null)} className="text-zinc-400 hover:text-white" aria-label="Kapat">
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && <p role="alert" className="text-xs text-red-300">{error}</p>}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="promo-brand" className="block text-xs font-mono text-zinc-300">Marka *</label>
                <input id="promo-brand" required value={editing.brand} onChange={(e) => setEditing({ ...editing, brand: e.target.value })} className={inputClass} />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="promo-badge" className="block text-xs font-mono text-zinc-300">Etiket</label>
                <input id="promo-badge" value={editing.badge || ""} onChange={(e) => setEditing({ ...editing, badge: e.target.value })} placeholder="örn. Web Mühendisliği" className={inputClass} />
              </div>
            </div>
            <div className="space-y-1.5">
              <label htmlFor="promo-title" className="block text-xs font-mono text-zinc-300">Başlık *</label>
              <input id="promo-title" required value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} className={inputClass} />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="promo-description" className="block text-xs font-mono text-zinc-300">Açıklama</label>
              <textarea id="promo-description" rows={3} value={editing.description || ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} className={inputClass} />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="promo-highlights" className="block text-xs font-mono text-zinc-300">Öne çıkanlar (her satıra bir madde, en fazla 8)</label>
              <textarea
                id="promo-highlights"
                rows={4}
                value={(editing.highlights ?? []).join("\n")}
                onChange={(e) => setEditing({ ...editing, highlights: e.target.value.split("\n").slice(0, 8) })}
                className={inputClass}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="promo-url" className="block text-xs font-mono text-zinc-300">Bağlantı (URL) *</label>
                <input id="promo-url" required type="url" value={editing.url} onChange={(e) => setEditing({ ...editing, url: e.target.value })} className={inputClass} />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="promo-cta" className="block text-xs font-mono text-zinc-300">Buton metni</label>
                <input id="promo-cta" value={editing.ctaText || ""} onChange={(e) => setEditing({ ...editing, ctaText: e.target.value })} className={inputClass} />
              </div>
            </div>
            <div className="space-y-1.5">
              <label htmlFor="promo-image" className="block text-xs font-mono text-zinc-300">Görsel (opsiyonel — boşsa marka adı gösterilir)</label>
              <div className="flex gap-2">
                <input id="promo-image" value={editing.imageUrl || ""} onChange={(e) => setEditing({ ...editing, imageUrl: e.target.value })} placeholder="/api/uploads/... veya https://..." className={inputClass} />
                <label className="bg-white/10 hover:bg-white/20 text-white text-xs font-mono px-4 py-2.5 rounded-xl cursor-pointer flex items-center gap-1.5 flex-shrink-0">
                  <Upload className="w-3.5 h-3.5" /> Yükle
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/gif"
                    className="hidden"
                    onChange={(e) => onUpload(e, (url) => setEditing((prev) => (prev ? { ...prev, imageUrl: url } : prev)))}
                  />
                </label>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="promo-status" className="block text-xs font-mono text-zinc-300">Durum</label>
                <select id="promo-status" value={editing.status} onChange={(e) => setEditing({ ...editing, status: e.target.value as PromoItem["status"] })} className={inputClass}>
                  <option value="published">Yayında</option>
                  <option value="draft">Taslak (gizli)</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label htmlFor="promo-order" className="block text-xs font-mono text-zinc-300">Sıra</label>
                <input id="promo-order" type="number" min={1} value={editing.order ?? 1} onChange={(e) => setEditing({ ...editing, order: Number(e.target.value) })} className={inputClass} />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
              <button type="button" onClick={() => setEditing(null)} className="px-4 py-2.5 rounded-xl text-xs text-zinc-300 hover:bg-white/5">
                Vazgeç
              </button>
              <button type="submit" className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-slate-950 font-bold text-xs px-5 py-2.5 rounded-xl">
                <Save className="w-4 h-4" /> Kaydet
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
