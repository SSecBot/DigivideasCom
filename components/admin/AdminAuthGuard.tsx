"use client";

import React, { useState, useEffect } from "react";
import { Lock, KeyRound, AlertCircle, ShieldCheck, ArrowRight, Eye, EyeOff } from "lucide-react";
import {
  checkAdminPasscode,
  setAdminSession,
  getAdminSession,
} from "@/lib/auth/admin-auth";

interface AdminAuthGuardProps {
  children: React.ReactNode;
}

export function AdminAuthGuard({ children }: AdminAuthGuardProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [passcode, setPasscode] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shake, setShake] = useState(false);

  useEffect(() => {
    const session = getAdminSession();
    setIsAuthenticated(session.isAuthenticated);

    const handleAuthChange = () => {
      const updated = getAdminSession();
      setIsAuthenticated(updated.isAuthenticated);
    };

    window.addEventListener("digivideas_auth_changed", handleAuthChange);
    return () => window.removeEventListener("digivideas_auth_changed", handleAuthChange);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setIsSubmitting(true);

    setTimeout(() => {
      if (checkAdminPasscode(passcode)) {
        setAdminSession();
        setIsAuthenticated(true);
      } else {
        setErrorMsg("Geçersiz Yönetici Şifresi");
        setShake(true);
        setTimeout(() => setShake(false), 500);
      }
      setIsSubmitting(false);
    }, 300);
  };

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-mono text-zinc-400">Yetkilendirme kontrol ediliyor...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-brand-500/15 blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[300px] h-[300px] bg-amber-500/10 blur-[100px] rounded-full pointer-events-none" />

      {/* Auth Card Container */}
      <div
        className={`w-full max-w-md bg-slate-900/90 border border-white/10 rounded-3xl p-8 shadow-2xl backdrop-blur-2xl relative z-10 transition-transform ${shake ? "animate-bounce" : ""
          }`}
      >
        {/* Top Header Badge */}
        <div className="flex flex-col items-center text-center space-y-3 pb-6 border-b border-white/10">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-600 to-amber-400 p-0.5 shadow-glow-orange flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Lock className="w-7 h-7 text-brand-500" />
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              digi<span className="text-brand-500">ivi</span>deas CMS
            </h2>
            <p className="text-xs font-mono text-zinc-400 mt-1">
              Yönetici Kimlik Doğrulama Paneli
            </p>
          </div>
        </div>

        {/* Error Badge */}
        {errorMsg && (
          <div className="mt-6 p-3.5 rounded-xl bg-brand-500/15 border border-brand-500/40 text-brand-400 text-xs font-medium flex items-center gap-2 animate-fadeIn">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Password Form */}
        <form onSubmit={handleLogin} className="mt-6 space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-mono font-medium text-zinc-300">
              Yönetici Güvenlik Şifresi
            </label>
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400">
                <KeyRound className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                value={passcode}
                onChange={(e) => {
                  setPasscode(e.target.value);
                  if (errorMsg) setErrorMsg("");
                }}
                placeholder="Şifrenizi girin..."
                className="w-full bg-slate-950/80 border border-white/15 focus:border-brand-500 rounded-xl pl-10 pr-10 py-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-brand-500/30 transition-all font-mono"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !passcode.trim()}
            className="w-full bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-slate-950 font-bold py-3.5 px-4 rounded-xl shadow-glow-orange transition-all flex items-center justify-center gap-2 active:scale-98"
          >
            {isSubmitting ? (
              <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>Yönetim Paneline Giriş Yap</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
