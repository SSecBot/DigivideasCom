import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, CheckCircle2, Clock, ShieldCheck, XCircle } from "lucide-react";
import { orderRepository } from "@/lib/server/repositories/order-repository";
import { hashToken } from "@/lib/server/security/secret-box";
import { renderDistanceSalesContract } from "@/lib/server/orders/order-service";
import { contentRepository } from "@/lib/server/repositories/content-repository";
import { iyzicoStatus } from "@/lib/server/payments/iyzico";
import { canBePaid, isLinkExpired, orderTotals } from "@/lib/orders/calc";
import { CheckoutForm } from "@/components/payment/CheckoutForm";
import { PaymentLogos } from "@/components/payment/PaymentLogos";

/**
 * Private payment page, reached only through the hashed link e-mailed to the customer.
 * The token in the URL is never stored; only its SHA-256 hash is looked up.
 */

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Güvenli Ödeme",
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
  referrer: "no-referrer",
};

const formatTL = (value: number) => new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(value);

function StatusCard({ icon: Icon, tone, title, children }: { icon: React.ElementType; tone: string; title: string; children: React.ReactNode }) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full text-center space-y-4 p-8 rounded-3xl bg-slate-900/80 border border-white/10">
        <Icon className={`w-12 h-12 mx-auto ${tone}`} />
        <h1 className="text-2xl font-bold text-white">{title}</h1>
        <div className="text-sm text-zinc-300 space-y-2">{children}</div>
      </div>
    </div>
  );
}

export default async function PaymentPage({ params, searchParams }: { params: { token: string }; searchParams: { sonuc?: string } }) {
  const valid = /^[A-Za-z0-9_-]{40,64}$/.test(params.token);
  const order = valid ? await orderRepository.findByTokenHash(hashToken(params.token)) : null;
  const { narrative } = await contentRepository.getAll();
  const contact = narrative.companyEmail || "info@digivideas.com";

  if (!order || order.status === "iptal") {
    return (
      <StatusCard icon={XCircle} tone="text-zinc-400" title="Ödeme bağlantısı geçersiz">
        <p>Bu bağlantı geçerli değil veya iptal edilmiş. Yeni bir ödeme bağlantısı için bizimle iletişime geçin: {contact}</p>
      </StatusCard>
    );
  }

  const totals = orderTotals(order.items, order.vatRate);

  if (order.status === "odendi") {
    return (
      <StatusCard icon={CheckCircle2} tone="text-emerald-400" title="Ödemeniz alındı">
        <p>
          <strong className="text-white">{formatTL(totals.total)}</strong> tutarındaki ödemeniz {order.paidAt ? new Date(order.paidAt).toLocaleString("tr-TR") : ""} tarihinde alındı.
        </p>
        <p className="text-zinc-400">Sipariş no: {order.number} · iyzico işlem no: {order.iyzico.paymentId}</p>
        <p className="text-zinc-400">
          {order.emailLog.some((entry) => entry.kind === "odeme_onayi" && entry.ok)
            ? `Onay e-postası ${order.customer.email} adresine gönderildi. Teşekkür ederiz!`
            : "Teşekkür ederiz! Bu sayfayı ödeme belgeniz olarak saklayabilirsiniz."}
        </p>
      </StatusCard>
    );
  }

  if (isLinkExpired(order)) {
    return (
      <StatusCard icon={Clock} tone="text-amber-300" title="Bağlantının süresi doldu">
        <p>Güvenliğiniz için ödeme bağlantıları süreli gönderilir. Yeni bağlantı için bizimle iletişime geçin: {contact}</p>
      </StatusCard>
    );
  }

  const payable = canBePaid(order);
  const iyzico = iyzicoStatus();
  const contract = await renderDistanceSalesContract(order);
  const outcome = searchParams.sonuc;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14 pb-24 space-y-6">
      <header className="space-y-2">
        <p className="inline-flex items-center gap-2 text-xs font-mono text-emerald-300">
          <ShieldCheck className="w-4 h-4" /> Güvenli ödeme · {order.number}
        </p>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">{order.title}</h1>
        <p className="text-sm text-zinc-400">Sayın {order.customer.fullName}, ödemenizi aşağıdan güvenle tamamlayabilirsiniz.</p>
      </header>

      {outcome === "hata" && (
        <div role="alert" className="p-4 rounded-2xl bg-red-500/10 border border-red-500/40 text-sm text-red-200 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>Ödeme tamamlanamadı{order.iyzico.lastError ? `: ${order.iyzico.lastError}` : ""}. Kartınızdan çekim yapılmadı; tekrar deneyebilirsiniz.</span>
        </div>
      )}
      {outcome === "kontrol" && (
        <div role="alert" className="p-4 rounded-2xl bg-amber-400/10 border border-amber-400/40 text-sm text-amber-100">
          Ödeme sonucu şu an doğrulanamadı. Kartınızdan çekim yapıldıysa sizi bilgilendireceğiz; tekrar denemeden önce lütfen {contact} ile iletişime geçin.
        </div>
      )}

      <section className="p-5 sm:p-6 rounded-3xl bg-slate-900/80 border border-white/10 space-y-3">
        <h2 className="text-sm font-mono font-bold text-brand-400 uppercase tracking-wider">Sipariş özeti</h2>
        <ul className="divide-y divide-white/5">
          {order.items.map((item) => (
            <li key={item.id} className="py-3 flex items-start justify-between gap-4 text-sm">
              <div className="min-w-0">
                <p className="text-white font-medium">{item.name}</p>
                {item.description && <p className="text-xs text-zinc-400 mt-0.5">{item.description}</p>}
              </div>
              <p className="text-zinc-200 font-mono whitespace-nowrap">
                {item.quantity} × {formatTL(item.unitPrice)}
              </p>
            </li>
          ))}
        </ul>
        <dl className="pt-2 border-t border-white/10 text-sm space-y-1">
          <div className="flex justify-between text-zinc-400"><dt>Ara toplam</dt><dd className="font-mono">{formatTL(totals.subtotal)}</dd></div>
          <div className="flex justify-between text-zinc-400"><dt>KDV (%{order.vatRate})</dt><dd className="font-mono">{formatTL(totals.vat)}</dd></div>
          <div className="flex justify-between text-white text-lg font-bold pt-1"><dt>Ödenecek tutar</dt><dd className="font-mono">{formatTL(totals.total)}</dd></div>
        </dl>
        {order.note && <p className="text-sm text-zinc-300 whitespace-pre-line pt-2 border-t border-white/10">{order.note}</p>}
        {order.linkExpiresAt && (
          <p className="text-[11px] font-mono text-zinc-500">Bu bağlantı {new Date(order.linkExpiresAt).toLocaleString("tr-TR")} tarihine kadar geçerlidir.</p>
        )}
      </section>

      <section className="p-5 sm:p-6 rounded-3xl bg-slate-900/80 border border-white/10 space-y-4">
        <h2 className="text-sm font-mono font-bold text-brand-400 uppercase tracking-wider">Fatura bilgileri</h2>
        {payable && iyzico.configured ? (
          <CheckoutForm
            token={params.token}
            defaults={{ fullName: order.customer.fullName, phone: order.customer.phone, email: order.customer.email }}
            contract={contract}
            totalLabel={formatTL(totals.total)}
          />
        ) : (
          <p className="text-sm text-amber-200">Online ödeme şu an kullanılamıyor. Lütfen {contact} ile iletişime geçin.</p>
        )}
      </section>

      <div className="flex flex-col items-center gap-3">
        <PaymentLogos />
        <nav className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-zinc-500">
          <Link href="/mesafeli-satis-sozlesmesi" className="hover:text-zinc-300">Mesafeli Satış Sözleşmesi</Link>
          <Link href="/teslimat-ve-iade" className="hover:text-zinc-300">Teslimat ve İade</Link>
          <Link href="/gizlilik-sozlesmesi" className="hover:text-zinc-300">Gizlilik Sözleşmesi</Link>
        </nav>
      </div>
    </div>
  );
}
