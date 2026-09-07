"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Sparkles,
  Compass,
  Target,
  Eye,
  CheckCircle2,
  HeartHandshake,
  ShieldCheck,
  Zap,
  ArrowRight,
  MessageCircle,
} from "lucide-react";
import { useCMSStore } from "@/lib/store/cms-store";
import { MagneticButton } from "@/components/ui/MagneticButton";

export default function AboutPage() {
  const { narrative } = useCMSStore();

  const values = [
    {
      title: "Mühendislik Titizliği",
      desc: "Her reklam bütçesini ve kampanyayı veri modelleri ve analitik algoritmalarla yönetiyoruz.",
      icon: Zap,
    },
    {
      title: "Kalıcı İz Bırakma (ivi)",
      desc: "Geçici trendler yerine markanızın zihinlerde kalıcı bir yer edinmesini hedefliyoruz.",
      icon: Target,
    },
    {
      title: "Şeffaf Raporlama",
      desc: "Her kuruşun nereye gittiğini ve getirisini gösteren canlı performans panelleri sunuyoruz.",
      icon: ShieldCheck,
    },
    {
      title: "Müşteri Odaklı Ortaklık",
      desc: "Sadece bir ajans değil, markanızın iç pazarlama departmanı gibi stratejik yol arkadaşlığı yapıyoruz.",
      icon: HeartHandshake,
    },
  ];

  return (
    <div className="space-y-24 py-12 pb-24">
      {/* 1. HERO HEADER */}
      <section className="w-full max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-12">
        <div className="text-center max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-400 text-xs font-mono">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Hakkımızda & İzmir, Türkiye</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-tight">
            Teknoloji ve Yaratıcılığın{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-amber-300">
              İzmir&apos;deki Buluşması
            </span>
          </h1>

          <p className="text-base sm:text-lg text-zinc-300 leading-relaxed">
            {narrative.slogan}
          </p>
        </div>
      </section>

      {/* 2. BİZ KİMİZ & ETYMOLOGY */}
      <section className="w-full max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-6 space-y-6">
            <div className="space-y-3">
              <span className="text-xs font-mono font-bold text-brand-400 uppercase tracking-wider">
                Biz Kimiz?
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                Dijital Dünyada Güçlü Bir Varlık İnşa Ediyoruz
              </h2>
            </div>

            <p className="text-base text-zinc-300 leading-relaxed">
              {narrative.bizKimiz}
            </p>

            <div className="p-5 rounded-2xl bg-slate-900/90 border border-brand-500/30 shadow-glow-orange space-y-3">
              <span className="text-xs font-mono font-bold text-brand-400 uppercase">
                Adımızın Anlamı: &ldquo;digivideas&rdquo;
              </span>
              <p className="text-sm text-zinc-300 leading-relaxed font-mono">
                <strong className="text-white">digi</strong> (dijital) +{" "}
                <strong className="text-brand-400">ivi</strong> (Lazca: &ldquo;iz bırakmak, izi kalmak&rdquo;) +{" "}
                <strong className="text-white">ideas</strong> (fikirler).
              </p>
              <p className="text-xs text-zinc-400 italic">
                Amacımız her projede dijital dünyada silinmeyecek kalıcı başarı izleri bırakmaktır.
              </p>
            </div>
          </div>

          <div className="lg:col-span-6 relative h-[420px] rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-slate-950">
            <Image
              src="/assets/services/service-web-tasarim.webp"
              alt="Digivideas Ekibi & Stüdyo"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6">
              <div className="bg-black/80 backdrop-blur-md border border-white/10 p-4 rounded-2xl">
                <p className="text-sm font-bold text-white">İzmir Merkezli Kreatif Ekip</p>
                <p className="text-xs text-zinc-400 mt-0.5">İzmir & Global Markalar</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. NASIL BAŞLADI? */}
      <section className="w-full max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-12">
        <div className="p-8 sm:p-14 rounded-3xl bg-slate-900/80 border border-white/10 relative overflow-hidden">
          <div className="space-y-6 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-400 text-xs font-mono">
              <Compass className="w-3.5 h-3.5" />
              <span>Yolculuğumuz</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Nasıl Başladı?
            </h2>

            <p className="text-base sm:text-lg text-zinc-300 leading-relaxed">
              {narrative.nasilBasladi}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-white/10">
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-white">Mühendislik Vizyonu</h4>
                <p className="text-xs text-zinc-400">
                  Veri bilimi ve analitik optimizasyon modellerine dayalı modern pazarlama.
                </p>
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-white">Tutku & İnovasyon</h4>
                <p className="text-xs text-zinc-400">
                  Yapay zeka araçlarını ve yaratıcı prodüksiyonu harmanlayan öncü altyapı.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. MİSYONUMUZ & VİZYONUMUZ */}
      <section className="w-full max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Misyonumuz */}
          <div className="p-8 sm:p-10 rounded-3xl bg-slate-900/60 border border-white/10 hover:border-brand-500/40 transition-all space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-brand-500/20 text-brand-400 flex items-center justify-center">
              <Target className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold text-white">Misyonumuz</h3>
            <p className="text-zinc-300 text-sm sm:text-base leading-relaxed">
              {narrative.misyonumuz}
            </p>
          </div>

          {/* Vizyonumuz */}
          <div className="p-8 sm:p-10 rounded-3xl bg-slate-900/60 border border-white/10 hover:border-brand-500/40 transition-all space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-brand-500/20 text-brand-400 flex items-center justify-center">
              <Eye className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold text-white">Vizyonumuz</h3>
            <p className="text-zinc-300 text-sm sm:text-base leading-relaxed">
              {narrative.vizyonumuz}
            </p>
          </div>
        </div>
      </section>

      {/* 5. DEĞERLERİMİZ */}
      <section className="w-full max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-12 space-y-8">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <span className="text-xs font-mono font-bold text-brand-400 uppercase tracking-wider">
            Prensiplerimiz
          </span>
          <h2 className="text-3xl font-extrabold text-white">
            Bizi Farklı Kılan Temel Değerler
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((v, i) => {
            const Icon = v.icon;
            return (
              <div
                key={i}
                className="p-6 rounded-2xl bg-slate-900/70 border border-white/10 space-y-3"
              >
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-brand-400">
                  <Icon className="w-5 h-5" />
                </div>
                <h4 className="text-base font-bold text-white">{v.title}</h4>
                <p className="text-xs text-zinc-400 leading-relaxed">{v.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 6. CTA */}
      <section className="w-full max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-12">
        <div className="p-8 sm:p-12 rounded-3xl bg-slate-900 border border-brand-500/30 text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            Markanızın Dijital Geleceğini Birlikte Şekillendirelim
          </h2>
          <p className="text-sm text-zinc-400 max-w-xl mx-auto">
            İzmir ofisimizde bir kahve eşliğinde ya da online toplantıyla hedeflerinizi konuşalım.
          </p>
          <div className="pt-2 flex flex-wrap justify-center gap-4">
            <MagneticButton strength={20}>
              <Link
                href="/contact"
                className="bg-brand-500 hover:bg-brand-600 text-slate-950 font-bold px-8 py-3.5 rounded-xl shadow-glow-orange transition-all inline-flex items-center gap-2"
              >
                <span>İletişime Geçin</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </MagneticButton>

            <MagneticButton strength={15}>
              <a
                href="https://wa.me/905492115561"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-brand-500/15 hover:bg-brand-500 text-brand-400 hover:text-slate-950 font-semibold px-6 py-3.5 rounded-xl border border-brand-500/30 transition-all inline-flex items-center gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp: +90 549 211 55 61</span>
              </a>
            </MagneticButton>
          </div>
        </div>
      </section>
    </div>
  );
}
