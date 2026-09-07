"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  HelpCircle,
  ChevronDown,
  Search,
  Sparkles,
  MessageCircle,
  ArrowRight,
  Zap,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCMSStore } from "@/lib/store/cms-store";
import { MagneticButton } from "@/components/ui/MagneticButton";

export default function FAQPage() {
  const { faqs, narrative } = useCMSStore();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [openFaqId, setOpenFaqId] = useState<string | null>(faqs[0]?.id || null);

  const publishedFaqs = faqs.filter((f) => f.status !== "draft");

  const categories = [
    "all",
    ...Array.from(new Set(publishedFaqs.map((f) => f.category))),
  ];

  const filteredFaqs = publishedFaqs.filter((item) => {
    const matchesCat =
      selectedCategory === "all" || item.category === selectedCategory;
    const matchesSearch =
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const toggleFaq = (id: string) => {
    setOpenFaqId(openFaqId === id ? null : id);
  };

  const rawPhone = (narrative.whatsappNumber || "+905492115561").replace(/[^0-9]/g, "");

  return (
    <div className="space-y-16 py-12 pb-24">
      {/* Page Header */}
      <section className="w-full max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-12">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-400 text-xs font-mono">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Merak Edilenler</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
            Sıkça Sorulan Sorular (SSS)
          </h1>

          <p className="text-base sm:text-lg text-zinc-300">
            Digivideas dijital reklam ajansı ile çalışma süreçleri, reklam yönetimi, web tasarım ve kreatif çözümler hakkında aklınıza takılan tüm sorular.
          </p>

          {/* Search Bar */}
          <div className="pt-4 max-w-xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Soru veya anahtar kelime arayın..."
                className="w-full bg-slate-900/90 border border-white/15 focus:border-brand-500 rounded-2xl pl-11 pr-4 py-3.5 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30 transition-all font-mono"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-zinc-400 hover:text-white"
                >
                  Temizle
                </button>
              )}
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
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
                {cat === "all" ? "Tüm Sorular" : cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs List Section */}
      <section className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
        {filteredFaqs.length === 0 ? (
          <div className="p-12 rounded-3xl bg-slate-900/50 border border-white/10 text-center space-y-3">
            <HelpCircle className="w-8 h-8 text-zinc-500 mx-auto" />
            <p className="text-zinc-300 font-medium">Aramanıza uygun soru bulunamadı.</p>
            <p className="text-xs text-zinc-500">
              Farklı bir arama yapabilir veya doğrudan WhatsApp üzerinden bize sorabilirsiniz.
            </p>
          </div>
        ) : (
          filteredFaqs.map((faq) => {
            const isOpen = openFaqId === faq.id;

            return (
              <div
                key={faq.id}
                className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                  isOpen
                    ? "bg-slate-900/90 border-brand-500/40 shadow-glow-orange"
                    : "bg-slate-900/40 border-white/10 hover:border-white/20"
                }`}
              >
                <button
                  onClick={() => toggleFaq(faq.id)}
                  className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 transition-colors"
                >
                  <div className="space-y-1 pr-2">
                    <span className="text-[10px] font-mono font-bold text-brand-400 uppercase tracking-wider">
                      {faq.category}
                    </span>
                    <h3 className="text-base sm:text-lg font-bold text-white leading-snug">
                      {faq.question}
                    </h3>
                  </div>

                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-transform duration-300 ${
                      isOpen
                        ? "bg-brand-500 text-slate-950 rotate-180"
                        : "bg-white/5 text-zinc-400"
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: "easeInOut" }}
                    >
                      <div className="px-5 sm:px-6 pb-6 pt-2 text-sm text-zinc-300 leading-relaxed border-t border-white/5">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })
        )}
      </section>

      {/* Still Have Questions CTA */}
      <section className="w-full max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-12">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-tr from-slate-950 via-slate-900 to-slate-950 border border-brand-500/30 text-center space-y-6 shadow-glow-orange">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-400 text-xs font-mono">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Farklı Bir Sorunuz Mu Var?</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
            Ekibimizle Doğrudan İletişime Geçin
          </h2>

          <p className="text-sm sm:text-base text-zinc-300 max-w-xl mx-auto">
            Projenize özel gereksinimleri konuşmak ve detaylı bilgi almak için WhatsApp hattımızdan veya iletişim formumuzdan hemen bize ulaşabilirsiniz.
          </p>

          <div className="pt-2 flex flex-wrap justify-center gap-4">
            <MagneticButton strength={20}>
              <Link
                href="/contact"
                className="bg-brand-500 hover:bg-brand-600 text-slate-950 font-bold px-8 py-3.5 rounded-xl shadow-glow-orange transition-all inline-flex items-center gap-2 text-sm"
              >
                <span>İletişim Formunu Doldurun</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </MagneticButton>

            <MagneticButton strength={15}>
              <a
                href={`https://wa.me/${rawPhone}?text=Merhaba,%20hizmetlerinizle%20ilgili%20bir%20sorum%20var.`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white/10 hover:bg-white/20 text-white font-semibold px-6 py-3.5 rounded-xl border border-white/10 transition-all inline-flex items-center gap-2 text-sm"
              >
                <MessageCircle className="w-4 h-4 text-brand-400" />
                <span>WhatsApp: +90 549 211 55 61</span>
              </a>
            </MagneticButton>
          </div>
        </div>
      </section>
    </div>
  );
}
