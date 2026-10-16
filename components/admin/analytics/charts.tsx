"use client";

import React, { useEffect, useRef, useState } from "react";

/**
 * Small dependency-free SVG charts for the analytics dashboard.
 * Single-series marks in the brand accent; text always uses neutral text tokens.
 */

const ACCENT = "#F97316"; // brand-500
const GRID = "rgba(255,255,255,0.08)";
const SURFACE = "#1F1F1F";

export function formatCompact(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1).replace(".0", "")}M`;
  if (value >= 10_000) return `${Math.round(value / 1000)}B`;
  if (value >= 1_000) return `${(value / 1000).toFixed(1).replace(".0", "")}B`;
  return value.toLocaleString("tr-TR");
}

function niceMax(value: number): number {
  if (value <= 4) return 4;
  const magnitude = 10 ** Math.floor(Math.log10(value));
  const steps = [1, 2, 2.5, 5, 10];
  for (const step of steps) {
    if (step * magnitude >= value) return step * magnitude;
  }
  return 10 * magnitude;
}

function useWidth<T extends HTMLElement>(): [React.RefObject<T>, number] {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(600);
  useEffect(() => {
    if (!ref.current) return;
    const observer = new ResizeObserver((entries) => setWidth(entries[0].contentRect.width));
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return [ref, width];
}

export interface SeriesPoint {
  label: string; // full label for tooltip
  shortLabel: string; // axis label
  value: number;
}

/** Area/line chart with crosshair + tooltip. */
export function AreaChart({ points, height = 240, valueLabel }: { points: SeriesPoint[]; height?: number; valueLabel: string }) {
  const [ref, width] = useWidth<HTMLDivElement>();
  const [hover, setHover] = useState<number | null>(null);

  const pad = { top: 16, right: 16, bottom: 28, left: 40 };
  const innerW = Math.max(10, width - pad.left - pad.right);
  const innerH = height - pad.top - pad.bottom;
  const max = niceMax(Math.max(...points.map((p) => p.value), 0));
  const x = (i: number) => pad.left + (points.length <= 1 ? innerW / 2 : (i / (points.length - 1)) * innerW);
  const y = (v: number) => pad.top + innerH - (v / max) * innerH;

  const line = points.map((p, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(p.value).toFixed(1)}`).join(" ");
  const area = points.length
    ? `${line} L${x(points.length - 1).toFixed(1)},${pad.top + innerH} L${x(0).toFixed(1)},${pad.top + innerH} Z`
    : "";
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => Math.round(max * f));
  const labelEvery = Math.max(1, Math.ceil(points.length / Math.max(2, Math.floor(innerW / 70))));

  const onMove = (event: React.PointerEvent<SVGRectElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const relative = (event.clientX - rect.left) / rect.width;
    setHover(Math.max(0, Math.min(points.length - 1, Math.round(relative * (points.length - 1)))));
  };

  const hovered = hover !== null ? points[hover] : null;

  return (
    <div ref={ref} className="relative w-full select-none">
      <svg width={width} height={height} role="img" aria-label={`${valueLabel} grafiği`}>
        {ticks.map((tick) => (
          <g key={tick}>
            <line x1={pad.left} x2={pad.left + innerW} y1={y(tick)} y2={y(tick)} stroke={GRID} strokeWidth={1} />
            <text x={pad.left - 8} y={y(tick)} dy="0.32em" textAnchor="end" className="fill-zinc-500 text-[10px] font-mono">
              {formatCompact(tick)}
            </text>
          </g>
        ))}
        {points.map((p, i) =>
          i % labelEvery === 0 || i === points.length - 1 ? (
            <text key={p.label} x={x(i)} y={height - 8} textAnchor="middle" className="fill-zinc-500 text-[10px] font-mono">
              {p.shortLabel}
            </text>
          ) : null
        )}
        <path d={area} fill={ACCENT} fillOpacity={0.1} />
        <path d={line} fill="none" stroke={ACCENT} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
        {points.length > 0 && (
          <circle cx={x(points.length - 1)} cy={y(points[points.length - 1].value)} r={4} fill={ACCENT} stroke={SURFACE} strokeWidth={2} />
        )}
        {hovered && hover !== null && (
          <g pointerEvents="none">
            <line x1={x(hover)} x2={x(hover)} y1={pad.top} y2={pad.top + innerH} stroke="rgba(255,255,255,0.25)" strokeWidth={1} />
            <circle cx={x(hover)} cy={y(hovered.value)} r={5} fill={ACCENT} stroke={SURFACE} strokeWidth={2} />
          </g>
        )}
        <rect
          x={pad.left}
          y={pad.top}
          width={innerW}
          height={innerH}
          fill="transparent"
          onPointerMove={onMove}
          onPointerDown={onMove}
          onPointerLeave={() => setHover(null)}
        />
      </svg>
      {hovered && hover !== null && (
        <div
          className="absolute pointer-events-none z-10 px-3 py-2 rounded-xl bg-slate-950 border border-white/15 shadow-xl text-xs whitespace-nowrap"
          style={{
            left: Math.min(Math.max(x(hover) - 70, 0), Math.max(0, width - 150)),
            top: Math.max(0, y(hovered.value) - 62),
          }}
        >
          <div className="text-zinc-400 font-mono">{hovered.label}</div>
          <div className="text-white font-semibold">
            {hovered.value.toLocaleString("tr-TR")} {valueLabel.toLowerCase()}
          </div>
        </div>
      )}
    </div>
  );
}

/** Vertical columns, e.g. page views per hour. */
export function ColumnChart({
  values,
  labels,
  height = 160,
  valueLabel,
  labelEvery = 3, // 0 hides the axis labels
}: {
  values: number[];
  labels: string[];
  height?: number;
  valueLabel: string;
  labelEvery?: number;
}) {
  const [ref, width] = useWidth<HTMLDivElement>();
  const [hover, setHover] = useState<number | null>(null);
  const pad = { top: 12, bottom: 22 };
  const innerH = height - pad.top - pad.bottom;
  const max = Math.max(...values, 1);
  const slot = width / Math.max(values.length, 1);
  const barW = Math.min(24, Math.max(3, slot - 2));

  return (
    <div ref={ref} className="relative w-full select-none">
      <svg width={width} height={height} role="img" aria-label={`${valueLabel} sütun grafiği`}>
        <line x1={0} x2={width} y1={pad.top + innerH} y2={pad.top + innerH} stroke={GRID} strokeWidth={1} />
        {values.map((value, i) => {
          const h = (value / max) * innerH;
          const cx = i * slot + slot / 2;
          const top = pad.top + innerH - h;
          const r = Math.min(4, h / 2, barW / 2);
          return (
            <g key={i}>
              {h > 0 && (
                <path
                  d={`M${cx - barW / 2},${pad.top + innerH} V${top + r} Q${cx - barW / 2},${top} ${cx - barW / 2 + r},${top} H${cx + barW / 2 - r} Q${cx + barW / 2},${top} ${cx + barW / 2},${top + r} V${pad.top + innerH} Z`}
                  fill={ACCENT}
                  fillOpacity={hover === null || hover === i ? 1 : 0.45}
                />
              )}
              {labelEvery > 0 && i % labelEvery === 0 && (
                <text x={cx} y={height - 6} textAnchor="middle" className="fill-zinc-500 text-[10px] font-mono">
                  {labels[i]}
                </text>
              )}
              <rect
                x={i * slot}
                y={0}
                width={slot}
                height={pad.top + innerH}
                fill="transparent"
                onPointerEnter={() => setHover(i)}
                onPointerDown={() => setHover(i)}
                onPointerLeave={() => setHover(null)}
              />
            </g>
          );
        })}
      </svg>
      {hover !== null && (
        <div
          className="absolute pointer-events-none z-10 px-3 py-2 rounded-xl bg-slate-950 border border-white/15 shadow-xl text-xs whitespace-nowrap"
          style={{ left: Math.min(Math.max(hover * slot + slot / 2 - 60, 0), Math.max(0, width - 130)), top: 0 }}
        >
          <div className="text-zinc-400 font-mono">{labels[hover]}</div>
          <div className="text-white font-semibold">
            {values[hover].toLocaleString("tr-TR")} {valueLabel.toLowerCase()}
          </div>
        </div>
      )}
    </div>
  );
}

/** Ranked horizontal bar list (top pages, sources, devices...). */
export function BarList({
  rows,
  emptyText = "Bu aralıkta veri yok.",
  formatKey,
  total,
}: {
  rows: { key: string; value: number; hint?: string }[];
  emptyText?: string;
  formatKey?: (key: string) => string;
  total?: number;
}) {
  if (rows.length === 0) {
    return <p className="text-xs text-zinc-500 py-6 text-center">{emptyText}</p>;
  }
  const max = Math.max(...rows.map((row) => row.value), 1);
  const sum = total ?? rows.reduce((acc, row) => acc + row.value, 0);
  return (
    <ul className="space-y-1.5">
      {rows.map((row) => (
        <li key={row.key} className="group relative" title={`${formatKey ? formatKey(row.key) : row.key}: ${row.value.toLocaleString("tr-TR")}`}>
          <div className="relative flex items-center justify-between gap-3 px-3 py-2 rounded-lg overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 rounded-r-[4px] bg-brand-500/20 group-hover:bg-brand-500/30 transition-colors"
              style={{ width: `${(row.value / max) * 100}%` }}
              aria-hidden="true"
            />
            <span className="relative text-xs text-zinc-200 truncate min-w-0">
              {formatKey ? formatKey(row.key) : row.key}
              {row.hint && <span className="ml-2 text-zinc-500 font-mono">{row.hint}</span>}
            </span>
            <span className="relative text-xs font-mono text-white flex-shrink-0">
              {row.value.toLocaleString("tr-TR")}
              {sum > 0 && <span className="ml-1.5 text-zinc-500">%{Math.round((row.value / sum) * 100)}</span>}
            </span>
          </div>
        </li>
      ))}
    </ul>
  );
}
