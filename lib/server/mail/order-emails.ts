import { Order } from "@/lib/orders/types";
import { orderTotals } from "@/lib/orders/calc";

/** HTML + plain-text e-mails for the payment-link flow. All dynamic values are HTML-escaped. */

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char] as string);
}

const formatTL = (value: number) => new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(value);
const formatDate = (iso?: string) =>
  iso ? new Date(iso).toLocaleString("tr-TR", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "";

function layout(title: string, body: string, siteUrl: string, companyName: string): string {
  return `<!doctype html><html lang="tr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${escapeHtml(title)}</title></head>
<body style="margin:0;background:#f4f4f5;font-family:Arial,Helvetica,sans-serif;color:#18181b">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:24px 12px"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden">
<tr><td style="background:#1F1F1F;padding:20px 28px"><img src="${siteUrl}/assets/logo.png" alt="digivideas" height="36" style="display:block;height:36px"></td></tr>
<tr><td style="padding:28px">${body}</td></tr>
<tr><td style="padding:18px 28px;background:#fafafa;font-size:12px;color:#71717a;border-top:1px solid #e4e4e7">
${escapeHtml(companyName)} · <a href="${siteUrl}" style="color:#ea580c">${escapeHtml(siteUrl.replace(/^https?:\/\//, ""))}</a><br>
Ödemeler iyzico güvencesiyle alınır; kart bilgileriniz bizimle paylaşılmaz.
</td></tr></table></td></tr></table></body></html>`;
}

function itemsTable(order: Order): string {
  const rows = order.items
    .map(
      (item) => `<tr><td style="padding:8px 0;border-bottom:1px solid #f4f4f5">${escapeHtml(item.name)}${
        item.description ? `<br><span style="font-size:12px;color:#71717a">${escapeHtml(item.description)}</span>` : ""
      }</td><td align="right" style="padding:8px 0;border-bottom:1px solid #f4f4f5;white-space:nowrap">${item.quantity} × ${formatTL(item.unitPrice)}</td></tr>`
    )
    .join("");
  const totals = orderTotals(order.items, order.vatRate);
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px">${rows}
<tr><td style="padding:8px 0;color:#71717a">KDV (%${order.vatRate})</td><td align="right" style="padding:8px 0;color:#71717a">${formatTL(totals.vat)}</td></tr>
<tr><td style="padding:8px 0;font-weight:bold">Toplam</td><td align="right" style="padding:8px 0;font-weight:bold;font-size:16px">${formatTL(totals.total)}</td></tr></table>`;
}

export function paymentLinkEmail(order: Order, paymentUrl: string, siteUrl: string, companyName: string) {
  const total = formatTL(orderTotals(order.items, order.vatRate).total);
  const subject = `${order.number} – Ödeme bağlantınız (${total})`;
  const html = layout(
    subject,
    `<p style="margin:0 0 12px;font-size:16px">Merhaba ${escapeHtml(order.customer.fullName)},</p>
<p style="margin:0 0 18px;font-size:14px;line-height:1.6"><strong>${escapeHtml(order.title)}</strong> için ödeme bağlantınız hazır. Aşağıdaki düğmeyle güvenli ödeme sayfasına geçebilirsiniz.</p>
${order.note ? `<p style="margin:0 0 18px;font-size:14px;line-height:1.6;color:#3f3f46">${escapeHtml(order.note).replace(/\n/g, "<br>")}</p>` : ""}
${itemsTable(order)}
<p style="margin:24px 0" align="center"><a href="${paymentUrl}" style="display:inline-block;background:#F97316;color:#0f172a;font-weight:bold;text-decoration:none;padding:14px 28px;border-radius:12px">Güvenli ödeme sayfasına git</a></p>
<p style="margin:0;font-size:12px;color:#71717a;line-height:1.6">Bağlantı size özeldir, lütfen paylaşmayın.${
      order.linkExpiresAt ? ` Son geçerlilik: ${escapeHtml(formatDate(order.linkExpiresAt))}.` : ""
    }<br>Düğme çalışmazsa bu adresi tarayıcınıza yapıştırın:<br><span style="word-break:break-all">${escapeHtml(paymentUrl)}</span></p>`,
    siteUrl,
    companyName
  );
  const text = `Merhaba ${order.customer.fullName},\n\n${order.title} için ödeme bağlantınız: ${paymentUrl}\n\nToplam: ${total}\nSipariş no: ${order.number}\n${
    order.linkExpiresAt ? `Son geçerlilik: ${formatDate(order.linkExpiresAt)}\n` : ""
  }\n${companyName}`;
  return { subject, html, text };
}

export function paymentReceiptEmail(order: Order, siteUrl: string, companyName: string) {
  const total = formatTL(orderTotals(order.items, order.vatRate).total);
  const subject = `${order.number} – Ödemeniz alındı`;
  const html = layout(
    subject,
    `<p style="margin:0 0 12px;font-size:16px">Teşekkürler ${escapeHtml(order.customer.fullName)},</p>
<p style="margin:0 0 18px;font-size:14px;line-height:1.6"><strong>${total}</strong> tutarındaki ödemeniz başarıyla alındı. Hizmetiniz en geç 3 iş günü içinde başlatılacaktır.</p>
${itemsTable(order)}
<p style="margin:18px 0 0;font-size:12px;color:#71717a">Sipariş no: ${escapeHtml(order.number)} · iyzico işlem no: ${escapeHtml(order.iyzico.paymentId || "-")} · ${escapeHtml(formatDate(order.paidAt))}</p>`,
    siteUrl,
    companyName
  );
  const text = `Teşekkürler ${order.customer.fullName},\n\n${total} tutarındaki ödemeniz alındı.\nSipariş no: ${order.number}\niyzico işlem no: ${order.iyzico.paymentId || "-"}\n\n${companyName}`;
  return { subject, html, text };
}

export function adminPaidNotification(order: Order, adminUrl: string) {
  const total = formatTL(orderTotals(order.items, order.vatRate).total);
  const subject = `Ödeme alındı: ${order.number} – ${order.customer.fullName} (${total})`;
  const text = `${order.customer.fullName} (${order.customer.email}, ${order.customer.phone}) ${total} ödedi.\nSipariş: ${order.number} – ${order.title}\niyzico işlem no: ${
    order.iyzico.paymentId || "-"
  }\nTaksit: ${order.iyzico.installment || 1}\nPanel: ${adminUrl}`;
  const html = `<pre style="font-family:Arial,Helvetica,sans-serif;font-size:14px">${escapeHtml(text)}</pre>`;
  return { subject, html, text };
}
