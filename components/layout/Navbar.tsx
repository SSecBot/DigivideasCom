"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Instagram, Facebook, ArrowUpRight } from "lucide-react";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { useCMSStore } from "@/lib/store/cms-store";

export function Navbar() {
  const { narrative } = useCMSStore();

  const logoSrc = narrative.logoUrl || "/assets/logo.png";
  const facebookLink = narrative.facebookUrl || "https://facebook.com/digivideas";
  const instagramLink = narrative.instagramUrl || "https://instagram.com/digivideas";

  return (
    <header className="sticky top-0 z-40 w-full glass-nav backdrop-blur-2xl">
      <div className="w-full max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Left: Location & Status Badge */}
        <div className="flex items-center gap-3 pl-12 lg:pl-16">
          <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-zinc-300 bg-white/5 border border-white/10 px-3.5 py-1.5 rounded-full">
            <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
            <span>{narrative.location || "İzmir, Türkiye"}</span>
          </div>
        </div>

        {/* Center: Dedicated Brand Logo Asset Slot */}
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center">
          <Link
            href="/"
            className="group flex items-center justify-center transition-transform hover:scale-105 active:scale-95"
            aria-label="digivideas ana sayfa"
          >
            {logoSrc.endsWith(".svg") || logoSrc.startsWith("data:") ? (
              <img
                src={logoSrc}
                alt="digivideas dijital reklam ajansı"
                className="h-8 sm:h-10 w-auto object-contain transition-all"
              />
            ) : (
              <Image
                src={logoSrc}
                alt="digivideas dijital reklam ajansı"
                width={200}
                height={45}
                priority
                className="h-8 sm:h-10 w-auto object-contain transition-all"
              />
            )}
          </Link>
        </div>

        {/* Top Right: Magnetic Social Media Links & Quick Connect Button */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Facebook Magnetic Icon Link */}
          <MagneticButton
            href={facebookLink}
            target="_blank"
            rel="noopener noreferrer"
            ariaLabel="digivideas Facebook sayfası"
            strength={25}
          >
            <div className="w-10 h-10 rounded-full bg-white/5 hover:bg-brand-500/20 border border-white/10 hover:border-brand-500/50 flex items-center justify-center text-zinc-300 hover:text-brand-400 transition-colors">
              <Facebook className="w-4 h-4" />
            </div>
          </MagneticButton>

          {/* Instagram Magnetic Icon Link */}
          <MagneticButton
            href={instagramLink}
            target="_blank"
            rel="noopener noreferrer"
            ariaLabel="digivideas Instagram sayfası"
            strength={25}
          >
            <div className="w-10 h-10 rounded-full bg-white/5 hover:bg-brand-500/20 border border-white/10 hover:border-brand-500/50 flex items-center justify-center text-zinc-300 hover:text-brand-400 transition-colors">
              <Instagram className="w-4 h-4" />
            </div>
          </MagneticButton>

          {/* Quick Contact CTA */}
          <MagneticButton strength={20}>
            <Link
              href="/contact"
              className="hidden sm:inline-flex items-center gap-1.5 bg-brand-500 hover:bg-brand-600 text-slate-950 font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-full shadow-glow-orange hover:shadow-glow-orange-lg transition-all active:scale-95"
            >
              <span>Teklif Alın</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </MagneticButton>
        </div>
      </div>
    </header>
  );
}
