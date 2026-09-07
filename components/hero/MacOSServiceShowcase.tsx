"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Share2,
  Target,
  Code2,
  Video,
  Search,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Zap,
  Terminal,
  Layers,
  FileCheck,
} from "lucide-react";
import { ServiceItem } from "@/lib/types/cms";
import { initialServices } from "@/lib/data/initial-data";

interface MacOSServiceShowcaseProps {
  services?: ServiceItem[];
}

const iconMap: { [key: string]: React.ElementType } = {
  Share2,
  Target,
  Code2,
  Video,
  Search,
  Sparkles,
  Zap,
};

export function MacOSServiceShowcase({ services }: MacOSServiceShowcaseProps) {
  // Use passed live services or fallback to initialServices
  const activeServicesList =
    services && services.length > 0
      ? services.filter((s) => s.status !== "draft")
      : initialServices;

  const [activeServiceId, setActiveServiceId] = useState<string>(
    activeServicesList[0]?.id || "srv-1"
  );
  const [activeTab, setActiveTab] = useState<"overview" | "deliverables">("overview");

  // Keep activeServiceId valid when services list updates
  useEffect(() => {
    if (activeServicesList.length > 0) {
      const exists = activeServicesList.some((s) => s.id === activeServiceId);
      if (!exists) {
        setActiveServiceId(activeServicesList[0].id);
      }
    }
  }, [activeServicesList, activeServiceId]);

  const activeService =
    activeServicesList.find((s) => s.id === activeServiceId) ||
    activeServicesList[0];

  if (!activeService) return null;

  const ActiveIcon = iconMap[activeService.iconName] || Sparkles;

  return (
    <div className="w-full flex justify-center select-none overflow-hidden py-2">
      {/* 
        Responsive Proportional Scaling Container:
        On mobile (< 768px), the entire window maintains its exact 2-column macOS structural layout
        and titlebar dots without breaking into vertical stacks by scaling down proportionally.
      */}
      <div className="w-[680px] sm:w-[720px] md:w-full origin-top transform scale-[0.48] xs:scale-[0.58] sm:scale-[0.76] md:scale-100 transition-transform duration-300 flex-shrink-0">
        <div className="relative w-full">
          {/* Ambient background glow behind window */}
          <div className="absolute -inset-2 bg-gradient-to-r from-brand-500/25 via-brand-600/20 to-brand-400/20 rounded-3xl blur-2xl opacity-80 pointer-events-none" />

          {/* Main macOS Application Window Container */}
          <div className="relative rounded-2xl bg-slate-950/95 border border-white/15 shadow-2xl backdrop-blur-2xl overflow-hidden flex flex-col transition-all duration-300 w-full">
            {/* macOS Top Window Header / Title Bar */}
            <div className="h-11 bg-slate-900/95 border-b border-white/10 px-4 flex items-center justify-between">
              {/* macOS Window Traffic Lights (Orange/Anthracite Palette Harmony) */}
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full bg-brand-600 border border-brand-700 flex items-center justify-center group cursor-pointer"
                  title="Kapat"
                >
                  <span className="opacity-0 group-hover:opacity-100 text-[8px] text-slate-950 font-bold leading-none">
                    ×
                  </span>
                </div>
                <div
                  className="w-3 h-3 rounded-full bg-brand-500 border border-brand-600 flex items-center justify-center group cursor-pointer"
                  title="Simge Durumuna Küçült"
                >
                  <span className="opacity-0 group-hover:opacity-100 text-[8px] text-slate-950 font-bold leading-none">
                    –
                  </span>
                </div>
                <div
                  className="w-3 h-3 rounded-full bg-brand-400 border border-brand-500 flex items-center justify-center group cursor-pointer"
                  title="Tam Ekran"
                >
                  <span className="opacity-0 group-hover:opacity-100 text-[6px] text-slate-950 font-bold leading-none">
                    +
                  </span>
                </div>
              </div>

              {/* Title & App Name */}
              <div className="flex items-center gap-2 text-xs font-mono text-zinc-300">
                <Terminal className="w-3.5 h-3.5 text-brand-400" />
                <span className="font-semibold text-white">digivideas OS</span>
                <span className="text-zinc-500">•</span>
                <span className="text-zinc-400">Hizmet Kokpiti (Canlı CMS)</span>
              </div>

              {/* Live Status Pill */}
              <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-brand-500/10 border border-brand-500/30 text-[10px] font-mono text-brand-400">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse" />
                <span>Canlı Hizmetler</span>
              </div>
            </div>

            {/* macOS Window Main Body: Fixed 2-Column Desktop Grid Layout */}
            <div className="grid grid-cols-12 min-h-[460px] lg:min-h-[500px]">
              {/* Internal Left Sidebar: Service Nav Items (4 Cols) */}
              <div className="col-span-5 sm:col-span-4 bg-slate-950/70 border-r border-white/10 p-3 space-y-1">
                <div className="px-2 py-1.5 text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider flex items-center justify-between">
                  <span>Hizmet Kataloğu</span>
                  <span className="text-brand-400 font-bold">{activeServicesList.length}</span>
                </div>

                <div className="space-y-1">
                  {activeServicesList.map((service) => {
                    const SrvIcon = iconMap[service.iconName] || Sparkles;
                    const isActive = service.id === activeServiceId;
                    const displayTitle = service.title.split("&")[0].split("—")[0].trim();

                    return (
                      <button
                        key={service.id}
                        onClick={() => {
                          setActiveServiceId(service.id);
                          setActiveTab("overview");
                        }}
                        className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all duration-200 group relative ${
                          isActive
                            ? "bg-brand-500/20 border border-brand-500/40 text-white font-medium shadow-sm"
                            : "text-zinc-400 hover:text-white hover:bg-white/5 border border-transparent"
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <div
                            className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${
                              isActive
                                ? "bg-brand-500 text-slate-950"
                                : "bg-white/5 text-zinc-400 group-hover:text-brand-400"
                            }`}
                          >
                            <SrvIcon className="w-3.5 h-3.5" />
                          </div>
                          <span className="text-[11px] truncate font-medium">{displayTitle}</span>
                        </div>

                        {isActive && (
                          <motion.div
                            layoutId="activeServiceDot"
                            className="w-1.5 h-1.5 rounded-full bg-brand-400 flex-shrink-0"
                          />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Sidebar Info Tip */}
                <div className="pt-4 px-1">
                  <div className="p-2 rounded-xl bg-white/[0.03] border border-white/5 text-[10px] text-zinc-400 font-mono leading-relaxed">
                    <span className="text-brand-400 font-bold">İzmir, Türkiye:</span> Stratejik dijital reklam ve teknoloji altyapısı.
                  </div>
                </div>
              </div>

              {/* Internal Right Stage: Service Details (7/8 Cols) */}
              <div className="col-span-7 sm:col-span-8 p-5 sm:p-6 flex flex-col justify-between space-y-4 bg-slate-900/40">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeService.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-4 flex-1 flex flex-col justify-between"
                  >
                    {/* Top Badge & Header */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-brand-500/15 border border-brand-500/30 text-brand-400 text-[10px] font-mono font-medium">
                          {activeService.category}
                        </span>

                        {/* Internal Tab Switchers (Overview / Deliverables - Metrics Strip Purged) */}
                        <div className="flex items-center bg-slate-950/80 border border-white/10 rounded-lg p-0.5 text-[10px] font-mono">
                          <button
                            onClick={() => setActiveTab("overview")}
                            className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 ${
                              activeTab === "overview"
                                ? "bg-brand-500 text-slate-950 font-bold"
                                : "text-zinc-400 hover:text-white"
                            }`}
                          >
                            <Layers className="w-3 h-3" />
                            <span>Özet</span>
                          </button>
                          <button
                            onClick={() => setActiveTab("deliverables")}
                            className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 ${
                              activeTab === "deliverables"
                                ? "bg-brand-500 text-slate-950 font-bold"
                                : "text-zinc-400 hover:text-white"
                            }`}
                          >
                            <FileCheck className="w-3 h-3" />
                            <span>Çıktılar</span>
                          </button>
                        </div>
                      </div>

                      <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2">
                        <ActiveIcon className="w-5 h-5 text-brand-400 flex-shrink-0" />
                        <span className="truncate">{activeService.title}</span>
                      </h3>

                      <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed line-clamp-2">
                        {activeService.shortDesc}
                      </p>
                    </div>

                    {/* Tab Body Contents */}
                    <div className="flex-1 py-1">
                      {/* 1. OVERVIEW TAB: Feature Highlights */}
                      {activeTab === "overview" && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {activeService.features && activeService.features.length > 0 ? (
                            activeService.features.slice(0, 4).map((feat, idx) => (
                              <div
                                key={idx}
                                className="p-2.5 rounded-xl bg-slate-950/80 border border-white/10 hover:border-brand-500/40 transition-colors flex items-start gap-2 text-xs text-zinc-200"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5 text-brand-400 flex-shrink-0 mt-0.5" />
                                <span className="leading-snug text-[11px]">{feat}</span>
                              </div>
                            ))
                          ) : (
                            <div className="p-3 rounded-xl bg-white/5 text-xs text-zinc-400">
                              Detaylı özellikler hizmet sayfasında mevcuttur.
                            </div>
                          )}
                        </div>
                      )}

                      {/* 2. DELIVERABLES TAB: Package Output list */}
                      {activeTab === "deliverables" && (
                        <div className="space-y-2">
                          {activeService.deliverables && activeService.deliverables.length > 0 ? (
                            activeService.deliverables.slice(0, 4).map((item, idx) => (
                              <div
                                key={idx}
                                className="p-2.5 rounded-xl bg-slate-950/80 border border-white/10 flex items-center justify-between text-xs text-zinc-200"
                              >
                                <div className="flex items-center gap-2">
                                  <div className="w-2 h-2 rounded-full bg-brand-400" />
                                  <span className="text-[11px]">{item}</span>
                                </div>
                                <span className="text-[10px] font-mono text-brand-400/80">Tam Teslim</span>
                              </div>
                            ))
                          ) : (
                            <div className="p-3 rounded-xl bg-white/5 text-xs text-zinc-400">
                              Çıktı paketleri hizmet detayında listelenmektedir.
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Bottom Action Footer */}
                    <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-3">
                      <div className="text-[11px] font-mono text-zinc-400 flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5 text-brand-400" />
                        <span>İzmir, Türkiye</span>
                      </div>

                      <Link
                        href={`/services/${activeService.slug}`}
                        className="inline-flex items-center gap-1.5 bg-brand-500 hover:bg-brand-600 text-slate-950 font-bold text-xs px-4 py-2 rounded-xl shadow-glow-orange transition-all active:scale-95 group"
                      >
                        <span>Hizmeti İnceleyin</span>
                        <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                      </Link>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
