"use client";

import React from "react";
import Link from "next/link";
import {
  Instagram,
  Facebook,
  Linkedin,
  Mail,
  Phone,
  MapPin,
  MessageCircle,
} from "lucide-react";
import { useCMSStore } from "@/lib/store/cms-store";
import { safeHref, toWhatsAppDigits } from "@/lib/utils/sanitize";

export function Footer() {
  const { narrative, services } = useCMSStore();

  const facebookLink = safeHref(narrative.facebookUrl, "https://facebook.com/digivideas");
  const instagramLink = safeHref(narrative.instagramUrl, "https://instagram.com/digivideas");
  const linkedinLink = safeHref(narrative.linkedinUrl, "https://linkedin.com/company/digivideas");
  const rawPhone = toWhatsAppDigits(narrative.whatsappNumber);

  return (
    <footer className="relative bg-slate-950 border-t border-white/10 pt-12 sm:pt-16 pb-24 sm:pb-12 overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[250px] bg-brand-500/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-12 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 sm:gap-10 pb-12 border-b border-white/10">
          {/* Col 1 & 2: Brand & Narrative */}
          <div className="sm:col-span-2 space-y-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-2xl font-bold tracking-tighter"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/assets/logo.png" alt="digivideas dijital reklam ajansı logosu" width={150} height={47} className="w-[150px] h-auto" loading="lazy" />
            </Link>

            <p className="text-sm text-zinc-400 leading-relaxed max-w-sm">
              {narrative.slogan || "Teknoloji ve yaratıcılığı harmanlayarak, markanızın dijital platformlarda öne çıkmasını sağlıyoruz. İhtiyaçlarınıza özel çözümlerle, markanızın dijital yolculuğunu başarıyla yönetiyoruz."}
            </p>

            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-xs text-zinc-400 font-mono leading-relaxed">
              <span className="text-brand-400 font-semibold">Etimoloji:</span>{" "}
              <span className="text-white">digi</span> (dijital) +{" "}
              <span className="text-brand-400 font-bold">ivi</span> (Lazca: iz bırakmak, izi kalmak) +{" "}
              <span className="text-white">ideas</span> (fikirler).
            </div>

            {/* Social Icons */}
            <div className="flex items-center gap-3 pt-2">
              <a
                href={facebookLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-xl bg-white/5 hover:bg-brand-500/20 border border-white/10 hover:border-brand-500 text-zinc-400 hover:text-brand-400 flex items-center justify-center transition-all"
                aria-label="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href={instagramLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-xl bg-white/5 hover:bg-brand-500/20 border border-white/10 hover:border-brand-500 text-zinc-400 hover:text-brand-400 flex items-center justify-center transition-all"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href={linkedinLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-xl bg-white/5 hover:bg-brand-500/20 border border-white/10 hover:border-brand-500 text-zinc-400 hover:text-brand-400 flex items-center justify-center transition-all"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Col 3: Hızlı Bağlantılar */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
              Sayfalar
            </h4>
            <ul className="space-y-2 text-sm text-zinc-400">
              <li>
                <Link href="/" className="hover:text-brand-400 transition-colors">
                  Ana Sayfa
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-brand-400 transition-colors">
                  Hakkımızda
                </Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-brand-400 transition-colors">
                  Hizmetlerimiz
                </Link>
              </li>
              <li>
                <Link href="/customers" className="hover:text-brand-400 transition-colors">
                  Müşterilerimiz & Portföy
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-brand-400 transition-colors">
                  Sıkça Sorulan Sorular (SSS)
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-brand-400 transition-colors">
                  Blog & Trendler
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-brand-400 transition-colors">
                  İletişim
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Hizmetlerimiz (live from the CMS) */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
              Uzmanlıklarımız
            </h4>
            <ul className="space-y-2 text-sm text-zinc-400">
              {services.slice(0, 8).map((service) => (
                <li key={service.id}>
                  <Link href={`/services/${service.slug}`} className="hover:text-brand-400 transition-colors">
                    {service.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 5: İletişim & Lokasyon (Strictly Torbalı, İzmir in Footer - Zero Admin Links) */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
              İletişim & Lokasyon
            </h4>
            <div className="space-y-2.5 text-sm text-zinc-400">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-brand-400 flex-shrink-0 mt-0.5" />
                <span>{narrative.footerLocation || "İzmir, Torbalı, Türkiye"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-brand-400 flex-shrink-0" />
                <a href="mailto:info@digivideas.com" className="hover:text-brand-400 transition-colors">
                  info@digivideas.com
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-brand-400 flex-shrink-0" />
                <a href="tel:+905492115561" className="hover:text-brand-400 transition-colors">
                  +90 549 211 55 61
                </a>
              </div>
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-brand-400 flex-shrink-0" />
                <a
                  href={`https://wa.me/${rawPhone}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-400 hover:underline"
                >
                  WhatsApp: +90 549 211 55 61
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-500 gap-4 text-center sm:text-left">
          <p>© {new Date().getFullYear()} digivideas. Tüm hakları saklıdır. İzmir, Torbalı, Türkiye.</p>
          <div className="flex items-center gap-6">
            <Link href="/kvkk" className="hover:text-zinc-300 transition-colors">
              Gizlilik Politikası
            </Link>
            <Link href="/kvkk" className="hover:text-zinc-300 transition-colors">
              KVKK Aydınlatma
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
