"use client";

import React, { useState } from "react";
import { AlertCircle, ChevronDown, Loader2, Lock } from "lucide-react";
import { MarkdownRenderer } from "@/components/ui/MarkdownRenderer";

/* eslint-disable @next/next/no-img-element */

interface CheckoutFormProps {
  token: string;
  defaults: { fullName: string; phone: string; email: string };
  contract: string;
  totalLabel: string;
}

const inputClass =
  "w-full bg-slate-950 border border-white/15 focus:border-brand-500 rounded-xl px-3.5 py-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none";

export function CheckoutForm({ token, defaults, contract, totalLabel }: CheckoutFormProps) {
  const [form, setForm] = useState({ fullName: defaults.fullName, phone: defaults.phone, identityNumber: "", address: "", city: "" });
  const [accepted, setAccepted] = useState(false);
  const [showContract, setShowContract] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!accepted) {
      setError("Devam etmek için sözleşmeleri onaylamanız gerekir.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const response = await fetch(`/api/odeme/${encodeURIComponent(token)}/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, acceptedAgreements: true }),
      });
      const body = (await response.json().catch(() => ({}))) as { paymentPageUrl?: string; error?: string };
      if (!response.ok || !body.paymentPageUrl) throw new Error(body.error || "Ödeme başlatılamadı");
      // iyzico's hosted, PCI-DSS compliant page: card details never touch this site
      window.location.assign(body.paymentPageUrl);
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-5" noValidate={false}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label htmlFor="pay-name" className="block text-xs font-mono text-zinc-300">Ad soyad *</label>
          <input id="pay-name" required autoComplete="name" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} className={inputClass} />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="pay-phone" className="block text-xs font-mono text-zinc-300">Cep telefonu *</label>
          <input id="pay-phone" required type="tel" inputMode="tel" autoComplete="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={inputClass} />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="pay-email" className="block text-xs font-mono text-zinc-300">E-posta</label>
          <input id="pay-email" value={defaults.email} readOnly className={`${inputClass} opacity-70`} />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="pay-tckn" className="block text-xs font-mono text-zinc-300">T.C. kimlik no (fatura için, isteğe bağlı)</label>
          <input
            id="pay-tckn"
            inputMode="numeric"
            maxLength={11}
            value={form.identityNumber}
            onChange={(e) => setForm({ ...form, identityNumber: e.target.value.replace(/[^0-9]/g, "") })}
            className={inputClass}
          />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <label htmlFor="pay-address" className="block text-xs font-mono text-zinc-300">Fatura adresi *</label>
          <textarea
            id="pay-address"
            required
            rows={2}
            autoComplete="street-address"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            placeholder="Mahalle, cadde/sokak, no, daire, ilçe"
            className={inputClass}
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="pay-city" className="block text-xs font-mono text-zinc-300">Şehir *</label>
          <input id="pay-city" required autoComplete="address-level1" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className={inputClass} />
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-slate-950/60">
        <button
          type="button"
          onClick={() => setShowContract((v) => !v)}
          aria-expanded={showContract}
          className="w-full flex items-center justify-between gap-3 px-4 py-3 text-sm text-zinc-200"
        >
          Ön Bilgilendirme ve Mesafeli Satış Sözleşmesi
          <ChevronDown className={`w-4 h-4 transition-transform ${showContract ? "rotate-180" : ""}`} />
        </button>
        {showContract && (
          <div className="px-4 pb-4 max-h-80 overflow-y-auto border-t border-white/10">
            <MarkdownRenderer content={contract} />
          </div>
        )}
      </div>

      <label className="flex items-start gap-3 text-sm text-zinc-300 cursor-pointer">
        <input type="checkbox" checked={accepted} onChange={(e) => setAccepted(e.target.checked)} className="mt-1 w-4 h-4 accent-orange-500 flex-shrink-0" />
        <span>
          <a href="/mesafeli-satis-sozlesmesi" target="_blank" rel="noopener" className="text-brand-400 underline">Ön Bilgilendirme Formu ve Mesafeli Satış Sözleşmesi</a>
          &apos;ni okudum ve onaylıyorum. Hizmetin ödeme sonrasında başlatılmasını kabul ediyor; ifasına başlanan hizmette cayma hakkımın
          bulunmadığını biliyorum (
          <a href="/teslimat-ve-iade" target="_blank" rel="noopener" className="text-brand-400 underline">Teslimat ve İade Şartları</a>).
        </span>
      </label>

      {error && (
        <p role="alert" className="flex items-start gap-2 text-sm text-red-300">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" /> {error}
        </p>
      )}

      <button
        type="submit"
        disabled={busy}
        className="w-full inline-flex items-center justify-center gap-3 bg-white hover:bg-zinc-100 disabled:opacity-70 text-slate-900 font-bold text-base py-3.5 rounded-2xl shadow-xl"
      >
        {busy ? <Loader2 className="w-5 h-5 animate-spin text-sky-600" /> : <img src="/assets/payment/iyzico-ile-ode.png" alt="" className="h-7 w-auto" />}
        <span>{busy ? "Güvenli ödeme sayfası açılıyor…" : `${totalLabel} öde`}</span>
      </button>
      <p className="flex items-center justify-center gap-1.5 text-[11px] text-zinc-500 text-center">
        <Lock className="w-3.5 h-3.5" /> Kart bilgileriniz iyzico&apos;nun güvenli sayfasında alınır; bu sitede saklanmaz.
      </p>
    </form>
  );
}
