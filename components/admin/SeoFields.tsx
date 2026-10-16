"use client";

import React from "react";

/**
 * Editable SEO title/description for a CMS record, with Google-friendly length
 * counters. Empty fields fall back to the record's own title/summary on the site.
 */

const fieldClass =
  "w-full bg-slate-950 border border-white/15 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-brand-500";

function Counter({ length, max }: { length: number; max: number }) {
  return (
    <span className={`text-[10px] font-mono ${length > max ? "text-amber-300" : "text-zinc-500"}`}>
      {length}/{max}
    </span>
  );
}

interface SeoFieldsProps {
  idPrefix: string;
  metaTitle?: string;
  metaDescription?: string;
  fallbackTitle?: string;
  fallbackDescription?: string;
  onChange: (patch: { metaTitle?: string; metaDescription?: string }) => void;
}

export function SeoFields({ idPrefix, metaTitle = "", metaDescription = "", fallbackTitle, fallbackDescription, onChange }: SeoFieldsProps) {
  return (
    <fieldset className="space-y-3 p-4 rounded-2xl bg-slate-950/50 border border-white/10">
      <legend className="px-1 text-[11px] font-mono font-bold text-brand-400 uppercase tracking-wider">SEO (Google görünümü)</legend>
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <label htmlFor={`${idPrefix}-meta-title`} className="text-xs font-mono text-zinc-300">SEO başlığı</label>
          <Counter length={metaTitle.length} max={60} />
        </div>
        <input
          id={`${idPrefix}-meta-title`}
          value={metaTitle}
          maxLength={200}
          onChange={(e) => onChange({ metaTitle: e.target.value })}
          placeholder={fallbackTitle ? `Boşsa: ${fallbackTitle}` : "Arama sonuçlarında görünecek başlık"}
          className={fieldClass}
        />
      </div>
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <label htmlFor={`${idPrefix}-meta-desc`} className="text-xs font-mono text-zinc-300">SEO açıklaması</label>
          <Counter length={metaDescription.length} max={160} />
        </div>
        <textarea
          id={`${idPrefix}-meta-desc`}
          rows={2}
          value={metaDescription}
          maxLength={400}
          onChange={(e) => onChange({ metaDescription: e.target.value })}
          placeholder={fallbackDescription ? `Boşsa özet kullanılır: ${fallbackDescription.slice(0, 80)}…` : "Arama sonuçlarındaki 1–2 cümlelik açıklama"}
          className={fieldClass}
        />
      </div>
    </fieldset>
  );
}
