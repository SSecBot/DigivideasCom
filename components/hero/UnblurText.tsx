"use client";

import React, { useState } from "react";
import { Sparkles, Eye, EyeOff } from "lucide-react";

interface UnblurTextProps {
  lines: {
    badge?: string;
    text: string;
    highlight?: string;
    emphasis?: string;
  }[];
}

export function UnblurText({ lines }: UnblurTextProps) {
  const [forceClearAll, setForceClearAll] = useState(false);
  const [hoveredLineIndex, setHoveredLineIndex] = useState<number | null>(null);

  return (
    <div className="relative space-y-4">
      {/* Micro-bar with dynamic unblur indicator & accessibility toggle */}
      <div className="flex items-center justify-between pb-1">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-400 text-xs font-mono">
          <Sparkles className="w-3.5 h-3.5 animate-spin text-brand-400" />
          <span>İmleci satırların üzerine getirerek keşfedin</span>
        </div>

        <button
          onClick={() => setForceClearAll(!forceClearAll)}
          className="text-[11px] text-zinc-400 hover:text-white flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/5 hover:bg-white/10 transition-colors border border-white/10"
          title="Tüm metinleri netleştir veya bulanıklaştır"
        >
          {forceClearAll ? (
            <>
              <EyeOff className="w-3 h-3 text-brand-400" />
              <span>Bulanıklığı Aç</span>
            </>
          ) : (
            <>
              <Eye className="w-3 h-3 text-brand-400" />
              <span>Tümünü Netleştir</span>
            </>
          )}
        </button>
      </div>

      {/* Narrative Paragraph Lines with Line-by-Line Unblur Effect */}
      <div className="space-y-3">
        {lines.map((line, index) => {
          const isHovered = hoveredLineIndex === index;
          const isClear = forceClearAll || isHovered;

          return (
            <div
              key={index}
              onMouseEnter={() => setHoveredLineIndex(index)}
              onMouseLeave={() => setHoveredLineIndex(null)}
              className={`p-3.5 rounded-2xl border transition-all duration-400 cursor-pointer ${
                isClear
                  ? "bg-slate-900/90 border-brand-500/40 shadow-glow-orange scale-[1.01]"
                  : "bg-slate-900/40 border-white/5 hover:border-white/20"
              }`}
              style={{
                backdropFilter: "blur(12px)",
              }}
            >
              {line.badge && (
                <div className="mb-1.5 flex items-center gap-1.5">
                  <span className="text-[11px] font-mono font-bold text-brand-400 uppercase tracking-wider">
                    {line.badge}
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-500" />
                </div>
              )}

              <p
                className="text-base sm:text-lg leading-relaxed text-zinc-200"
                style={{
                  filter: isClear ? "blur(0px)" : "blur(8px)",
                  opacity: isClear ? 1 : 0.65,
                  transition: "filter 0.4s ease, opacity 0.4s ease, transform 0.4s ease",
                  transform: isClear ? "translateY(0)" : "translateY(2px)",
                }}
              >
                {line.text}
                {line.highlight && (
                  <span className="font-semibold text-brand-400 ml-1.5">
                    {line.highlight}
                  </span>
                )}
                {line.emphasis && (
                  <span className="italic text-white font-medium ml-1.5">
                    {line.emphasis}
                  </span>
                )}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
