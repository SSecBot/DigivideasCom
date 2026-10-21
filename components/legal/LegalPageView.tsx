import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/JsonLd";
import { MarkdownRenderer } from "@/components/ui/MarkdownRenderer";
import { PaymentLogos } from "@/components/payment/PaymentLogos";
import { contentRepository } from "@/lib/server/repositories/content-repository";
import { LEGAL_PAGE_PATHS, companyVariables, renderTemplate } from "@/lib/legal/templates";
import { breadcrumbSchema } from "@/lib/seo/structured-data";
import { buildMetadata, getSiteUrl } from "@/lib/seo/site";
import { LegalPageSlug } from "@/lib/types/cms";

const DESCRIPTIONS: Record<LegalPageSlug, string> = {
  "teslimat-ve-iade": "digivideas hizmetlerinin teslimat süreleri, iptal, cayma ve iade koşulları.",
  "gizlilik-sozlesmesi": "digivideas gizlilik sözleşmesi: kişisel verilerin ve ödeme bilgilerinin nasıl korunduğu.",
  "mesafeli-satis-sozlesmesi": "digivideas üzerinden satın alınan hizmetlere ilişkin mesafeli satış sözleşmesi.",
};

export async function legalMetadata(slug: LegalPageSlug): Promise<Metadata> {
  const { legalPages } = await contentRepository.getPublished();
  const page = legalPages.find((item) => item.slug === slug);
  return buildMetadata({ title: page?.title ?? "Yasal Bilgilendirme", description: DESCRIPTIONS[slug], path: LEGAL_PAGE_PATHS[slug] });
}

export async function LegalPageView({ slug }: { slug: LegalPageSlug }) {
  const { legalPages, narrative } = await contentRepository.getPublished();
  const page = legalPages.find((item) => item.slug === slug);
  if (!page) notFound();
  const content = renderTemplate(page.content, companyVariables(narrative, getSiteUrl()));

  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: "Ana Sayfa", path: "/" },
          { name: page.title, path: LEGAL_PAGE_PATHS[slug] },
        ])}
      />
      <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-24 space-y-8">
        <header className="space-y-3">
          <p className="text-xs font-mono text-brand-400">Yasal bilgilendirme</p>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">{page.title}</h1>
          <p className="text-xs text-zinc-500 font-mono">
            Son güncelleme: {new Date(page.updatedAt).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })}
          </p>
        </header>
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/70 border border-white/10">
          <MarkdownRenderer content={content} />
        </div>
        <PaymentLogos />
      </article>
    </>
  );
}
