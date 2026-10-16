"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Loader2, Printer } from "lucide-react";
import { AdminAuthGuard } from "@/components/admin/AdminAuthGuard";
import { CrmProvider, useCrm } from "@/components/admin/crm/CrmProvider";
import { computeProposalTotals, formatTL, isItemIncluded, itemTotal } from "@/lib/crm/calc";
import { PROPOSAL_STATUS_LABELS, Proposal, ProposalItem } from "@/lib/crm/types";
import { CONTACT } from "@/lib/seo/site";

/**
 * Printable A4 proposal. "PDF olarak kaydet" opens the browser print dialog,
 * where "PDF olarak kaydet / Save as PDF" produces the file.
 */

function formatDay(value?: string): string {
  if (!value) return "–";
  const date = value.length === 10 ? new Date(`${value}T12:00:00`) : new Date(value);
  return date.toLocaleDateString("tr-TR", { day: "2-digit", month: "long", year: "numeric" });
}

function ItemsTable({ items, title, muted = false }: { items: ProposalItem[]; title?: string; muted?: boolean }) {
  return (
    <div className="space-y-2">
      {title && <h3 className="text-sm font-bold text-zinc-800">{title}</h3>}
      <table className={`w-full text-[12px] border-collapse ${muted ? "text-zinc-500" : "text-zinc-800"}`}>
        <thead>
          <tr className="border-b-2 border-zinc-800 text-left">
            <th className="py-2 pr-3 font-semibold">Hizmet</th>
            <th className="py-2 pr-3 font-semibold text-right w-14">Adet</th>
            <th className="py-2 pr-3 font-semibold text-right w-28">Birim fiyat</th>
            <th className="py-2 font-semibold text-right w-28">Tutar</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} className="border-b border-zinc-200 align-top break-inside-avoid">
              <td className="py-2 pr-3">
                <div className="font-medium">
                  {item.service}
                  {item.optional && <span className="ml-1.5 text-[10px] font-normal uppercase tracking-wide text-orange-700">opsiyonel</span>}
                </div>
                {item.description && <div className="text-[11px] text-zinc-500 mt-0.5">{item.description}</div>}
              </td>
              <td className="py-2 pr-3 text-right tabular-nums">{item.quantity}</td>
              <td className="py-2 pr-3 text-right tabular-nums">{formatTL(item.unitPrice)}</td>
              <td className="py-2 text-right tabular-nums">{formatTL(itemTotal(item))}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ProposalDocument({ proposal }: { proposal: Proposal }) {
  const totals = computeProposalTotals(proposal.items, proposal.discountRate, proposal.vatRate);
  const included = proposal.items.filter(isItemIncluded);
  const notIncluded = proposal.items.filter((item) => !isItemIncluded(item));

  return (
    <article className="bg-white text-zinc-800 w-full max-w-[210mm] mx-auto shadow-2xl print:shadow-none print:max-w-none">
      <header className="print-exact bg-background text-white px-8 py-6 flex items-center justify-between gap-6">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/assets/logo.png" alt="digivideas" className="h-10 w-auto" />
        <div className="text-right">
          <p className="text-xl font-bold tracking-tight">TEKLİF</p>
          <p className="text-xs text-zinc-300 font-mono">{proposal.number}</p>
        </div>
      </header>

      <div className="px-8 py-7 space-y-7">
        <div className="grid grid-cols-2 gap-6 text-[12px]">
          <div className="space-y-0.5">
            <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold mb-1">Sayın</p>
            <p className="text-sm font-bold">{proposal.clientName}</p>
            {proposal.contactName && <p>{proposal.contactName}</p>}
            {proposal.phone && <p>{proposal.phone}</p>}
            {proposal.email && <p>{proposal.email}</p>}
          </div>
          <div className="space-y-0.5 text-right">
            <p><span className="text-zinc-500">Teklif tarihi:</span> {formatDay(proposal.createdAt)}</p>
            {proposal.updatedAt !== proposal.createdAt && (
              <p><span className="text-zinc-500">Güncelleme:</span> {formatDay(proposal.updatedAt)}</p>
            )}
            {proposal.validUntil && <p><span className="text-zinc-500">Geçerlilik:</span> {formatDay(proposal.validUntil)}</p>}
            <p><span className="text-zinc-500">Durum:</span> {PROPOSAL_STATUS_LABELS[proposal.status]}</p>
          </div>
        </div>

        <h2 className="text-lg font-bold text-zinc-900 border-l-4 border-orange-500 pl-3 print-exact">{proposal.title}</h2>

        <ItemsTable items={included} />

        <div className="flex justify-end break-inside-avoid">
          <dl className="w-72 text-[12px] space-y-1.5">
            <div className="flex justify-between"><dt className="text-zinc-500">Ara toplam</dt><dd className="tabular-nums">{formatTL(totals.subtotal)}</dd></div>
            {totals.discount > 0 && (
              <div className="flex justify-between"><dt className="text-zinc-500">İndirim (%{proposal.discountRate})</dt><dd className="tabular-nums">−{formatTL(totals.discount)}</dd></div>
            )}
            <div className="flex justify-between"><dt className="text-zinc-500">KDV (%{proposal.vatRate})</dt><dd className="tabular-nums">{formatTL(totals.vat)}</dd></div>
            <div className="flex justify-between text-base font-bold border-t-2 border-zinc-800 pt-2">
              <dt>Genel toplam</dt>
              <dd className="tabular-nums">{formatTL(totals.total)}</dd>
            </div>
          </dl>
        </div>

        {notIncluded.length > 0 && (
          <div className="break-inside-avoid">
            <ItemsTable items={notIncluded} title="Opsiyonel hizmetler (toplama dahil değildir)" muted />
          </div>
        )}

        {proposal.notes && (
          <div className="break-inside-avoid space-y-1">
            <h3 className="text-sm font-bold text-zinc-800">Notlar ve koşullar</h3>
            <p className="text-[12px] whitespace-pre-line leading-relaxed">{proposal.notes}</p>
          </div>
        )}
      </div>

      <footer className="px-8 py-4 border-t border-zinc-200 text-[10px] text-zinc-500 flex flex-wrap justify-between gap-2">
        <span>digivideas Dijital Reklam Ajansı · {CONTACT.city}, {CONTACT.region}</span>
        <span>{CONTACT.email} · +90 549 211 55 61 · digivideas.com</span>
      </footer>
    </article>
  );
}

function ProposalPrintView() {
  const params = useParams<{ id: string }>();
  const { proposals, loaded, error } = useCrm();
  const proposal = proposals.find((item) => item.id === params?.id);

  // The browser uses the document title as the default PDF file name
  useEffect(() => {
    if (proposal) document.title = `${proposal.number} - ${proposal.clientName} - digivideas Teklif`;
  }, [proposal]);

  if (!loaded) {
    return (
      <div className="min-h-screen flex items-center justify-center text-zinc-400 text-sm gap-2">
        <Loader2 className="w-4 h-4 animate-spin" /> Teklif yükleniyor…
      </div>
    );
  }
  if (!proposal) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 text-sm text-zinc-300">
        <p>{error || "Teklif bulunamadı."}</p>
        <Link href="/dashboard/admin/digivideas" className="text-brand-400 hover:underline">
          Yönetim paneline dön
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-6 sm:py-10 px-3 print:p-0 bg-zinc-900 print:bg-white">
      <div className="print:hidden max-w-[210mm] mx-auto mb-4 flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={() => (window.history.length > 1 ? window.history.back() : window.close())}
          className="inline-flex items-center gap-1.5 text-xs text-zinc-300 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" /> Geri
        </button>
        <div className="flex items-center gap-3">
          <p className="hidden sm:block text-[11px] text-zinc-400">Yazdırma penceresinde hedef olarak &ldquo;PDF olarak kaydet&rdquo;i seçin.</p>
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-slate-950 font-bold text-xs px-4 py-2.5 rounded-xl"
          >
            <Printer className="w-4 h-4" /> PDF olarak kaydet / Yazdır
          </button>
        </div>
      </div>
      <div className="overflow-x-auto print:overflow-visible">
        <div className="min-w-[640px] print:min-w-0">
          <ProposalDocument proposal={proposal} />
        </div>
      </div>
    </div>
  );
}

export default function ProposalPrintPage() {
  return (
    <AdminAuthGuard>
      <CrmProvider>
        <ProposalPrintView />
      </CrmProvider>
    </AdminAuthGuard>
  );
}
