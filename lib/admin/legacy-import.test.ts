import { describe, expect, it } from "vitest";
import {
  LEGACY_KEYS,
  collectDataUrls,
  legacySummary,
  mergeById,
  readLegacyData,
  replaceDataUrls,
} from "@/lib/admin/legacy-import";
import { parseList } from "@/components/admin/ListInput";
import { uniqueSlug } from "@/lib/store/admin-cms-store";

function storage(entries: Record<string, string>) {
  return { getItem: (key: string) => entries[key] ?? null };
}

describe("readLegacyData", () => {
  it("finds edits the old panel stored in the browser (Happy Path)", () => {
    // 1. Arrange
    const store = storage({
      [LEGACY_KEYS.services]: JSON.stringify([{ id: "srv-1", slug: "seo", title: "SEO" }]),
      [LEGACY_KEYS.narrative]: JSON.stringify({ brandName: "digivideas", slogan: "Yeni slogan" }),
      [LEGACY_KEYS.inquiries]: JSON.stringify([{ id: "inq-1" }]),
    });

    // 2. Act
    const data = readLegacyData(store);

    // 3. Assert
    expect(data?.services).toHaveLength(1);
    expect(data?.narrative?.slogan).toBe("Yeni slogan");
    expect(legacySummary(data!)).toEqual(["1 Hizmet", "Site ayarları", "1 Gelen talep"]);
  });

  it("returns null when nothing was ever saved (Edge Case 1)", () => {
    // 1. Arrange & 2. Act & 3. Assert
    expect(readLegacyData(storage({}))).toBeNull();
    expect(readLegacyData(storage({ [LEGACY_KEYS.inquiries]: "[]" }))).toBeNull();
  });

  it("ignores corrupted or wrongly shaped values (Edge Case 2)", () => {
    // 1. Arrange
    const store = storage({ [LEGACY_KEYS.services]: "{not json", [LEGACY_KEYS.tags]: '{"a":1}', [LEGACY_KEYS.narrative]: "[1,2]" });

    // 2. Act & 3. Assert
    expect(readLegacyData(store)).toBeNull();
  });
});

describe("mergeById", () => {
  it("adds only records the server does not have (Happy Path)", () => {
    // 1. Arrange
    const server = [{ id: "a", slug: "seo", title: "Sunucu SEO" }];
    const legacy = [{ id: "a", slug: "seo", title: "Eski SEO" }, { id: "b", slug: "reels", title: "Reels" }];

    // 2. Act
    const result = mergeById(server, legacy);

    // 3. Assert
    expect(result.added).toBe(1);
    expect(result.items.find((item) => item.id === "a")?.title).toBe("Sunucu SEO"); // server copy untouched
    expect(result.items.map((item) => item.id)).toEqual(["a", "b"]);
  });

  it("renames a clashing slug instead of overwriting (Edge Case 1)", () => {
    // 1. Arrange
    const server = [{ id: "a", slug: "seo" }, { id: "x", slug: "seo-2" }];

    // 2. Act
    const result = mergeById(server, [{ id: "b", slug: "seo" }]);

    // 3. Assert
    expect(result.items.at(-1)).toEqual({ id: "b", slug: "seo-3" });
  });

  it("skips malformed legacy entries (Edge Case 2)", () => {
    // 1. Arrange
    const legacy = [null, { slug: "no-id" }, { id: 5 }] as unknown as { id: string; slug?: string }[];

    // 2. Act
    const result = mergeById([], legacy);

    // 3. Assert
    expect(result).toEqual({ items: [], added: 0 });
  });
});

describe("inline image migration", () => {
  it("collects and replaces base64 images deep in the data (Happy Path)", () => {
    // 1. Arrange
    const png = "data:image/png;base64,AAAA";
    const data = { customers: [{ heroImage: png, galleryImages: [png, "/assets/a.webp"] }] };

    // 2. Act
    const found = collectDataUrls(data);
    const replaced = replaceDataUrls(data, new Map([[png, "/api/uploads/x.png"]]));

    // 3. Assert
    expect(Array.from(found)).toEqual([png]);
    expect(replaced.customers[0]).toEqual({ heroImage: "/api/uploads/x.png", galleryImages: ["/api/uploads/x.png", "/assets/a.webp"] });
    expect(data.customers[0].heroImage).toBe(png); // original not mutated
  });

  it("leaves non-image data URLs and plain text alone (Edge Case 1)", () => {
    // 1. Arrange & 2. Act & 3. Assert
    expect(collectDataUrls({ a: "data:text/html,<b>", b: "metin", c: 42 }).size).toBe(0);
  });

  it("handles empty structures (Edge Case 2)", () => {
    // 1. Arrange & 2. Act & 3. Assert
    expect(replaceDataUrls(null, new Map())).toBeNull();
    expect(replaceDataUrls([], new Map())).toEqual([]);
  });
});

describe("comma lists and slugs (reported admin bugs)", () => {
  it("parses tags typed with commas and multi-word names (Happy Path)", () => {
    // 1. Arrange & 2. Act & 3. Assert
    expect(parseList("Meta Ads, Reels & Video,İzmir Ajans")).toEqual(["Meta Ads", "Reels & Video", "İzmir Ajans"]);
  });

  it("ignores empty parts while the user is still typing (Edge Case 1)", () => {
    // 1. Arrange & 2. Act & 3. Assert
    expect(parseList("Meta Ads, ")).toEqual(["Meta Ads"]);
    expect(parseList(" , ,")).toEqual([]);
  });

  it("never reuses another record's slug (Edge Case 2)", () => {
    // 1. Arrange
    const items = [{ id: "1", slug: "seo" }, { id: "2", slug: "seo-2" }];

    // 2. Act & 3. Assert
    expect(uniqueSlug("seo", items)).toBe("seo-3"); // new record
    expect(uniqueSlug("seo", items, "1")).toBe("seo"); // editing the owner keeps it
    expect(uniqueSlug("", [])).toBe("icerik");
  });
});
