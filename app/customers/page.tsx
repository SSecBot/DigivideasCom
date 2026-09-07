"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Star, ArrowRight, ArrowUpRight, TrendingUp, Sparkles, Trophy } from "lucide-react";
import { useCMSStore } from "@/lib/store/cms-store";
import { MagneticButton } from "@/components/ui/MagneticButton";

export default function CustomersPage() {
  const { customers } = useCMSStore();
  const [selectedSector, setSelectedSector] = useState<string>("all");

  const sectors = [
    "all",
    ...Array.from(new Set(customers.map((c) => c.sector))),
  ];

  const filteredCustomers =
    selectedSector === "all"
      ? customers
      : customers.filter((c) => c.sector === selectedSector);

  return (
    <div className="space-y-16 py-12 pb-24">
      {/* Page Header */}
      <section className="w-full max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-12">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-400 text-xs font-mono">
            <Trophy className="w-3.5 h-3.5" />
            <span>Müşteri Başarı Hikayeleri & Portföy</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
            Müşterilerimiz & Vaka Analizleri
          </h1>

          <p className="text-base sm:text-lg text-zinc-300">
            Farklı sektörlerdeki markalarla birlikte yürüttüğümüz dijital reklam, büyüme ve performans yolculukları.
          </p>

          {/* Sector Filters */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-4">
            {sectors.map((sec) => (
              <button
                key={sec}
                onClick={() => setSelectedSector(sec)}
                className={`px-4 py-2 rounded-full text-xs font-medium transition-all ${
                  selectedSector === sec
                    ? "bg-brand-500 text-slate-950 font-bold shadow-glow-orange"
                    : "bg-slate-900 text-zinc-400 hover:text-white border border-white/10 hover:border-white/20"
                }`}
              >
                {sec === "all" ? "Tüm Markalar" : sec}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Customers Portfolio Grid */}
      <section className="w-full max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {filteredCustomers.map((cust) => (
            <Link
              key={cust.id}
              href={`/customers/${cust.slug}`}
              className="group rounded-3xl bg-slate-900/70 border border-white/10 hover:border-brand-500/50 overflow-hidden transition-all duration-300 hover:shadow-glow-orange hover:-translate-y-1 flex flex-col justify-between"
            >
              <div>
                <div className="relative h-72 w-full bg-zinc-900 overflow-hidden">
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
                      <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                        {cust.name}
                      </h3>
                      <p className="text-xs font-mono text-zinc-300 mt-0.5">
                        Rota: /customers/{cust.slug}
                      </p>
                    </div>

                    <div className="w-10 h-10 rounded-full bg-brand-500 text-slate-950 flex items-center justify-center shadow-lg transition-transform group-hover:scale-110">
                      <ArrowUpRight className="w-5 h-5" />
                    </div>
                  </div>
                </div>

                <div className="p-6 sm:p-8 space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-brand-400 uppercase tracking-wider">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Müşteri Hikayesi & Strateji</span>
                    </div>
                    <p className="text-sm text-zinc-300 leading-relaxed line-clamp-3">
                      {cust.story || cust.summary}
                    </p>
                  </div>
                </div>
              </div>

              {cust.testimonial && (
                <div className="px-6 sm:px-8 pb-6 pt-2">
                  <div className="p-4 rounded-2xl bg-brand-500/5 border border-brand-500/20 text-xs italic text-zinc-300">
                    &ldquo;{cust.testimonial.quote}&rdquo;
                    <p className="not-italic font-bold text-brand-400 mt-2 font-mono">
                      — {cust.testimonial.author}, {cust.testimonial.role}
                    </p>
                  </div>
                </div>
              )}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
