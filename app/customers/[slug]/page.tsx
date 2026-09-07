"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Sparkles,
  TrendingUp,
  ExternalLink,
  Quote,
  CheckCircle2,
  ArrowRight,
  HelpCircle,
  Trophy,
} from "lucide-react";
import { useCMSStore } from "@/lib/store/cms-store";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { CampaignGalleryMarquee } from "@/components/customers/CampaignGalleryMarquee";

export default function DynamicCustomerDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const { customers } = useCMSStore();

  const customer = customers.find((c) => c.slug === slug);

  if (!customer) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-brand-500/10 border border-brand-500/30 flex items-center justify-center text-brand-400">
          <HelpCircle className="w-8 h-8" />
        </div>
        <div className="space-y-2 max-w-md">
          <h1 className="text-2xl font-bold text-white">Müşteri Bulunamadı</h1>
          <p className="text-sm text-zinc-400">
            Aradığınız &ldquo;<span className="font-mono text-brand-400">{slug}</span>&rdquo; vaka analizi mevcut değil veya taslak durumunda olabilir.
          </p>
        </div>
        <Link
          href="/customers"
          className="inline-flex items-center gap-2 bg-brand-500 text-slate-950 font-bold px-6 py-3 rounded-xl text-sm shadow-glow-orange"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Tüm Müşteri Vaka Analizlerine Göz Atın</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-16 py-12 pb-24">
      {/* Back Link */}
      <div className="w-full max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-12">
        <Link
          href="/customers"
          className="inline-flex items-center gap-2 text-xs font-mono text-zinc-400 hover:text-brand-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Tüm Müşteri Vaka Analizlerine Geri Dön</span>
        </Link>
      </div>

      {/* Case Study Header Hero */}
      <section className="w-full max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="flex items-center gap-3">
              <span className="bg-brand-500/10 border border-brand-500/30 text-brand-400 px-3.5 py-1.5 rounded-full text-xs font-mono font-medium">
                {customer.sector}
              </span>
              <span className="text-xs font-mono text-zinc-400">
                Canlı Vaka Analizi
              </span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-tight">
              {customer.name}
            </h1>

            <p className="text-lg text-zinc-300 leading-relaxed">
              {customer.summary}
            </p>

            {customer.liveUrl && (
              <div className="pt-2">
                <a
                  href={customer.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-brand-400 hover:text-brand-300 transition-colors"
                >
                  <span>Müşteri Sayfası / Kampanyayı Canlı Gör</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            )}
          </div>

          <div className="lg:col-span-5 relative h-80 sm:h-96 rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
            <Image
              src={customer.heroImage}
              alt={customer.name}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
          </div>
        </div>
      </section>

      {/* Comprehensive Müşteri Hikayesi (Client Story) Section */}
      <section className="w-full max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-12">
        <div className="p-8 sm:p-12 rounded-3xl bg-slate-900/80 border border-brand-500/30 shadow-glow-orange space-y-5 relative overflow-hidden">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-brand-400 uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>Müşteri Hikayesi & Stratejik Yolculuk</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {customer.name} ile Dijital Büyüme ve Kalıcı Başarı Hikayesi
          </h2>

          <div className="prose prose-invert max-w-none text-zinc-300 text-base sm:text-lg leading-relaxed font-sans space-y-4">
            <p>{customer.story || customer.summary}</p>
          </div>
        </div>
      </section>

      {/* Challenge & Solution Breakdown */}
      <section className="w-full max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-8 sm:p-10 rounded-3xl bg-slate-900/70 border border-white/10 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-zinc-300">
              <span>Sektörel Zorluk</span>
            </div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <span>Pazarlama Zorluğu (The Challenge)</span>
            </h3>
            <p className="text-sm sm:text-base text-zinc-300 leading-relaxed">
              {customer.challenge}
            </p>
          </div>

          <div className="p-8 sm:p-10 rounded-3xl bg-slate-900/70 border border-brand-500/40 shadow-glow-orange space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/15 border border-brand-500/30 text-xs font-mono text-brand-400">
              <span>İnovatif Strateji</span>
            </div>
            <h3 className="text-xl font-bold text-brand-400 flex items-center gap-2">
              <span>Digivideas Çözüm Stratejisi (The Solution)</span>
            </h3>
            <p className="text-sm sm:text-base text-zinc-300 leading-relaxed">
              {customer.solution}
            </p>
          </div>
        </div>
      </section>

      {/* Marka Yöneticisi Yorumu (Brand Manager Review/Quote) */}
      {customer.testimonial && (
        <section className="w-full max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-12">
          <div className="p-8 sm:p-12 rounded-3xl bg-slate-900/90 border border-brand-500/30 shadow-glow-orange relative overflow-hidden">
            <Quote className="w-16 h-16 text-brand-500/20 absolute -top-2 -left-2 pointer-events-none" />
            <div className="relative z-10 max-w-3xl mx-auto text-center space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-400 text-xs font-mono">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Marka Yöneticisi Yorumu</span>
              </div>
              <p className="text-lg sm:text-2xl font-medium text-white italic leading-relaxed">
                &ldquo;{customer.testimonial.quote}&rdquo;
              </p>
              <div className="pt-2">
                <p className="font-bold text-brand-400 text-base">
                  {customer.testimonial.author}
                </p>
                <p className="text-xs text-zinc-400 font-mono">
                  {customer.testimonial.role}
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Campaign Gallery - Dynamic Slow Continuous Marquee Carousel */}
      {customer.galleryImages && customer.galleryImages.length > 0 && (
        <section className="w-full max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-12">
          <CampaignGalleryMarquee
            images={customer.galleryImages}
            customerName={customer.name}
          />
        </section>
      )}

      {/* Bottom CTA for Similar Success */}
      <section className="w-full max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-12">
        <div className="p-8 sm:p-12 rounded-3xl bg-brand-500 text-slate-950 text-center space-y-6 shadow-glow-orange-lg">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950">
            Sizin Markanız İçin de Böyle Bir Başarı Hikayesi Yazalım
          </h2>
          <p className="text-sm sm:text-base text-slate-900 font-medium max-w-xl mx-auto">
            Sektörünüze özel reklam hunileri ve kreatif prodüksiyonlarla cironuzu ve bilinirliğinizi artıralım.
          </p>
          <div className="pt-2">
            <MagneticButton strength={20}>
              <Link
                href="/contact"
                className="bg-slate-950 hover:bg-black text-white font-bold px-8 py-3.5 rounded-xl shadow-2xl transition-all inline-flex items-center gap-2"
              >
                <span>Teklif İsteyin</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </MagneticButton>
          </div>
        </div>
      </section>
    </div>
  );
}
