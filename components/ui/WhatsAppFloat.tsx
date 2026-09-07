"use client";

import React from "react";
import { MessageCircle } from "lucide-react";
import { MagneticButton } from "./MagneticButton";

export function WhatsAppFloat() {
  const whatsappUrl =
    "https://wa.me/905492115561?text=Merhaba,%20Digivideas%20dijital%20reklam%20ve%20b%C3%BCy%C3%BCme%20hizmetleriniz%20hakk%C4%B1nda%20bilgi%20almak%20istiyorum.";

  return (
    <div className="fixed bottom-6 right-6 z-40">
      <MagneticButton strength={20}>
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="WhatsApp üzerinden hızlı mesaj gönderin"
          className="group flex items-center gap-2.5 bg-brand-500 hover:bg-brand-400 text-slate-950 px-4 py-3 rounded-full shadow-2xl hover:shadow-glow-orange transition-all duration-300 active:scale-95 border border-brand-300/40"
        >
          <MessageCircle className="w-5 h-5 fill-slate-950 text-slate-950 transition-transform group-hover:scale-110" />
          <span className="text-xs font-bold font-sans tracking-tight hidden sm:inline-block">
            WhatsApp ile Yazın
          </span>
          <span className="w-2 h-2 rounded-full bg-slate-950 animate-ping hidden sm:inline-block" />
        </a>
      </MagneticButton>
    </div>
  );
}
