"use client";

import React, { useEffect, useRef, useState } from "react";
import { Building2, Eye, ExternalLink, FileText, Pencil, Save } from "lucide-react";
import { LegalPage, LegalPageSlug, SiteNarrative } from "@/lib/types/cms";
import { COMPANY_PLACEHOLDERS, LEGAL_PAGE_PATHS, ORDER_PLACEHOLDERS, companyVariables, renderTemplate } from "@/lib/legal/templates";
import { MarkdownRenderer } from "@/components/ui/MarkdownRenderer";

const inputClass =
  "w-full bg-slate-950 border border-white/15 focus:border-brand-500 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none";

type CompanyFields = Pick<
  SiteNarrative,
  "companyTitle" | "companyAddress" | "companyPhone" | "companyEmail" | "taxOffice" | "taxNumber" | "mersisNumber" | "kepAddress"
>;

const COMPANY_FIELDS: { key: keyof CompanyFields; label: string; placeholder: string; wide?: boolean }[] = [
  { key: "companyTitle", label: "Şirket unvanı *", placeholder: "Örn. Muaz X - digivideas Dijital Reklam (şahıs) / ... Ltd. Şti.", wide: true },
  { key: "companyAddress", label: "Açık adres *", placeholder: "Mahalle, cadde, no, ilçe/il", wide: true },
  { key: "companyPhone", label: "Telefon *", placeholder: "+90 549 211 55 61" },
  { key: "companyEmail", label: "E-posta *", placeholder: "info@digivideas.com" },
  { key: "taxOffice", label: "Vergi dairesi *", placeholder: "Torbalı" },
  { key: "taxNumber", label: "Vergi / TC kimlik no *", placeholder: "10 veya 11 hane" },
  { key: "mersisNumber", label: "MERSİS no (şirketse)", placeholder: "16 hane" },
  { key: "kepAddress", label: "KEP adresi (varsa)", placeholder: "firma@hs01.kep.tr" },
];

interface Props {
  legalPages: LegalPage[];
  narrative: SiteNarrative;
  onSavePage: (page: Pick<LegalPage, "slug" | "title" | "content">) => Promise<boolean>;
  onSaveCompany: (fields: CompanyFields) => Promise<boolean>;
  onToast: (message: string) => void;
}

export function LegalPagesManager({ legalPages, narrative, onSavePage, onSaveCompany, onToast }: Props) {
  const [company, setCompany] = useState<CompanyFields>({});
  const [activeSlug, setActiveSlug] = useState<LegalPageSlug>("mesafeli-satis-sozlesmesi");
  const [draft, setDraft] = useState({ title: "", content: "" });
  const [preview, setPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const page = legalPages.find((item) => item.slug === activeSlug);

  useEffect(() => {
    setCompany(Object.fromEntries(COMPANY_FIELDS.map(({ key }) => [key, narrative[key] ?? ""])) as CompanyFields);
  }, [narrative]);

  useEffect(() => {
    setDraft({ title: page?.title ?? "", content: page?.content ?? "" });
  }, [page?.title, page?.content, activeSlug]);

  const missingCompany = COMPANY_FIELDS.filter(({ label, key }) => label.endsWith("*") && !narrative[key]).map(({ label }) => label.replace(" *", ""));
  const dirty = Boolean(page) && (draft.title !== page?.title || draft.content !== page?.content);

  const insertPlaceholder = (key: string) => {
    const textarea = textareaRef.current;
    const token = `{{${key}}}`;
    if (!textarea) return;
    const { selectionStart, selectionEnd } = textarea;
    const content = draft.content.slice(0, selectionStart) + token + draft.content.slice(selectionEnd);
    setDraft({ ...draft, content });
    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(selectionStart + token.length, selectionStart + token.length);
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight">Yasal Sayfalar</h2>
        <p className="text-xs text-zinc-400 font-mono mt-1">
          iyzico başvurusu ve ödeme sayfası için gerekli sözleşmeler. Firma bilgileri tüm metinlere otomatik yerleşir.
        </p>
      </div>

      {/* Company info */}
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setSaving(true);
          if (await onSaveCompany(company)) onToast("Firma bilgileri kaydedildi; tüm sözleşmeler güncellendi.");
          setSaving(false);
        }}
        className="p-5 rounded-2xl bg-slate-900/70 border border-white/10 space-y-4"
      >
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Building2 className="w-4 h-4 text-brand-400" /> Firma bilgileri (satıcı)
          </h3>
          {missingCompany.length > 0 && (
            <span className="text-[11px] text-amber-300">Eksik: {missingCompany.join(", ")}</span>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {COMPANY_FIELDS.map(({ key, label, placeholder, wide }) => (
            <div key={key} className={`space-y-1 ${wide ? "sm:col-span-2" : ""}`}>
              <label htmlFor={`company-${key}`} className="block text-[11px] font-mono text-zinc-400">
                {label}
              </label>
              <input
                id={`company-${key}`}
                value={company[key] ?? ""}
                onChange={(e) => setCompany({ ...company, [key]: e.target.value })}
                placeholder={placeholder}
                className={inputClass}
              />
            </div>
          ))}
        </div>
        <div className="flex justify-end">
          <button type="submit" disabled={saving} className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 disabled:opacity-60 text-slate-950 font-bold text-xs px-4 py-2.5 rounded-xl">
            <Save className="w-4 h-4" /> Firma bilgilerini kaydet
          </button>
        </div>
      </form>

      {/* Page editor */}
      <div className="p-5 rounded-2xl bg-slate-900/70 border border-white/10 space-y-4">
        <div role="tablist" aria-label="Yasal sayfa" className="flex flex-wrap gap-1.5">
          {legalPages.map((item) => (
            <button
              key={item.slug}
              role="tab"
              aria-selected={item.slug === activeSlug}
              onClick={() => {
                if (dirty && !confirm("Kaydedilmemiş değişiklikler kaybolacak. Devam edilsin mi?")) return;
                setActiveSlug(item.slug);
                setPreview(false);
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs border ${item.slug === activeSlug ? "border-brand-500/60 bg-brand-500/10 text-white" : "border-white/10 text-zinc-400 hover:text-white"}`}
            >
              <FileText className="w-3.5 h-3.5" /> {item.title}
            </button>
          ))}
        </div>

        {page && (
          <>
            <div className="flex flex-col sm:flex-row sm:items-end gap-3">
              <div className="flex-1 space-y-1">
                <label htmlFor="legal-title" className="block text-[11px] font-mono text-zinc-400">Sayfa başlığı</label>
                <input id="legal-title" value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} className={inputClass} />
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setPreview((v) => !v)}
                  className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-zinc-200"
                  aria-pressed={preview}
                >
                  {preview ? <Pencil className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />} {preview ? "Düzenle" : "Önizle"}
                </button>
                <a
                  href={LEGAL_PAGE_PATHS[page.slug]}
                  target="_blank"
                  rel="noopener"
                  className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-zinc-200"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Sitede gör
                </a>
              </div>
            </div>

            {preview ? (
              <div className="p-5 rounded-xl bg-slate-950/70 border border-white/10 max-h-[60vh] overflow-y-auto">
                <MarkdownRenderer content={renderTemplate(draft.content, companyVariables(narrative, window.location.origin))} />
              </div>
            ) : (
              <>
                <div className="space-y-1.5">
                  <p className="text-[11px] font-mono text-zinc-400">Yer tutucu ekle (imlecin olduğu yere):</p>
                  <div className="flex flex-wrap gap-1.5">
                    {Object.entries(page.slug === "mesafeli-satis-sozlesmesi" ? { ...COMPANY_PLACEHOLDERS, ...ORDER_PLACEHOLDERS } : COMPANY_PLACEHOLDERS).map(
                      ([key, label]) => (
                        <button
                          key={key}
                          type="button"
                          onClick={() => insertPlaceholder(key)}
                          title={label}
                          className="px-2 py-1 rounded-md bg-white/5 hover:bg-brand-500/20 text-[11px] font-mono text-zinc-300"
                        >
                          {`{{${key}}}`}
                        </button>
                      )
                    )}
                  </div>
                  {page.slug === "mesafeli-satis-sozlesmesi" && (
                    <p className="text-[11px] text-zinc-500">Alıcı ve sipariş alanları her siparişin ödeme sayfasında o siparişin bilgileriyle doldurulur.</p>
                  )}
                </div>
                <label htmlFor="legal-content" className="sr-only">Sayfa içeriği</label>
                <textarea
                  id="legal-content"
                  ref={textareaRef}
                  rows={20}
                  value={draft.content}
                  onChange={(e) => setDraft({ ...draft, content: e.target.value })}
                  className={`${inputClass} font-mono text-xs leading-relaxed`}
                />
                <p className="text-[11px] text-zinc-500">
                  Biçim: <code>## Başlık</code>, <code>- madde</code>, <code>**kalın**</code>. Son güncelleme: {new Date(page.updatedAt).toLocaleString("tr-TR")}
                </p>
              </>
            )}

            <div className="flex justify-end">
              <button
                type="button"
                disabled={!dirty || saving}
                onClick={async () => {
                  setSaving(true);
                  if (await onSavePage({ slug: page.slug, title: draft.title, content: draft.content })) onToast(`${draft.title} kaydedildi ve yayında.`);
                  setSaving(false);
                }}
                className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 disabled:opacity-40 text-slate-950 font-bold text-xs px-4 py-2.5 rounded-xl"
              >
                <Save className="w-4 h-4" /> Sayfayı kaydet
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
