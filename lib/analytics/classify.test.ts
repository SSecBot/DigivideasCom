import { describe, expect, it } from "vitest";
import {
  classifyChannel,
  countryFromHeaders,
  isBot,
  parseBrowser,
  parseDevice,
  parseOs,
  referrerHostOf,
} from "@/lib/analytics/classify";

const IPHONE_UA =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1";
const WINDOWS_CHROME_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36";

describe("user-agent parsing", () => {
  it("detects an iPhone Safari visitor (Happy Path)", () => {
    // 1. Arrange
    const ua = IPHONE_UA;

    // 2. Act
    const result = { device: parseDevice(ua), browser: parseBrowser(ua), os: parseOs(ua), bot: isBot(ua) };

    // 3. Assert
    expect(result).toEqual({ device: "Mobil", browser: "Safari", os: "iOS", bot: false });
  });

  it("treats crawlers and empty user agents as bots (Edge Case 1)", () => {
    // 1. Arrange
    const agents = ["Mozilla/5.0 (compatible; Googlebot/2.1)", "", "curl/8.4.0", "facebookexternalhit/1.1"];

    // 2. Act
    const results = agents.map(isBot);

    // 3. Assert
    expect(results).toEqual([true, true, true, true]);
  });

  it("labels Edge before Chrome because Edge also says Chrome (Edge Case 2)", () => {
    // 1. Arrange
    const ua = `${WINDOWS_CHROME_UA} Edg/129.0.0.0`;

    // 2. Act
    const browser = parseBrowser(ua);

    // 3. Assert
    expect(browser).toBe("Edge");
    expect(parseDevice(ua)).toBe("Masaüstü");
  });
});

describe("classifyChannel", () => {
  it("classifies Google referrals as organic search (Happy Path)", () => {
    // 1. Arrange
    const input = { referrerHost: "google.com.tr", siteHost: "digivideas.com" };

    // 2. Act
    const channel = classifyChannel(input);

    // 3. Assert
    expect(channel).toBe("Organik Arama");
  });

  it("prefers paid when a click id or cpc medium is present (Edge Case 1)", () => {
    // 1. Arrange
    const withClickId = { referrerHost: "instagram.com", hasClickId: true };
    const withMedium = { utmSource: "instagram", utmMedium: "paid_social" };

    // 2. Act
    const results = [classifyChannel(withClickId), classifyChannel(withMedium)];

    // 3. Assert
    expect(results).toEqual(["Ücretli Reklam", "Ücretli Reklam"]);
  });

  it("handles short social hosts, webmail and self-referrals (Edge Case 2)", () => {
    // 1. Arrange & 2. Act
    const tco = classifyChannel({ referrerHost: "t.co" });
    const gmail = classifyChannel({ referrerHost: "mail.google.com" });
    const self = classifyChannel({ referrerHost: "digivideas.com", siteHost: "digivideas.com" });

    // 3. Assert
    expect(tco).toBe("Sosyal Medya");
    expect(gmail).toBe("E-posta");
    expect(self).toBe("Doğrudan");
  });
});

describe("referrerHostOf / countryFromHeaders", () => {
  it("extracts a clean host and a proxy country (Happy Path)", () => {
    // 1. Arrange
    const headers = new Headers({ "cf-ipcountry": "tr" });

    // 2. Act
    const host = referrerHostOf("https://www.instagram.com/p/abc");
    const country = countryFromHeaders(headers);

    // 3. Assert
    expect(host).toBe("instagram.com");
    expect(country).toBe("TR");
  });

  it("rejects non-http referrers and unknown countries (Edge Case 1)", () => {
    // 1. Arrange
    const headers = new Headers({ "cf-ipcountry": "XX" });

    // 2. Act & 3. Assert
    expect(referrerHostOf("android-app://com.google.android.gm")).toBeUndefined();
    expect(countryFromHeaders(headers)).toBeUndefined();
  });

  it("returns undefined for garbage input (Edge Case 2)", () => {
    // 1. Arrange
    const headers = new Headers({ "x-country-code": "TURKEY" });

    // 2. Act & 3. Assert
    expect(referrerHostOf("not a url")).toBeUndefined();
    expect(countryFromHeaders(headers)).toBeUndefined();
  });
});
