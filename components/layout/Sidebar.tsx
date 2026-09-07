"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Home,
  Users,
  Layers,
  Star,
  BookOpen,
  Mail,
  Menu,
  X,
  MessageCircle,
} from "lucide-react";
import { useCMSStore } from "@/lib/store/cms-store";

export function Sidebar() {
  const pathname = usePathname();
  const { narrative } = useCMSStore();
  const [isOpenMobile, setIsOpenMobile] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const isExpanded = isHovered || isOpenMobile;
  const whatsappUrl = `https://wa.me/${(narrative.whatsappNumber || "905492115561").replace(/[^0-9]/g, "")}?text=Merhaba,%20Digivideas%20dijital%20reklam%20hizmetleri%20hakk%C4%B1nda%20bilgi%20almak%20istiyorum.`;

  const navItems = [
    { label: "Ana Sayfa", href: "/", icon: Home },
    { label: "Hakkımızda", href: "/about", icon: Users },
    { label: "Hizmetlerimiz", href: "/services", icon: Layers },
    { label: "Müşterilerimiz", href: "/customers", icon: Star },
    { label: "Blog", href: "/blog", icon: BookOpen },
    { label: "İletişim", href: "/contact", icon: Mail },
  ];

  return (
    <>
      {/* Mobile Menu Button (Fixed Top Left) */}
      <button
        onClick={() => setIsOpenMobile(!isOpenMobile)}
        className="fixed top-5 left-4 z-50 lg:hidden w-10 h-10 rounded-full bg-slate-900/90 border border-white/15 text-white flex items-center justify-center backdrop-blur-xl shadow-lg"
        aria-label="Menüyü Aç/Kapat"
      >
        {isOpenMobile ? <X className="w-5 h-5 text-brand-400" /> : <Menu className="w-5 h-5 text-white" />}
      </button>

      {/* Mobile Drawer Overlay */}
      {isOpenMobile && (
        <div
          onClick={() => setIsOpenMobile(false)}
          className="fixed inset-0 bg-black/80 backdrop-blur-md z-40 lg:hidden"
        />
      )}

      {/* Left Fixed Vertical Sidebar */}
      <aside
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`fixed left-0 top-0 bottom-0 z-50 glass-sidebar flex flex-col justify-between py-6 transition-all duration-300 ${
          isOpenMobile ? "translate-x-0 w-64 px-4" : "-translate-x-full lg:translate-x-0"
        } ${isHovered ? "lg:w-64 lg:px-4" : "lg:w-20 lg:px-3"}`}
      >
        {/* Top Branding Asset: logo.png + Strictly 'Dijital Reklam Ajansı' in Poppins */}
        <div className="flex items-center justify-start min-h-[48px] px-1">
          <Link
            href="/"
            onClick={() => setIsOpenMobile(false)}
            className="flex items-center gap-3 group"
            aria-label="digivideas Ana Sayfa"
          >
            {/* Official Logo Asset */}
            <div className="w-10 h-10 rounded-2xl bg-slate-900 border border-white/10 p-1 flex-shrink-0 shadow-glow-orange flex items-center justify-center group-hover:border-brand-500/40 transition-colors">
              <img
                src="/assets/logo.png"
                alt="digivideas"
                className="h-8 w-auto object-contain group-hover:scale-105 transition-transform"
              />
            </div>

            {/* Strictly 'Dijital Reklam Ajansı' in Poppins Typography */}
            {isExpanded && (
              <div className="flex flex-col min-w-0 transition-opacity duration-300">
                <span className="font-poppins font-medium sm:font-semibold text-xs sm:text-[13px] text-zinc-200 group-hover:text-white tracking-wide leading-tight whitespace-nowrap">
                  Dijital Reklam Ajansı
                </span>
              </div>
            )}
          </Link>
        </div>

        {/* Center Vertical Navigation Menu */}
        <nav className="flex-1 flex flex-col justify-center space-y-2 py-6">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpenMobile(false)}
                className={`group relative flex items-center gap-3.5 p-3 rounded-2xl transition-all duration-200 ${
                  isActive
                    ? "bg-brand-500 text-slate-950 font-semibold shadow-glow-orange"
                    : "text-zinc-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon
                  className={`w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-110 ${
                    isActive ? "text-slate-950" : "text-zinc-400 group-hover:text-brand-400"
                  }`}
                />

                {/* Text Label */}
                <span
                  className={`text-sm tracking-tight whitespace-nowrap transition-all duration-200 ${
                    isExpanded
                      ? "opacity-100 translate-x-0"
                      : "opacity-0 -translate-x-2 hidden lg:inline-block lg:w-0"
                  }`}
                >
                  {item.label}
                </span>

                {/* Active Indicator Dot on Collapsed Sidebar */}
                {isActive && !isExpanded && (
                  <span className="hidden lg:block absolute right-2 w-1.5 h-1.5 rounded-full bg-slate-950" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Actions: WhatsApp Direct Connect Only (Zero Admin Links) */}
        <div className="pt-4 border-t border-white/10">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center gap-3 p-3 rounded-2xl bg-brand-500/10 hover:bg-brand-500 text-brand-400 hover:text-slate-950 border border-brand-500/30 transition-all group"
            title="WhatsApp ile İletişime Geçin (+90 549 211 55 61)"
          >
            <MessageCircle className="w-5 h-5 flex-shrink-0" />
            <span
              className={`text-xs font-medium whitespace-nowrap transition-opacity ${
                isExpanded ? "opacity-100" : "opacity-0 hidden lg:inline-block lg:w-0"
              }`}
            >
              WhatsApp Hattı
            </span>
          </a>
        </div>
      </aside>
    </>
  );
}
