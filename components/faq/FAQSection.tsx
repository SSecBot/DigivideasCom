"use client";

import React, { useState } from "react";
import { ChevronDown, HelpCircle, MessageCircle, Sparkles } from "lucide-react";
import { FAQItem } from "@/lib/types/cms";
import { MagneticButton } from "@/components/ui/MagneticButton";

interface FAQSectionProps {
  faqs: FAQItem[];
}

export function FAQSection({ faqs }: FAQSectionProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [openId, setOpenId] = useState<string | null>(faqs[0]?.id || null);

  const categories = [
    "all",
    ...Array.from(new Set(faqs.map((f) => f.category))),
  ];

  const publishedFaqs = faqs.filter((f) => f.status === "published");

  const filteredFaqs =
    selectedCategory === "all"
      ? publishedFaqs
      : publishedFaqs.filter((f) => f.category === selectedCategory);

  const toggleAccordion = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-400 text-xs font-mono">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Sıkça Sorulan Sorular (SSS)</span>
        </div>

        <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Aklınıza Takılan Tüm Sorular
        </h2>

        <p className="text-sm sm:text-base text-zinc-300">
          Dijital reklam süreçlerimiz, bütçe yönetimimiz ve çalışma modelimiz hakkında merak edilenler.
        </p>

        {/* Category Filters */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                selectedCategory === cat
                  ? "bg-brand-500 text-slate-950 font-bold shadow-glow-orange"
                  : "bg-slate-900 text-zinc-400 hover:text-white border border-white/10"
              }`}
            >
              {cat === "all" ? "Tüm Sorular" : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Accordion List */}
      <div className="space-y-3">
        {filteredFaqs.map((faq) => {
          const isOpen = openId === faq.id;

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
                onClick={() => toggleAccordion(faq.id)}
                className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 transition-colors"
                aria-expanded={isOpen}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-brand-400 bg-white/5 border border-white/10 px-2.5 py-0.5 rounded-full hidden sm:inline-block">
                    {faq.category}
                  </span>
                  <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                    {faq.question}
                  </h3>
                </div>

                <div
                  className={`w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 flex-shrink-0 transition-transform duration-300 ${
                    isOpen ? "rotate-180 text-brand-400 bg-brand-500/10 border-brand-500/30" : ""
                  }`}
                >
                  <ChevronDown className="w-4 h-4" />
                </div>
              </button>

              {isOpen && (
                <div className="px-5 sm:px-6 pb-6 pt-1 border-t border-white/5 text-sm sm:text-base text-zinc-300 leading-relaxed animate-fadeIn">
                  <p>{faq.answer}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Direct WhatsApp Prompt */}
      <div className="p-6 rounded-3xl bg-slate-900/60 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <div className="space-y-1">
          <h4 className="text-base font-bold text-white">Başka bir sorunuz mu var?</h4>
          <p className="text-xs text-zinc-400">
            Ekibimize WhatsApp hattımız üzerinden anında danışabilirsiniz.
          </p>
        </div>

        <MagneticButton strength={15}>
          <a
            href="https://wa.me/905492115561?text=Merhaba,%20hizmetlerinizle%20ilgili%20bir%20sorum%20var."
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-slate-950 font-bold px-5 py-2.5 rounded-xl text-xs transition-all shadow-glow-orange"
          >
            <MessageCircle className="w-4 h-4" />
            <span>WhatsApp ile Sorun</span>
          </a>
        </MagneticButton>
      </div>
    </section>
  );
}
