"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Share2,
  Target,
  Code2,
  Video,
  Search,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  ArrowUpRight,
  Layers,
  Upload,
  FolderOpen,
} from "lucide-react";
import { useCMSStore } from "@/lib/store/cms-store";
import { MagneticButton } from "@/components/ui/MagneticButton";

const iconMap: { [key: string]: React.ElementType } = {
  Share2,
  Target,
  Code2,
  Video,
  Search,
  Sparkles,
};

export default function ServicesPage() {
  const { services } = useCMSStore();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const categories = [
    "all",
    ...Array.from(new Set(services.map((s) => s.category))),
  ];

  const filteredServices =
    selectedCategory === "all"
      ? services
      : services.filter((s) => s.category === selectedCategory);

  return (
    <div className="space-y-16 py-12 pb-24">
      {/* Page Header */}
      <section className="w-full max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-12">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-400 text-xs font-mono">
            <Layers className="w-3.5 h-3.5" />
            <span>Kapsamlı Dijital Çözümler</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
            Hizmetlerimiz & Dijital Yetkinliklerimiz
          </h1>

          <p className="text-base sm:text-lg text-zinc-300">
            Markanızın dijital dünyada büyümesini hızlandıran uçtan uca strateji, reklam ve teknoloji hizmetleri.
          </p>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-4">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs font-medium transition-all ${
                  selectedCategory === cat
                    ? "bg-brand-500 text-slate-950 font-bold shadow-glow-orange"
                    : "bg-slate-900 text-zinc-400 hover:text-white border border-white/10 hover:border-white/20"
                }`}
              >
                {cat === "all" ? "Tüm Hizmetler" : cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Services Grid with Modular Asset Container */}
      <section className="w-full max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredServices.map((srv) => {
            const Icon = iconMap[srv.iconName] || Sparkles;
            return (
              <div
                key={srv.id}
                className="group rounded-3xl bg-slate-900/70 border border-white/10 hover:border-brand-500/50 overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-glow-orange flex flex-col justify-between"
              >
                {/* Modular Asset Container & Visual Header */}
                <div className="relative h-48 w-full bg-zinc-900 overflow-hidden">
                  <Image
                    src={srv.heroImage}
                    alt={srv.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

                  {/* Icon and Category Tag */}
                  <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-slate-950/80 backdrop-blur-md border border-brand-500/40 flex items-center justify-center text-brand-400">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-mono bg-black/80 backdrop-blur-md px-3 py-1 rounded-full text-brand-400 border border-white/10">
                      {srv.category}
                    </span>
                  </div>
                </div>

                <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-3">
                    <h3 className="text-2xl font-bold text-white group-hover:text-brand-400 transition-colors">
                      {srv.title}
                    </h3>

                    <p className="text-sm text-zinc-400 leading-relaxed">
                      {srv.shortDesc}
                    </p>

                    <div className="space-y-2 pt-2 border-t border-white/5">
                      <p className="text-xs font-mono text-zinc-500 uppercase">Öne Çıkan Özellikler:</p>
                      {srv.features.slice(0, 3).map((feat, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs text-zinc-300">
                          <CheckCircle2 className="w-3.5 h-3.5 text-brand-500 flex-shrink-0" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-6 border-t border-white/10 mt-4">
                    <Link
                      href={`/services/${srv.slug}`}
                      className="w-full bg-white/5 hover:bg-brand-500 text-zinc-200 hover:text-slate-950 font-semibold text-xs py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all group/btn"
                    >
                      <span>Hizmet Detayı</span>
                      <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover/btn:translate-x-1" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
