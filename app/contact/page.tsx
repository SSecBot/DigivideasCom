"use client";

import React, { useState } from "react";
import {
  Mail,
  Phone,
  MapPin,
  MessageCircle,
  Send,
  CheckCircle,
  Sparkles,
  ArrowRight,
  Clock,
} from "lucide-react";
import { useCMSStore } from "@/lib/store/cms-store";
import { MagneticButton } from "@/components/ui/MagneticButton";

export default function ContactPage() {
  const { submitInquiry } = useCMSStore();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    service: "Sosyal Medya Yönetimi",
    message: "",
  });

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      submitInquiry(formData);
      setLoading(false);
      setIsSubmitted(true);
    }, 600);
  };

  return (
    <div className="space-y-16 py-12 pb-24">
      {/* Page Header */}
      <section className="w-full max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-12">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-400 text-xs font-mono">
            <Mail className="w-3.5 h-3.5" />
            <span>İletişim & İzmir, Türkiye</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
            Bir Kahve Eşliğinde Markanızı Konuşalım
          </h1>

          <p className="text-base sm:text-lg text-zinc-300">
            İzmir ofisimizde ya da online toplantıyla dijital hedeflerinizi değerlendirelim.
          </p>
        </div>
      </section>

      {/* Main Grid: Form + Office Channels */}
      <section className="w-full max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left Column: Interactive Contact Form */}
          <div className="lg:col-span-7 bg-slate-900/80 border border-white/10 rounded-3xl p-6 sm:p-10 shadow-2xl relative">
            {isSubmitted ? (
              <div className="py-16 text-center space-y-6 animate-fadeIn">
                <div className="w-20 h-20 rounded-3xl bg-brand-500/20 border border-brand-500/40 text-brand-400 mx-auto flex items-center justify-center shadow-lg">
                  <CheckCircle className="w-10 h-10" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-white">Talebiniz Alındı!</h3>
                  <p className="text-sm text-zinc-300 max-w-md mx-auto leading-relaxed">
                    Teşekkür ederiz, <strong className="text-brand-400">{formData.name}</strong>. Uzman ekibimiz 24 saat içinde sizinle iletişime geçecektir.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setIsSubmitted(false);
                    setFormData({
                      name: "",
                      email: "",
                      phone: "",
                      company: "",
                      service: "Sosyal Medya Yönetimi",
                      message: "",
                    });
                  }}
                  className="bg-white/10 hover:bg-white/20 text-white text-xs font-semibold px-6 py-2.5 rounded-xl transition-all"
                >
                  Yeni Mesaj Gönder
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-mono font-medium text-zinc-300">
                      Adınız Soyadınız *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Örn: Ahmet Yılmaz"
                      className="w-full bg-slate-950 border border-white/10 focus:border-brand-500 rounded-xl px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none transition-colors"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-mono font-medium text-zinc-300">
                      E-posta Adresiniz *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="ahmet@sirketiniz.com"
                      className="w-full bg-slate-950 border border-white/10 focus:border-brand-500 rounded-xl px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-mono font-medium text-zinc-300">
                      Telefon Numaranız *
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="0549 211 55 61"
                      className="w-full bg-slate-950 border border-white/10 focus:border-brand-500 rounded-xl px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none transition-colors"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-mono font-medium text-zinc-300">
                      Firma / Marka Adı
                    </label>
                    <input
                      type="text"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      placeholder="Marka Adı"
                      className="w-full bg-slate-950 border border-white/10 focus:border-brand-500 rounded-xl px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-mono font-medium text-zinc-300">
                    İlgilendiğiniz Ana Hizmet *
                  </label>
                  <select
                    value={formData.service}
                    onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 focus:border-brand-500 rounded-xl px-4 py-3 text-sm text-white focus:outline-none transition-colors"
                  >
                    <option value="Sosyal Medya Yönetimi">Sosyal Medya Yönetimi</option>
                    <option value="Performans Pazarlaması (Meta & Google Ads)">
                      Performans Pazarlaması (Meta & Google Ads)
                    </option>
                    <option value="Web Tasarım & UI/UX">Web Tasarım & UI/UX</option>
                    <option value="Kreatif Prodüksiyon & Video">Kreatif Prodüksiyon & Video</option>
                    <option value="SEO & İçerik Stratejisi">SEO & İçerik Stratejisi</option>
                    <option value="Marka Kimliği & Strateji">Marka Kimliği & Strateji</option>
                    <option value="Bütünsel 360° Dijital Ajans Paketi">
                      Bütünsel 360° Dijital Ajans Paketi
                    </option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-mono font-medium text-zinc-300">
                    Proje Özeti & Beklentileriniz *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Hedeflerinizden, mevcut dijital varlığınızdan ve bütçe planınızdan bahsedin..."
                    className="w-full bg-slate-950 border border-white/10 focus:border-brand-500 rounded-xl px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-slate-950 font-bold py-4 px-6 rounded-xl shadow-glow-orange transition-all flex items-center justify-center gap-2 text-sm sm:text-base active:scale-98"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Teklif Talebini Gönder</span>
                      <Send className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Right Column: Direct Channels & Torbalı Office */}
          <div className="lg:col-span-5 space-y-6">
            {/* WhatsApp Fast Track (+905492115561) */}
            <div className="p-6 sm:p-8 rounded-3xl bg-brand-500/10 border border-brand-500/30 space-y-4 shadow-glow-orange">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-brand-500 flex items-center justify-center text-slate-950">
                  <MessageCircle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Anında WhatsApp İletişimi</h3>
                  <p className="text-xs text-brand-400 font-mono">+90 549 211 55 61</p>
                </div>
              </div>

              <p className="text-xs text-zinc-300 leading-relaxed">
                Hızlı bilgi almak, portföy istemek ya da anlık sorularınız için direkt WhatsApp üzerinden yazışabilirsiniz.
              </p>

              <a
                href="https://wa.me/905492115561?text=Merhaba,%20Digivideas%20dijital%20reklam%20hizmetleri%20hakk%C4%B1nda%20g%C3%B6r%C3%BC%C5%9Fmek%20istiyorum."
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-brand-500 hover:bg-brand-600 text-slate-950 font-bold py-3.5 px-4 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 transition-all block text-center shadow-glow-orange"
              >
                <span>WhatsApp ile Mesaj Gönder</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>

            {/* Headquarters Card: İzmir, Türkiye */}
            <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-white/10 space-y-5">
              <h3 className="text-lg font-bold text-white">İzmir Merkez Ofisi</h3>

              <div className="space-y-4 text-sm text-zinc-300">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-brand-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-white">Digivideas Dijital Medya</p>
                    <p className="text-xs text-zinc-400">İzmir, Türkiye</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-brand-400 flex-shrink-0" />
                  <a href="mailto:info@digivideas.com" className="hover:text-brand-400 transition-colors">
                    info@digivideas.com
                  </a>
                </div>

                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-brand-400 flex-shrink-0" />
                  <a href="tel:+905492115561" className="hover:text-brand-400 transition-colors">
                    +90 549 211 55 61
                  </a>
                </div>

                <div className="flex items-center gap-3 pt-2 border-t border-white/10 text-xs text-zinc-400 font-mono">
                  <Clock className="w-4 h-4 text-brand-400 flex-shrink-0" />
                  <span>Pzt - Cuma: 09:00 - 18:30</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
