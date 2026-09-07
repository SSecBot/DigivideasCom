"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  Layers,
  HelpCircle,
} from "lucide-react";
import { useCMSStore } from "@/lib/store/cms-store";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { MarkdownRenderer } from "@/components/ui/MarkdownRenderer";

export default function DynamicServiceDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const { services } = useCMSStore();

  const service = services.find((s) => s.slug === slug);

  if (!service) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-brand-500/10 border border-brand-500/30 flex items-center justify-center text-brand-400">
          <HelpCircle className="w-8 h-8" />
        </div>
        <div className="space-y-2 max-w-md">
          <h1 className="text-2xl font-bold text-white">Hizmet Bulunamadı</h1>
          <p className="text-sm text-zinc-400">
            Aradığınız &ldquo;<span className="font-mono text-brand-400">{slug}</span>&rdquo; hizmeti mevcut değil veya henüz yayınlanmamış olabilir.
          </p>
        </div>
        <Link
          href="/services"
          className="inline-flex items-center gap-2 bg-brand-500 text-slate-950 font-bold px-6 py-3 rounded-xl text-sm shadow-glow-orange"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Tüm Hizmetlerimize Göz Atın</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-16 py-12 pb-24">
      {/* Back Link & Navigation Bar */}
      <div className="w-full max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-12">
        <Link
          href="/services"
          className="inline-flex items-center gap-2 text-xs font-mono text-zinc-400 hover:text-brand-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Tüm Hizmetlerimize Geri Dön</span>
        </Link>
      </div>

      {/* Main Service Hero */}
      <section className="w-full max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-400 text-xs font-mono">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{service.category}</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
              {service.title}
            </h1>

            <p className="text-lg text-zinc-300 leading-relaxed">
              {service.shortDesc}
            </p>

            <div className="pt-2 flex flex-wrap gap-4">
              <MagneticButton strength={20}>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-slate-950 font-bold px-7 py-3.5 rounded-2xl shadow-glow-orange transition-all"
                >
                  <span>Bu Hizmet İçin Teklif Alın</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </MagneticButton>
            </div>
          </div>

          <div className="lg:col-span-5 relative h-80 sm:h-96 rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
            <Image
              src={service.heroImage}
              alt={service.title}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
          </div>
        </div>
      </section>

      {/* Detailed Content & Deliverables Grid */}
      <section className="w-full max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left Column: Full Content */}
          <div className="lg:col-span-8 space-y-8">
            <div className="p-8 sm:p-10 rounded-3xl bg-slate-900/70 border border-white/10 space-y-6">
              <h2 className="text-2xl font-bold text-white border-b border-white/10 pb-4">
                Hizmet Kapsamı ve Uygulama Süreci
              </h2>

              <MarkdownRenderer content={service.fullContent} />
            </div>

            {/* Features Checklist */}
            <div className="p-8 sm:p-10 rounded-3xl bg-slate-900/70 border border-white/10 space-y-6">
              <h3 className="text-xl font-bold text-white">Neler Sunuyoruz?</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {service.features.map((feat, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-start gap-3"
                  >
                    <CheckCircle2 className="w-5 h-5 text-brand-400 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-zinc-200 font-medium">{feat}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Deliverables & Quick Summary */}
          <div className="lg:col-span-4 space-y-6">
            <div className="p-6 rounded-3xl bg-slate-900/90 border border-brand-500/30 shadow-glow-orange space-y-6 sticky top-28">
              <div className="space-y-1">
                <span className="text-xs font-mono font-bold text-brand-400 uppercase">
                  Teslim Edilecekler
                </span>
                <h4 className="text-xl font-bold text-white">Paket Çıktıları</h4>
              </div>

              <ul className="space-y-3 text-sm text-zinc-300">
                {service.deliverables.map((item, idx) => (
                  <li key={idx} className="flex items-center gap-2.5">
                    <div className="w-2 h-2 rounded-full bg-brand-500" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <div className="pt-4 border-t border-white/10 space-y-3">
                <div className="flex items-center gap-2 text-xs text-zinc-400">
                  <ShieldCheck className="w-4 h-4 text-brand-400" />
                  <span>Mühendislik Garantisi & Canlı Raporlama</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-zinc-400">
                  <Zap className="w-4 h-4 text-brand-400" />
                  <span>Hızlı Entegrasyon (7 İş Günü)</span>
                </div>
              </div>

              <Link
                href="/contact"
                className="w-full bg-brand-500 hover:bg-brand-600 text-slate-950 font-bold py-3.5 px-4 rounded-xl shadow-glow-orange text-center block text-sm transition-all"
              >
                Hemen Başlayalım
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
