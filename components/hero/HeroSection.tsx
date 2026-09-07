"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Zap, Compass } from "lucide-react";
import { UnblurText } from "./UnblurText";
import { MacOSServiceShowcase } from "./MacOSServiceShowcase";
import { CursorSpotlight } from "@/components/ui/CursorSpotlight";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { ServiceItem, SiteNarrative } from "@/lib/types/cms";

interface HeroSectionProps {
  narrative: SiteNarrative;
  services?: ServiceItem[];
}

export function HeroSection({ narrative, services }: HeroSectionProps) {
  const narrativeLines = [
    {
      badge: "Biz Kimiz?",
      text: "Dijital reklam ajansı olarak yenilikçi, ölçümlenebilir ve etkili stratejiler sunuyoruz. Amacımız, markaların dijital dünyada güçlü ve sürdürülebilir bir varlık oluşturmasını sağlamaktır.",
      highlight: "Uzman ekibimizle birlikte, kreatif stratejiler geliştirerek hedef kitlenize en doğru mesajları ulaştırıyoruz.",
    },
    {
      badge: "Nasıl Başladı?",
      text: "Digivideas, İzmir merkezli olarak kurulan ve başlangıçta freelance projelerle yola çıkan bir dijital reklam ajansıdır. Mühendis olan kurucumuzun analitik vizyonu sayesinde,",
      emphasis: "kısa sürede sistematik ve organize bir ajans yapısına kavuştu.",
    },
    {
      badge: "Misyonumuz",
      text: "Teknoloji ve yaratıcılığı bir araya getirerek, müşterilerimize özgün ve stratejik çözümler sunuyoruz. Amacımız, dijital platformlarda güçlü ve kalıcı bir etkileşim kurmaktır.",
    },
  ];

  return (
    <section className="relative min-h-[calc(100vh-80px)] flex items-center justify-center pt-8 pb-16 overflow-hidden">
      {/* Dynamic Cursor Light Spotlight Engine (Centered strictly under cursor) */}
      <CursorSpotlight size={550} color="rgba(249, 115, 22, 0.14)" />

      {/* Ambient Radial Mesh Gradients (Anthracite & Warm Orange Only) */}
      <div className="absolute top-10 left-1/4 w-96 h-96 bg-brand-500/10 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-[450px] h-[450px] bg-amber-500/10 blur-[150px] rounded-full pointer-events-none" />

      {/* Subtle Grid Background */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)`,
          backgroundSize: "48px 48px",
        }}
      />

      <div className="w-full max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-center">
          {/* Left Column: Headline, Interactive Unblur Narrative & CTAs */}
          <div className="lg:col-span-5 xl:col-span-5 space-y-6 text-left">
            {/* Top Badge & Location */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-brand-500/20 to-amber-500/10 border border-brand-500/40 text-brand-400 px-3.5 py-1.5 rounded-full text-xs font-mono font-medium shadow-glow-orange">
                <Zap className="w-3.5 h-3.5 text-brand-400" />
                <span>Teknoloji & Yaratıcılık Hibriti</span>
              </div>

              <div className="inline-flex items-center gap-1.5 text-xs font-mono text-zinc-300 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full">
                <Compass className="w-3.5 h-3.5 text-brand-400" />
                <span>İzmir, Türkiye</span>
              </div>
            </div>

            {/* Main Headline with natural line break on orange text */}
            <div className="space-y-3">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.15]">
                Dijital Dünyada <br />
                <span className="relative text-transparent bg-clip-text bg-gradient-to-r from-brand-400 via-orange-500 to-amber-300">
                  Kalıcı Bir İz
                </span>{" "}
                Bırakın.
              </h1>
              <p className="text-base sm:text-lg text-zinc-300 font-medium leading-relaxed max-w-2xl">
                {narrative.slogan}
              </p>
            </div>

            {/* Interactive Unblur Narrative Box */}
            <div className="pt-2 pb-1">
              <UnblurText lines={narrativeLines} />
            </div>

            {/* Call to Actions & Magnetic Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <MagneticButton strength={20}>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-slate-950 font-bold text-sm sm:text-base px-7 py-3.5 rounded-2xl shadow-glow-orange hover:shadow-glow-orange-lg transition-all active:scale-95"
                >
                  <span>Detaylı Bilgi İçin</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </MagneticButton>

              <MagneticButton strength={15}>
                <Link
                  href="/customers"
                  className="inline-flex items-center gap-2 bg-slate-900/90 hover:bg-slate-800 text-white font-medium text-sm sm:text-base px-6 py-3.5 rounded-2xl border border-white/10 hover:border-brand-500/40 transition-all"
                >
                  <span>Portföyümüzü İnceleyin</span>
                </Link>
              </MagneticButton>
            </div>
          </div>

          {/* Right Column: Interactive macOS-Style Service Showcase Component */}
          <div className="lg:col-span-7 xl:col-span-7 flex items-center justify-center w-full">
            <MacOSServiceShowcase services={services} />
          </div>
        </div>
      </div>
    </section>
  );
}
