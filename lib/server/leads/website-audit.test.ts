import { describe, expect, it } from "vitest";
import { AuditBlockedError, analyzeHtml, extractEmails, validateAuditUrl } from "@/lib/server/leads/website-audit";

const SAMPLE_HTML = `<!doctype html><html><head>
<title>Kahve Durağı | Torbalı</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="description" content="Torbalı'nın en sevilen kafesi">
<script async src="https://www.googletagmanager.com/gtag/js?id=G-ABC123"></script>
<script>!function(f,b,e,v,n,t,s){}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js'); fbq('init', '123');</script>
</head><body>
<a href="https://www.instagram.com/kahvedura.gi/">Instagram</a>
<a href="https://www.facebook.com/sharer/sharer.php?u=x">Paylaş</a>
<a href="https://www.tiktok.com/@kahveduragi">TikTok</a>
<a href="https://wa.me/905321112233">WhatsApp</a>
</body></html>`;

describe("analyzeHtml", () => {
  it("detects socials, pixels, analytics and viewport (Happy Path)", () => {
    // 1. Arrange
    const html = SAMPLE_HTML;

    // 2. Act
    const result = analyzeHtml(html);

    // 3. Assert
    expect(result.title).toBe("Kahve Durağı | Torbalı");
    expect(result.metaDescription).toBe("Torbalı'nın en sevilen kafesi");
    expect(result.hasViewport).toBe(true);
    expect(result.hasMetaPixel).toBe(true);
    expect(result.hasGoogleAnalytics).toBe(true);
    expect(result.hasWhatsAppLink).toBe(true);
    expect(result.socials.instagram).toBe("https://www.instagram.com/kahvedura.gi");
    expect(result.socials.tiktok).toBe("https://www.tiktok.com/@kahveduragi");
  });

  it("ignores share buttons and post links that are not profiles (Edge Case 1)", () => {
    // 1. Arrange
    const html = `<a href="https://www.facebook.com/sharer/sharer.php?u=1"></a><a href="https://www.instagram.com/p/Cxyz/"></a>`;

    // 2. Act
    const result = analyzeHtml(html);

    // 3. Assert
    expect(result.socials).toEqual({});
  });

  it("handles an empty page without throwing (Edge Case 2)", () => {
    // 1. Arrange
    const html = "";

    // 2. Act
    const result = analyzeHtml(html);

    // 3. Assert
    expect(result).toMatchObject({ hasViewport: false, hasMetaPixel: false, socials: {} });
    expect(result.title).toBeUndefined();
  });
});

describe("validateAuditUrl", () => {
  it("adds https to bare domains (Happy Path)", () => {
    // 1. Arrange
    const raw = "ornek-kafe.com";

    // 2. Act
    const url = validateAuditUrl(raw);

    // 3. Assert
    expect(url.toString()).toBe("https://ornek-kafe.com/");
  });

  it("blocks non-http schemes, odd ports and embedded credentials (Edge Case 1)", () => {
    // 1. Arrange
    const blocked = ["file:///etc/passwd", "ftp://ornek.com", "https://ornek.com:8443", "https://user:pass@ornek.com"];

    // 2. Act & 3. Assert
    for (const raw of blocked) {
      expect(() => validateAuditUrl(raw)).toThrow(AuditBlockedError);
    }
  });

  it("blocks local hostnames and private IP literals (Edge Case 2)", () => {
    // 1. Arrange
    const blocked = ["http://localhost", "http://intranet.local", "http://127.0.0.1", "http://169.254.169.254", "http://[::1]"];

    // 2. Act & 3. Assert
    for (const raw of blocked) {
      expect(() => validateAuditUrl(raw)).toThrow(AuditBlockedError);
    }
  });
});

describe("extractEmails", () => {
  it("finds mailto, plain-text and Cloudflare-protected e-mails (Happy Path)", () => {
    // 1. Arrange
    // "info@kafe.com" XOR-encoded with key 0x42 (Cloudflare email protection format)
    const cf = "42" + Array.from("info@kafe.com").map((c) => (c.charCodeAt(0) ^ 0x42).toString(16).padStart(2, "0")).join("");
    const html = `<a href="mailto:Rezervasyon@Kafe.com?subject=x">Yaz</a> Bize ulaşın: siparis@kafe.com.tr <span data-cfemail="${cf}"></span>`;

    // 2. Act
    const emails = extractEmails(html);

    // 3. Assert
    expect([...emails].sort()).toEqual(["info@kafe.com", "rezervasyon@kafe.com", "siparis@kafe.com.tr"]);
  });

  it("ignores image names, placeholders and tracking addresses (Edge Case 1)", () => {
    // 1. Arrange
    const html = `logo@2x.png ornek@example.com abc@sentry.io user@domain.com`;

    // 2. Act
    const emails = extractEmails(html);

    // 3. Assert
    expect(emails).toEqual([]);
  });

  it("returns at most five unique addresses (Edge Case 2)", () => {
    // 1. Arrange
    const html = Array.from({ length: 8 }, (_, i) => `kisi${i}@firma.com kisi${i}@firma.com`).join(" ");

    // 2. Act
    const emails = extractEmails(html);

    // 3. Assert
    expect(emails).toHaveLength(5);
    expect(new Set(emails).size).toBe(5);
  });
});
