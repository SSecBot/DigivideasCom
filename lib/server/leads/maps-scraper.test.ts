import { describe, expect, it } from "vitest";
import {
  cleanWebsite,
  coordinatesFromUrl,
  parseCount,
  parseRating,
  placeKey,
  toPlaceLead,
} from "@/lib/server/leads/maps-scraper";

const MAPS_URL =
  "https://www.google.com/maps/place/Kahve+Dura%C4%9F%C4%B1/data=!4m7!3m6!1s0x14bbd1a2b3c4d5e6:0x1234abcd5678ef90!8m2!3d38.1612345!4d27.3609876!16s";

describe("toPlaceLead", () => {
  it("maps scraped Google Maps details to a PlaceLead (Happy Path)", () => {
    // 1. Arrange
    const detail = {
      name: "Kahve Durağı",
      category: "Kafe",
      rating: "4,7",
      reviews: "1.284 yorum",
      addr: "Adres: Ayrancılar, Torbalı/İzmir",
      web: "https://www.google.com/url?q=https://kahveduragi.com/&sa=U",
      phone: "+90 532 111 22 33",
      closed: false,
      temporarilyClosed: false,
    };

    // 2. Act
    const place = toPlaceLead(MAPS_URL, "Kahve Durağı", detail);

    // 3. Assert
    expect(place).toMatchObject({
      placeId: "maps:0x14bbd1a2b3c4d5e6:0x1234abcd5678ef90",
      name: "Kahve Durağı",
      address: "Ayrancılar, Torbalı/İzmir",
      lat: 38.1612345,
      lng: 27.3609876,
      rating: 4.7,
      ratingCount: 1284,
      website: "https://kahveduragi.com/",
      primaryTypeLabel: "Kafe",
      businessStatus: "OPERATIONAL",
    });
  });

  it("marks closed places and falls back to the list name (Edge Case 1)", () => {
    // 1. Arrange
    const detail = { name: "", category: "", rating: "", reviews: "", addr: "", web: "", phone: "", closed: true, temporarilyClosed: false };

    // 2. Act
    const place = toPlaceLead("https://www.google.com/maps/place/x", "Liste Adı", detail);

    // 3. Assert
    expect(place.name).toBe("Liste Adı");
    expect(place.businessStatus).toBe("CLOSED_PERMANENTLY");
    expect(place.rating).toBeUndefined();
    expect(place.website).toBeUndefined();
  });

  it("drops non-http links and implausible ratings (Edge Case 2)", () => {
    // 1. Arrange & 2. Act & 3. Assert
    expect(cleanWebsite("javascript:alert(1)")).toBeUndefined();
    expect(cleanWebsite("")).toBeUndefined();
    expect(parseRating("12")).toBeUndefined();
    expect(parseCount("yorum yok")).toBeUndefined();
    expect(coordinatesFromUrl("https://maps.google.com/x")).toEqual({});
    expect(placeKey("https://www.google.com/maps/place/abc?hl=tr")).toBe("maps:https://www.google.com/maps/place/abc");
  });
});
