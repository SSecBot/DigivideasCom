/**
 * Renders schema.org JSON-LD. `<` is escaped so CMS text can never close the
 * script tag (prevents stored XSS through structured data).
 */
export function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}
