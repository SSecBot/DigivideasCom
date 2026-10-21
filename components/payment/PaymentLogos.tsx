/* eslint-disable @next/next/no-img-element */

/**
 * Official iyzico logo band (from iyzico's WooCommerce plugin): card schemes
 * (Mastercard, Visa, American Express, Troy) and "iyzico ile Öde". The logos are
 * dark-on-transparent, so they sit on a white strip to stay legible on the dark theme.
 */
export function PaymentLogos({ compact = false, className = "" }: { compact?: boolean; className?: string }) {
  return (
    <div
      className={`inline-flex flex-wrap items-center justify-center gap-x-5 gap-y-2 rounded-2xl bg-white px-4 ${compact ? "py-2" : "py-3"} ${className}`}
      aria-label="Güvenli ödeme: Mastercard, Visa, American Express, Troy, iyzico ile Öde"
    >
      <img
        src="/assets/payment/iyzico-ile-ode.png"
        alt="iyzico ile Öde"
        width={240}
        height={78}
        loading="lazy"
        className={compact ? "h-6 w-auto" : "h-8 w-auto"}
      />
      <span className="hidden sm:block w-px self-stretch bg-zinc-200" aria-hidden="true" />
      <img
        src="/assets/payment/kart-logolari.png"
        alt="Mastercard, Visa, American Express, Troy"
        width={600}
        height={64}
        loading="lazy"
        className={compact ? "h-5 w-auto" : "h-6 sm:h-7 w-auto"}
      />
    </div>
  );
}
