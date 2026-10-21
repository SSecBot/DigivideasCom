"use client";

import React, { useEffect, useState } from "react";
import { CheckCircle2, ChevronDown, Loader2, Mail, Send } from "lucide-react";

interface MailSettingsView {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  fromName: string;
  fromEmail: string;
  notifyEmail: string;
  hasPassword: boolean;
  configured: boolean;
}

const inputClass =
  "w-full bg-slate-950 border border-white/15 focus:border-brand-500 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none";

const PRESETS: { label: string; host: string; port: number; secure: boolean }[] = [
  { label: "Gmail / Google Workspace", host: "smtp.gmail.com", port: 465, secure: true },
  { label: "Yandex", host: "smtp.yandex.com", port: 465, secure: true },
  { label: "Outlook / Microsoft 365", host: "smtp.office365.com", port: 587, secure: false },
  { label: "Hosting (cPanel) e-postası", host: "", port: 465, secure: true },
];

async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, { cache: "no-store", headers: { "Content-Type": "application/json" }, ...init });
  const body = (await response.json().catch(() => ({}))) as T & { error?: string };
  if (!response.ok) throw new Error(body.error || `İstek başarısız (${response.status})`);
  return body;
}

export function MailSettingsCard({ onChanged }: { onChanged: () => void }) {
  const [open, setOpen] = useState(false);
  const [settings, setSettings] = useState<MailSettingsView | null>(null);
  const [password, setPassword] = useState("");
  const [testTo, setTestTo] = useState("");
  const [busy, setBusy] = useState("");
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    api<MailSettingsView>("/api/admin/settings/mail")
      .then((data) => {
        setSettings(data);
        setOpen(!data.configured);
        setTestTo(data.notifyEmail || data.fromEmail);
      })
      .catch((e: Error) => setMessage({ ok: false, text: e.message }));
  }, []);

  if (!settings) return null;

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy("save");
    setMessage(null);
    try {
      const saved = await api<MailSettingsView>("/api/admin/settings/mail", { method: "PUT", body: JSON.stringify({ ...settings, password }) });
      setSettings(saved);
      setPassword("");
      setMessage({ ok: true, text: "E-posta ayarları kaydedildi. Bir test e-postası gönderip deneyin." });
      onChanged();
    } catch (e) {
      setMessage({ ok: false, text: (e as Error).message });
    } finally {
      setBusy("");
    }
  };

  const test = async () => {
    setBusy("test");
    setMessage(null);
    try {
      await api("/api/admin/settings/mail/test", { method: "POST", body: JSON.stringify({ to: testTo }) });
      setMessage({ ok: true, text: `Test e-postası ${testTo} adresine gönderildi.` });
    } catch (e) {
      setMessage({ ok: false, text: (e as Error).message });
    } finally {
      setBusy("");
    }
  };

  return (
    <section className="rounded-2xl bg-slate-900/70 border border-white/10">
      <button onClick={() => setOpen((v) => !v)} aria-expanded={open} className="w-full flex items-center justify-between gap-3 p-4 text-left">
        <span className="flex items-center gap-2 text-sm font-semibold text-white">
          <Mail className="w-4 h-4 text-brand-400" /> E-posta ayarları
          {settings.configured ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-300">
              <CheckCircle2 className="w-3.5 h-3.5" /> {settings.fromEmail}
            </span>
          ) : (
            <span className="text-[11px] font-mono text-amber-300">yapılmadı</span>
          )}
        </span>
        <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <form onSubmit={save} className="px-4 pb-4 space-y-4 border-t border-white/10 pt-4">
          <p className="text-xs text-zinc-400">
            Ödeme linkleri ve onay e-postaları bu hesaptan gönderilir. Gmail kullanıyorsanız normal şifre yerine Google hesabınızdan
            &ldquo;Uygulama şifresi&rdquo; oluşturun.
          </p>
          <div className="flex flex-wrap gap-1.5">
            {PRESETS.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => setSettings({ ...settings, host: preset.host || settings.host, port: preset.port, secure: preset.secure })}
                className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[11px] text-zinc-300"
              >
                {preset.label}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label htmlFor="smtp-from" className="block text-[11px] font-mono text-zinc-400">Gönderen e-posta *</label>
              <input id="smtp-from" type="email" required value={settings.fromEmail} onChange={(e) => setSettings({ ...settings, fromEmail: e.target.value })} className={inputClass} />
            </div>
            <div className="space-y-1">
              <label htmlFor="smtp-name" className="block text-[11px] font-mono text-zinc-400">Gönderen adı</label>
              <input id="smtp-name" value={settings.fromName} onChange={(e) => setSettings({ ...settings, fromName: e.target.value })} className={inputClass} />
            </div>
            <div className="space-y-1">
              <label htmlFor="smtp-host" className="block text-[11px] font-mono text-zinc-400">SMTP sunucusu *</label>
              <input id="smtp-host" required value={settings.host} onChange={(e) => setSettings({ ...settings, host: e.target.value })} placeholder="smtp.gmail.com" className={inputClass} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label htmlFor="smtp-port" className="block text-[11px] font-mono text-zinc-400">Port *</label>
                <input id="smtp-port" type="number" required value={settings.port} onChange={(e) => setSettings({ ...settings, port: Number(e.target.value) })} className={inputClass} />
              </div>
              <label className="flex items-end gap-2 pb-3 text-xs text-zinc-300 cursor-pointer">
                <input type="checkbox" checked={settings.secure} onChange={(e) => setSettings({ ...settings, secure: e.target.checked })} className="accent-orange-500 w-4 h-4" />
                SSL (465)
              </label>
            </div>
            <div className="space-y-1">
              <label htmlFor="smtp-user" className="block text-[11px] font-mono text-zinc-400">Kullanıcı adı</label>
              <input id="smtp-user" autoComplete="off" value={settings.user} onChange={(e) => setSettings({ ...settings, user: e.target.value })} placeholder="genelde e-posta adresi" className={inputClass} />
            </div>
            <div className="space-y-1">
              <label htmlFor="smtp-pass" className="block text-[11px] font-mono text-zinc-400">Şifre / uygulama şifresi</label>
              <input
                id="smtp-pass"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={settings.hasPassword ? "•••••••• (kayıtlı; değiştirmek için yazın)" : ""}
                className={inputClass}
              />
            </div>
            <div className="space-y-1 sm:col-span-2">
              <label htmlFor="smtp-notify" className="block text-[11px] font-mono text-zinc-400">&ldquo;Ödeme alındı&rdquo; bildirimlerinin gideceği adres</label>
              <input id="smtp-notify" type="email" value={settings.notifyEmail} onChange={(e) => setSettings({ ...settings, notifyEmail: e.target.value })} className={inputClass} />
            </div>
          </div>

          {message && <p role={message.ok ? "status" : "alert"} className={`text-xs ${message.ok ? "text-emerald-300" : "text-red-300"}`}>{message.text}</p>}

          <div className="flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
            <div className="flex gap-2">
              <input aria-label="Test e-postası alıcısı" value={testTo} onChange={(e) => setTestTo(e.target.value)} className={`${inputClass} sm:w-64`} />
              <button
                type="button"
                onClick={test}
                disabled={Boolean(busy) || !settings.configured}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-zinc-200 disabled:opacity-50 whitespace-nowrap"
              >
                {busy === "test" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />} Test gönder
              </button>
            </div>
            <button type="submit" disabled={Boolean(busy)} className="inline-flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-600 disabled:opacity-60 text-slate-950 font-bold text-xs px-4 py-2.5 rounded-xl">
              {busy === "save" && <Loader2 className="w-4 h-4 animate-spin" />} Kaydet
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
