import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft, Compass } from "lucide-react";

export const metadata: Metadata = {
  title: "Sayfa bulunamadı",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 py-16 text-center space-y-6">
      <div className="w-16 h-16 rounded-2xl bg-brand-500/10 border border-brand-500/30 flex items-center justify-center text-brand-400">
        <Compass className="w-8 h-8" />
      </div>
      <div className="space-y-2 max-w-md">
        <p className="text-xs font-mono text-brand-400">404</p>
        <h1 className="text-2xl sm:text-3xl font-bold text-white">Aradığınız sayfa bulunamadı</h1>
        <p className="text-sm text-zinc-400">
          Sayfa taşınmış, yayından kaldırılmış ya da adres hatalı yazılmış olabilir.
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-slate-950 font-bold px-6 py-3 rounded-xl text-sm shadow-glow-orange"
        >
          <ArrowLeft className="w-4 h-4" />
          Ana sayfaya dön
        </Link>
        <Link href="/services" className="px-6 py-3 rounded-xl text-sm text-zinc-200 bg-white/5 hover:bg-white/10 border border-white/10">
          Hizmetlerimiz
        </Link>
      </div>
    </div>
  );
}
