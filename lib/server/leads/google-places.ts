import { PlaceLead } from "@/lib/leads/types";

/**
 * Google Places API (New) — Text Search.
 * https://developers.google.com/maps/documentation/places/web-service/text-search
 * The key is read from GOOGLE_MAPS_API_KEY on the server and never sent to the browser.
 */

const ENDPOINT = "https://places.googleapis.com/v1/places:searchText";
const FIELD_MASK = [
  "places.id",
  "places.displayName",
  "places.formattedAddress",
  "places.location",
  "places.rating",
  "places.userRatingCount",
  "places.websiteUri",
  "places.nationalPhoneNumber",
  "places.internationalPhoneNumber",
  "places.googleMapsUri",
  "places.businessStatus",
  "places.types",
  "places.primaryType",
  "places.primaryTypeDisplayName",
  "places.priceLevel",
  "nextPageToken",
].join(",");

export class PlacesConfigError extends Error {}
export class PlacesApiError extends Error {}

interface RawPlace {
  id: string;
  displayName?: { text?: string };
  formattedAddress?: string;
  location?: { latitude?: number; longitude?: number };
  rating?: number;
  userRatingCount?: number;
  websiteUri?: string;
  nationalPhoneNumber?: string;
  internationalPhoneNumber?: string;
  googleMapsUri?: string;
  businessStatus?: string;
  types?: string[];
  primaryType?: string;
  primaryTypeDisplayName?: { text?: string };
  priceLevel?: string;
}

export function mapPlace(raw: RawPlace): PlaceLead {
  return {
    placeId: raw.id,
    name: raw.displayName?.text || "İsimsiz işletme",
    address: raw.formattedAddress || "",
    lat: raw.location?.latitude,
    lng: raw.location?.longitude,
    rating: raw.rating,
    ratingCount: raw.userRatingCount,
    website: raw.websiteUri,
    phone: raw.nationalPhoneNumber,
    internationalPhone: raw.internationalPhoneNumber,
    mapsUrl: raw.googleMapsUri,
    businessStatus: raw.businessStatus,
    types: raw.types ?? [],
    primaryType: raw.primaryType,
    primaryTypeLabel: raw.primaryTypeDisplayName?.text,
    priceLevel: raw.priceLevel,
  };
}

export async function searchPlaces(
  textQuery: string,
  pageToken?: string
): Promise<{ places: PlaceLead[]; nextPageToken?: string }> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    throw new PlacesConfigError(
      "GOOGLE_MAPS_API_KEY tanımlı değil. Google Cloud'da Places API (New) etkinleştirip anahtarı .env dosyasına ekleyin."
    );
  }

  const response = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask": FIELD_MASK,
    },
    body: JSON.stringify({
      textQuery,
      languageCode: "tr",
      regionCode: "TR",
      pageSize: 20,
      ...(pageToken ? { pageToken } : {}),
    }),
    cache: "no-store",
    signal: AbortSignal.timeout(15_000),
  });

  const body = (await response.json().catch(() => ({}))) as {
    places?: RawPlace[];
    nextPageToken?: string;
    error?: { message?: string; status?: string };
  };
  if (!response.ok) {
    throw new PlacesApiError(
      `Google Places hatası (${response.status}${body.error?.status ? ` ${body.error.status}` : ""}): ${body.error?.message || "bilinmeyen hata"}`
    );
  }
  return { places: (body.places ?? []).map(mapPlace), nextPageToken: body.nextPageToken };
}
