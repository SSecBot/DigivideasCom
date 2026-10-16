import { BlogPost, CustomerItem, FAQItem, ServiceItem, SiteNarrative } from "@/lib/types/cms";
import { CONTACT, DEFAULT_DESCRIPTION, SITE_NAME, absoluteUrl, getSiteUrl, toMetaDescription } from "@/lib/seo/site";

/** schema.org JSON-LD builders. */

type JsonLd = Record<string, unknown>;

export function organizationSchema(narrative: SiteNarrative): JsonLd {
  const sameAs = [narrative.instagramUrl, narrative.facebookUrl, narrative.linkedinUrl].filter(Boolean);
  return {
    "@context": "https://schema.org",
    "@type": ["Organization", "ProfessionalService"],
    "@id": `${getSiteUrl()}/#organization`,
    name: SITE_NAME,
    alternateName: "digivideas Dijital Reklam Ajansı",
    url: getSiteUrl(),
    logo: absoluteUrl("/assets/logo.png"),
    image: absoluteUrl("/opengraph-image"),
    description: narrative.slogan || DEFAULT_DESCRIPTION,
    email: CONTACT.email,
    telephone: narrative.whatsappNumber || CONTACT.phone,
    address: {
      "@type": "PostalAddress",
      addressLocality: CONTACT.city,
      addressRegion: CONTACT.region,
      addressCountry: CONTACT.country,
    },
    areaServed: [{ "@type": "Country", name: "Türkiye" }],
    priceRange: "₺₺",
    openingHours: "Mo-Fr 09:00-18:30",
    sameAs,
  };
}

export function websiteSchema(): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${getSiteUrl()}/#website`,
    url: getSiteUrl(),
    name: SITE_NAME,
    inLanguage: "tr-TR",
    publisher: { "@id": `${getSiteUrl()}/#organization` },
  };
}

export function breadcrumbSchema(items: { name: string; path: string }[]): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function serviceSchema(service: ServiceItem): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.title,
    serviceType: service.category,
    description: toMetaDescription(service.metaDescription || service.shortDesc, 300),
    url: absoluteUrl(`/services/${service.slug}`),
    image: service.heroImage.startsWith("data:") ? undefined : absoluteUrl(service.heroImage),
    provider: { "@id": `${getSiteUrl()}/#organization` },
    areaServed: { "@type": "Country", name: "Türkiye" },
  };
}

export function servicesListSchema(services: ServiceItem[]): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: services.map((service, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: absoluteUrl(`/services/${service.slug}`),
      name: service.title,
    })),
  };
}

export function blogPostingSchema(post: BlogPost): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: toMetaDescription(post.metaDescription || post.excerpt, 300),
    image: post.coverImage.startsWith("data:") ? undefined : absoluteUrl(post.coverImage),
    datePublished: post.publishedAt,
    dateModified: post.publishedAt,
    inLanguage: "tr-TR",
    keywords: post.tags.join(", "),
    articleSection: post.category,
    author: { "@type": "Person", name: post.author.name, jobTitle: post.author.role },
    publisher: { "@id": `${getSiteUrl()}/#organization` },
    mainEntityOfPage: absoluteUrl(`/blog/${post.slug}`),
  };
}

export function caseStudySchema(customer: CustomerItem): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: customer.metaTitle || `${customer.name} Vaka Analizi`,
    description: toMetaDescription(customer.metaDescription || customer.summary, 300),
    image: customer.heroImage.startsWith("data:") ? undefined : absoluteUrl(customer.heroImage),
    dateModified: customer.updatedAt,
    about: { "@type": "Organization", name: customer.name },
    author: { "@id": `${getSiteUrl()}/#organization` },
    publisher: { "@id": `${getSiteUrl()}/#organization` },
    mainEntityOfPage: absoluteUrl(`/customers/${customer.slug}`),
  };
}

export function faqSchema(faqs: FAQItem[]): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };
}
