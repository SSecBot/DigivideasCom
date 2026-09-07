"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Pause,
  Play,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  X,
  Layers,
  Image as ImageIcon,
  ZoomIn,
} from "lucide-react";

interface CampaignGalleryMarqueeProps {
  images: string[];
  customerName: string;
  className?: string;
  speedSeconds?: number; // Duration in seconds for a full loop
}

export function CampaignGalleryMarquee({
  images,
  customerName,
  className = "",
  speedSeconds = 35,
}: CampaignGalleryMarqueeProps) {
  const [isPaused, setIsPaused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isTouchActive, setIsTouchActive] = useState(false);
  const [activeLightboxIndex, setActiveLightboxIndex] = useState<number | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const scrollTrackRef = useRef<HTMLDivElement>(null);
  const animFrameRef = useRef<number | null>(null);
  const currentScrollRef = useRef<number>(0);
  const lastTimeRef = useRef<number | null>(null);

  // Clean and filter valid images
  const validImages = (images || []).filter((img) => typeof img === "string" && img.trim().length > 0);

  // Repeat images if fewer than 6 so the marquee is always seamlessly full on large screens
  const displayItems = React.useMemo(() => {
    if (validImages.length === 0) return [];
    if (validImages.length >= 6) return validImages;
    const repeatCount = Math.ceil(8 / validImages.length);
    const repeated: string[] = [];
    for (let i = 0; i < repeatCount; i++) {
      repeated.push(...validImages);
    }
    return repeated;
  }, [validImages]);

  // Duplicate for seamless infinite marquee loop (A + B track)
  const marqueeItems = React.useMemo(() => {
    if (displayItems.length === 0) return [];
    return [...displayItems, ...displayItems];
  }, [displayItems]);

  const effectivePaused = isPaused || isHovered || isTouchActive;

  // Custom continuous slow auto-scroll engine via requestAnimationFrame
  const animateScroll = useCallback(
    (timestamp: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = timestamp;
      const deltaTime = timestamp - lastTimeRef.current;
      lastTimeRef.current = timestamp;

      const track = scrollTrackRef.current;
      if (track && !effectivePaused && marqueeItems.length > 0) {
        // Speed in pixels per millisecond (approx 36px/sec for slow gentle pace)
        const pixelsPerSecond = 36;
        const moveAmount = (pixelsPerSecond * deltaTime) / 1000;
        currentScrollRef.current += moveAmount;

        const halfWidth = track.scrollWidth / 2;
        if (halfWidth > 0 && currentScrollRef.current >= halfWidth) {
          currentScrollRef.current -= halfWidth;
        }

        track.style.transform = `translate3d(-${currentScrollRef.current}px, 0, 0)`;
      }

      animFrameRef.current = requestAnimationFrame(animateScroll);
    },
    [effectivePaused, marqueeItems.length]
  );

  useEffect(() => {
    lastTimeRef.current = performance.now();
    animFrameRef.current = requestAnimationFrame(animateScroll);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [animateScroll]);

  // Manual Nudge Navigation
  const handleNudge = (direction: "left" | "right") => {
    const track = scrollTrackRef.current;
    if (!track) return;
    const step = 320; // Approx one card width
    if (direction === "left") {
      currentScrollRef.current = Math.max(0, currentScrollRef.current - step);
    } else {
      currentScrollRef.current += step;
      const halfWidth = track.scrollWidth / 2;
      if (halfWidth > 0 && currentScrollRef.current >= halfWidth) {
        currentScrollRef.current -= halfWidth;
      }
    }
    track.style.transform = `translate3d(-${currentScrollRef.current}px, 0, 0)`;
  };

  // Keyboard navigation for Lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeLightboxIndex === null) return;
      if (e.key === "Escape") {
        setActiveLightboxIndex(null);
      } else if (e.key === "ArrowRight") {
        setActiveLightboxIndex((prev) =>
          prev !== null ? (prev + 1) % validImages.length : 0
        );
      } else if (e.key === "ArrowLeft") {
        setActiveLightboxIndex((prev) =>
          prev !== null ? (prev - 1 + validImages.length) % validImages.length : 0
        );
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeLightboxIndex, validImages.length]);

  if (validImages.length === 0) {
    return null;
  }

  return (
    <section className={`w-full space-y-6 ${className}`}>
      {/* Header Bar with Info & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-500" />
            </span>
            <span className="text-xs font-mono font-bold text-brand-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Kampanya Görsel Galerisi</span>
            </span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <span>{customerName} Kreatif Varlıkları</span>
            <span className="text-xs font-mono font-medium px-2.5 py-1 rounded-full bg-slate-900 border border-brand-500/30 text-brand-400">
              {validImages.length} Görsel
            </span>
          </h3>
        </div>

        {/* Carousel Interactive Controls */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* Pause / Play Toggle */}
          <button
            onClick={() => setIsPaused((prev) => !prev)}
            aria-label={isPaused ? "Kaydırmayı Başlat" : "Kaydırmayı Duraklat"}
            className={`px-3 py-2 rounded-xl text-xs font-mono font-semibold flex items-center gap-2 border transition-all ${
              isPaused
                ? "bg-brand-500 text-slate-950 border-brand-400 shadow-glow-orange font-bold"
                : "bg-slate-900/80 text-zinc-300 border-white/10 hover:text-white hover:border-brand-500/40"
            }`}
          >
            {isPaused ? (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span className="hidden md:inline">Oynat</span>
              </>
            ) : (
              <>
                <Pause className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Duraklat</span>
              </>
            )}
          </button>

          {/* Prev Nudge Button */}
          <button
            onClick={() => handleNudge("left")}
            aria-label="Önceki Görseller"
            className="p-2 rounded-xl bg-slate-900/80 border border-white/10 text-zinc-300 hover:text-white hover:border-brand-500/40 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Next Nudge Button */}
          <button
            onClick={() => handleNudge("right")}
            aria-label="Sonraki Görseller"
            className="p-2 rounded-xl bg-slate-900/80 border border-white/10 text-zinc-300 hover:text-white hover:border-brand-500/40 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Marquee Carousel Container */}
      <div
        ref={containerRef}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onTouchStart={() => setIsTouchActive(true)}
        onTouchEnd={() => setIsTouchActive(false)}
        className="relative w-full overflow-hidden rounded-3xl bg-slate-950/90 border border-white/10 py-6 sm:py-8 select-none group"
      >
        {/* Left & Right Edge Vignette Gradients */}
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-16 sm:w-28 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent z-10" />
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-16 sm:w-28 bg-gradient-to-l from-slate-950 via-slate-950/80 to-transparent z-10" />

        {/* Floating Pause Indicator Badge on Hover */}
        <AnimatePresence>
          {effectivePaused && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="absolute top-4 right-6 z-20 pointer-events-none hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/90 border border-brand-500/40 backdrop-blur-md text-[11px] font-mono text-brand-400 shadow-glow-orange"
            >
              <Pause className="w-3 h-3" />
              <span>Görsel İnceleme Modu (Duraklatıldı)</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Continuous Scrolling Track */}
        <div
          ref={scrollTrackRef}
          className="flex gap-5 sm:gap-6 will-change-transform"
          style={{ width: "max-content" }}
        >
          {marqueeItems.map((imgSrc, idx) => {
            const originalIndex = idx % validImages.length;
            return (
              <div
                key={`${imgSrc}-${idx}`}
                onClick={() => setActiveLightboxIndex(originalIndex)}
                className="group/card relative w-64 sm:w-80 md:w-96 aspect-[16/10] flex-shrink-0 rounded-2xl overflow-hidden bg-slate-900 border border-white/10 hover:border-brand-500/80 shadow-lg hover:shadow-glow-orange transition-all duration-300 cursor-pointer transform-gpu hover:-translate-y-1"
              >
                {/* Image */}
                <Image
                  src={imgSrc}
                  alt={`${customerName} Kampanya Görseli ${originalIndex + 1}`}
                  fill
                  unoptimized
                  sizes="(max-width: 768px) 256px, 384px"
                  className="object-cover transition-transform duration-700 group-hover/card:scale-105"
                />

                {/* Gradient Overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent opacity-80 group-hover/card:opacity-60 transition-opacity" />

                {/* Top Badge */}
                <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-950/80 backdrop-blur-md border border-white/10 text-[10px] font-mono text-zinc-300">
                  <ImageIcon className="w-3 h-3 text-brand-400" />
                  <span>#{originalIndex + 1}</span>
                </div>

                {/* Zoom In Action Indicator on Hover */}
                <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-slate-950/80 backdrop-blur-md border border-brand-500/40 text-brand-400 flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-all duration-200 transform scale-75 group-hover/card:scale-100 shadow-glow-orange">
                  <ZoomIn className="w-4 h-4" />
                </div>

                {/* Bottom Caption Info */}
                <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-white tracking-wide truncate max-w-[200px]">
                      {customerName}
                    </p>
                    <p className="text-[10px] font-mono text-brand-400">
                      Kampanya Kreatif Varlığı
                    </p>
                  </div>

                  <span className="text-[10px] font-mono text-zinc-400 bg-black/60 px-2 py-0.5 rounded border border-white/5">
                    Büyüt
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Helper text */}
      <div className="flex items-center justify-between text-xs text-zinc-400 font-mono px-2">
        <span className="flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-brand-400" />
          <span>Görselleri duraklatmak için fareyi üzerine getirin veya dokunun.</span>
        </span>
        <span className="hidden sm:inline text-zinc-500">
          Detaylı incelemek için görsellere tıklayın.
        </span>
      </div>

      {/* Interactive Fullscreen Lightbox Modal */}
      <AnimatePresence>
        {activeLightboxIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col items-center justify-between p-4 sm:p-8"
            onClick={() => setActiveLightboxIndex(null)}
          >
            {/* Top Toolbar */}
            <div
              className="w-full max-w-6xl flex items-center justify-between text-white z-10"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3">
                <div className="px-3 py-1.5 rounded-full bg-slate-900 border border-brand-500/40 text-xs font-mono text-brand-400">
                  {customerName} • {activeLightboxIndex + 1} / {validImages.length}
                </div>
                <span className="text-xs font-mono text-zinc-400 hidden sm:inline">
                  Yön Tuşları: [←] [→] | Kapat: [ESC]
                </span>
              </div>

              <button
                onClick={() => setActiveLightboxIndex(null)}
                aria-label="Kapat"
                className="p-2.5 rounded-2xl bg-slate-900/90 border border-white/15 text-zinc-300 hover:text-white hover:border-brand-500/60 transition-colors shadow-2xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Main Center Image Stage */}
            <div
              className="relative w-full max-w-5xl h-[65vh] sm:h-[75vh] flex items-center justify-center my-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Prev Arrow */}
              {validImages.length > 1 && (
                <button
                  onClick={() =>
                    setActiveLightboxIndex((prev) =>
                      prev !== null
                        ? (prev - 1 + validImages.length) % validImages.length
                        : 0
                    )
                  }
                  aria-label="Önceki Görsel"
                  className="absolute left-2 sm:-left-6 z-20 p-3 rounded-full bg-slate-900/90 border border-white/20 text-white hover:border-brand-500 hover:text-brand-400 transition-all shadow-2xl hover:scale-110"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
              )}

              {/* Active Image */}
              <motion.div
                key={activeLightboxIndex}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.2 }}
                className="relative w-full h-full rounded-2xl overflow-hidden border border-white/15 shadow-glow-orange-lg bg-slate-950 flex items-center justify-center"
              >
                <Image
                  src={validImages[activeLightboxIndex]}
                  alt={`${customerName} Kampanya Büyük Görünüm`}
                  fill
                  unoptimized
                  sizes="100vw"
                  className="object-contain"
                />
              </motion.div>

              {/* Next Arrow */}
              {validImages.length > 1 && (
                <button
                  onClick={() =>
                    setActiveLightboxIndex((prev) =>
                      prev !== null ? (prev + 1) % validImages.length : 0
                    )
                  }
                  aria-label="Sonraki Görsel"
                  className="absolute right-2 sm:-right-6 z-20 p-3 rounded-full bg-slate-900/90 border border-white/20 text-white hover:border-brand-500 hover:text-brand-400 transition-all shadow-2xl hover:scale-110"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              )}
            </div>

            {/* Bottom Thumbnails Strip */}
            {validImages.length > 1 && (
              <div
                className="w-full max-w-4xl flex items-center justify-center gap-2.5 overflow-x-auto py-2 z-10"
                onClick={(e) => e.stopPropagation()}
              >
                {validImages.map((thumb, tIdx) => (
                  <button
                    key={`lightbox-thumb-${tIdx}`}
                    onClick={() => setActiveLightboxIndex(tIdx)}
                    className={`relative w-16 h-12 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 ${
                      activeLightboxIndex === tIdx
                        ? "border-brand-500 shadow-glow-orange scale-105"
                        : "border-white/20 opacity-60 hover:opacity-100"
                    }`}
                  >
                    <Image
                      src={thumb}
                      alt={`Thumbnail ${tIdx + 1}`}
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
