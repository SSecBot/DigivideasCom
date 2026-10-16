"use client";

import React, { useEffect } from "react";
import { AlertCircle, X } from "lucide-react";
import { useCrm } from "@/components/admin/crm/CrmProvider";

/** Small shared building blocks for the CRM tabs (matches the admin panel's styling). */

export const inputClass =
  "w-full bg-slate-950 border border-white/10 focus:border-brand-500 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none disabled:opacity-50";

export function Field({
  label,
  htmlFor,
  children,
  className = "",
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`space-y-1.5 min-w-0 ${className}`}>
      <label htmlFor={htmlFor} className="block text-[11px] font-mono text-zinc-400">
        {label}
      </label>
      {children}
    </div>
  );
}

export function PanelHeader({ title, subtitle, action }: { title: string; subtitle: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight">{title}</h2>
        <p className="text-xs text-zinc-400 font-mono mt-1">{subtitle}</p>
      </div>
      {action}
    </div>
  );
}

export function PrimaryButton({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-slate-950 font-bold text-xs px-4 py-2.5 rounded-xl ${props.className ?? ""}`}
    >
      {children}
    </button>
  );
}

export function GhostButton({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-zinc-200 disabled:opacity-50 ${props.className ?? ""}`}
    >
      {children}
    </button>
  );
}

export function Modal({
  title,
  onClose,
  children,
  wide = false,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  wide?: boolean;
}) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4" role="dialog" aria-modal="true" aria-label={title}>
      <div
        className={`bg-slate-900 border border-white/15 rounded-3xl p-5 sm:p-7 w-full ${wide ? "max-w-4xl" : "max-w-2xl"} max-h-[92vh] overflow-y-auto shadow-2xl space-y-5`}
      >
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <h3 className="text-lg font-bold text-white">{title}</h3>
          <button type="button" onClick={onClose} className="text-zinc-400 hover:text-white" aria-label="Kapat">
            <X className="w-5 h-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function EmptyState({ icon: Icon, title, hint }: { icon: React.ElementType; title: string; hint?: string }) {
  return (
    <div className="p-10 rounded-2xl bg-slate-950/60 border border-white/10 text-center space-y-2">
      <Icon className="w-8 h-8 text-zinc-500 mx-auto" />
      <p className="text-sm text-zinc-300">{title}</p>
      {hint && <p className="text-xs text-zinc-500">{hint}</p>}
    </div>
  );
}

export function CrmErrorBanner() {
  const { error, clearError } = useCrm();
  if (!error) return null;
  return (
    <div role="alert" className="p-4 rounded-2xl bg-red-500/10 border border-red-500/40 text-sm text-red-300 flex items-start gap-2">
      <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
      <span className="flex-1">{error}</span>
      <button onClick={clearError} className="text-xs underline">
        Kapat
      </button>
    </div>
  );
}

export function formatDate(value?: string): string {
  if (!value) return "–";
  const date = value.length === 10 ? new Date(`${value}T12:00:00`) : new Date(value);
  return date.toLocaleDateString("tr-TR", { day: "2-digit", month: "short", year: "numeric" });
}

export function formatDateTime(value?: string): string {
  if (!value) return "–";
  return new Date(value).toLocaleString("tr-TR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export function todayKey(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}
