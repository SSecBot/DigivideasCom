"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Sparkles,
  Share2,
  Target,
  Code2,
  Video,
  Search,
  CheckCircle2,
  TrendingUp,
  Award,
  ArrowUpRight,
  Shield,
  Zap,
} from "lucide-react";
import { useCMSStore } from "@/lib/store/cms-store";
import { HeroSection } from "@/components/hero/HeroSection";
import { FAQSection } from "@/components/faq/FAQSection";
import { MagneticButton } from "@/components/ui/MagneticButton";

const iconMap: { [key: string]: React.ElementType } = {
  Share2,
  Target,
  Code2,
  Video,
  Search,
  Sparkles,
};

export default function HomePage() {
  const { services, customers, blogPosts, narrative, faqs } = useCMSStore();

  return (
    <div className="space-y-24 pb-20">
      {/* 1. HERO SECTION (Interactive macOS Showcase + Unblur Text + Light Engine) */}
      <HeroSection narrative={narrative} services={services} />

      {/* 2. BRAND STORY & ETYMOLOGY HIGHLIGHT */}
      <section className="w-full max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-12">
        <div className="p-8 sm:p-12 rounded-3xl bg-slate-900/60 border border-white/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/10 blur-[120px] rounded-full pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-400 text-xs font-mono">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Hikayemiz & İzmir, Türkiye</span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                İzmir&apos;den Doğan Mühendislik Vizyonu ve Yaratıcı Tutku
              </h2>

              <p className="text-zinc-300 text-base sm:text-lg leading-relaxed">
                {narrative.nasilBasladi}
              </p>

              <div className="pt-2">
                <Link
                  href="/about"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-brand-400 hover:text-brand-300 transition-colors group"
                >
                  <span>Hakkımızda ve Misyonumuzun Devamını Oku</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>

            {/* Etymology Card */}
            <div className="lg:col-span-5 p-6 rounded-2xl bg-slate-950/80 border border-brand-500/30 shadow-glow-orange space-y-4">
              <span className="text-xs font-mono font-bold text-brand-400 uppercase tracking-wider">
                Marka İsmi Etimolojisi
              </span>

              <div className="space-y-3 font-mono text-sm text-zinc-300">
                <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white/5 border border-white/5">
                  <span className="font-bold text-white text-base">digi</span>
                  <span className="text-xs text-zinc-400">→ Dijital Ekosistem & Teknoloji</span>
                </div>
                <div className="flex items-center gap-3 p-2.5 rounded-xl bg-brand-500/15 border border-brand-500/40 text-brand-400">
                  <span className="font-bold text-white text-base">ivi</span>
                  <span className="text-xs">→ Lazca: &ldquo;İz bırakmak, izi kalmak&rdquo;</span>
                </div>
                <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white/5 border border-white/5">
                  <span className="font-bold text-white text-base">ideas</span>
                  <span className="text-xs text-zinc-400">→ Yaratıcı Fikirler & Strateji</span>
                </div>
              </div>

              <p className="text-xs text-zinc-400 italic pt-1">
                &ldquo;Markanızın dijital dünyada kalıcı bir iz bırakmasını sağlayan inovatif fikirler.&rdquo;
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. SERVICES MATRIX (Hizmetlerimiz) */}
      <section className="w-full max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-12 space-y-12">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-2">
            <span className="text-xs font-mono font-bold text-brand-400 uppercase tracking-wider">
              Uzmanlık Alanlarımız
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Büyümenizi Hızlandıran Dijital Hizmetler
            </h2>
          </div>

          <Link
            href="/services"
            className="inline-flex items-center gap-2 text-sm font-semibold text-brand-400 hover:text-brand-300 group"
          >
            <span>Tüm Hizmetleri İncele</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((srv) => {
            const Icon = iconMap[srv.iconName] || Sparkles;
            return (
              <div
                key={srv.id}
                className="p-7 rounded-3xl bg-slate-900/70 hover:bg-slate-900 border border-white/10 hover:border-brand-500/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-glow-orange flex flex-col justify-between group"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-brand-500/10 border border-brand-500/30 flex items-center justify-center text-brand-400 group-hover:bg-brand-500 group-hover:text-slate-950 transition-all">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-mono text-zinc-500 bg-white/5 px-2.5 py-1 rounded-full border border-white/5">
                      {srv.category}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-white group-hover:text-brand-400 transition-colors">
                    {srv.title}
                  </h3>

                  <p className="text-sm text-zinc-400 leading-relaxed">
                    {srv.shortDesc}
                  </p>

                  {/* Features list */}
                  <ul className="space-y-2 pt-2 border-t border-white/5 text-xs text-zinc-300">
                    {srv.features.slice(0, 3).map((feat, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-brand-500 flex-shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-6">
                  <Link
                    href={`/services/${srv.slug}`}
                    className="w-full inline-flex items-center justify-between text-xs font-bold text-brand-400 group-hover:text-white pt-3 border-t border-white/10"
                  >
                    <span>Detaylı Bilgi & Rotalar</span>
                    <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. FEATURED CLIENT CASE STUDIES (Müşterilerimiz) */}
      <section className="w-full max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-12 space-y-12">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-2">
            <span className="text-xs font-mono font-bold text-brand-400 uppercase tracking-wider">
              Başarı Hikayeleri
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Birlikte Kalıcı İzler Bıraktığımız Markalar
            </h2>
          </div>

          <Link
            href="/customers"
            className="inline-flex items-center gap-2 text-sm font-semibold text-brand-400 hover:text-brand-300 group"
          >
            <span>Tüm Müşteri Vaka Analizleri</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {customers.slice(0, 4).map((cust) => (
            <Link
              key={cust.id}
              href={`/customers/${cust.slug}`}
              className="group block rounded-3xl bg-slate-900/60 border border-white/10 hover:border-brand-500/50 overflow-hidden transition-all duration-300 hover:shadow-glow-orange hover:-translate-y-1"
            >
              <div className="relative h-64 w-full bg-zinc-900 overflow-hidden">
                <Image
                  src={cust.heroImage}
                  alt={cust.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-md px-3 py-1 rounded-full text-xs font-mono text-brand-400 border border-brand-500/30">
                  {cust.sector}
                </div>
                <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                  <div>
                    <h3 className="text-2xl font-bold text-white tracking-tight">
                      {cust.name}
                    </h3>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-brand-500 text-slate-950 flex items-center justify-center shadow-lg transition-transform group-hover:scale-110">
                    <ArrowUpRight className="w-5 h-5" />
                  </div>
                </div>
              </div>

              {/* Unified Client Growth Story & Digital Marketing Strategy Summary Block */}
              <div className="p-6 space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs font-mono text-brand-400 uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Büyüme Hikayesi & Strateji Özeti</span>
                  </div>
                  <p className="text-sm text-zinc-300 leading-relaxed line-clamp-3">
                    {cust.story || cust.summary}
                  </p>
                </div>

                {cust.testimonial && (
                  <div className="pt-3 border-t border-white/10">
                    <p className="text-xs text-zinc-400 italic line-clamp-2">
                      &ldquo;{cust.testimonial.quote}&rdquo;
                    </p>
                    <p className="text-[11px] font-mono text-brand-400 mt-1">
                      — {cust.testimonial.author}, {cust.testimonial.role}
                    </p>
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 5. SIKÇA SORULAN SORULAR (SSS) */}
      <FAQSection faqs={faqs} />

      {/* 6. LATEST BLOG INSIGHTS */}
      <section className="w-full max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-12 space-y-12">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-2">
            <span className="text-xs font-mono font-bold text-brand-400 uppercase tracking-wider">
              Blog & İpuçları
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Dijital Pazarlama & 2026 Trendleri
            </h2>
          </div>

          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm font-semibold text-brand-400 hover:text-brand-300 group"
          >
            <span>Tüm Makaleleri Oku</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {blogPosts.slice(0, 3).map((post) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="group rounded-3xl bg-slate-900/60 border border-white/10 hover:border-brand-500/40 p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-glow-orange flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="relative h-48 w-full rounded-2xl overflow-hidden bg-zinc-900">
                  <Image
                    src={post.coverImage}
                    alt={post.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute top-3 left-3 bg-black/80 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-mono text-brand-400 border border-white/10">
                    {post.category}
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs text-zinc-400 font-mono">
                  <span>{post.publishedAt}</span>
                  <span>•</span>
                  <span>{post.readTimeMinutes} dk okuma</span>
                </div>

                <h3 className="text-lg font-bold text-white group-hover:text-brand-400 transition-colors line-clamp-2">
                  {post.title}
                </h3>

                <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                  {post.excerpt}
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-white/10 flex items-center justify-between text-xs font-semibold text-brand-400">
                <span>Makaleyi Oku</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 7. CALL TO ACTION BANNER */}
      <section className="w-full max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-12">
        <div className="p-8 sm:p-16 rounded-3xl bg-gradient-to-tr from-brand-600 via-orange-600 to-amber-500 text-slate-950 relative overflow-hidden shadow-glow-orange-lg">
          <div className="relative z-10 max-w-2xl space-y-6">
            <div className="inline-flex items-center gap-2 bg-black/20 text-white border border-white/20 px-3.5 py-1.5 rounded-full text-xs font-mono font-medium">
              <Zap className="w-3.5 h-3.5 text-amber-300" />
              <span>Markanızı Zirveye Taşıyalım</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
              Dijital Yolculuğunuzda Birlikte Kalıcı Bir İz Bırakalım.
            </h2>

            <p className="text-base sm:text-lg text-slate-950 font-medium leading-relaxed">
              İhtiyaçlarınıza özel stratejiler ve mühendislik yaklaşımıyla hazırlanmış veri odaklı kampanyalarla tanışın.
            </p>

            <div className="pt-2 flex flex-wrap gap-4">
              <MagneticButton strength={25}>
                <Link
                  href="/contact"
                  className="bg-slate-950 hover:bg-black text-white font-bold text-sm sm:text-base px-8 py-4 rounded-2xl shadow-2xl transition-all inline-flex items-center gap-2"
                >
                  <span>Hemen İletişime Geçin</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </MagneticButton>

              <MagneticButton strength={15}>
                <a
                  href="https://wa.me/905492115561"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white/20 hover:bg-white/30 text-white font-semibold text-sm sm:text-base px-6 py-4 rounded-2xl backdrop-blur-md transition-all inline-flex items-center gap-2"
                >
                  <span>WhatsApp: +90 549 211 55 61</span>
                </a>
              </MagneticButton>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
