import { NextResponse } from "next/server";
import type { PlaceSearchHit } from "@/lib/types";

const MADRID = { lat: 40.4168, lng: -3.7038 };

function barrioFromAddress(address: string, extra?: string | null): string {
  if (extra && extra.trim()) return extra.trim();
  const parts = address.split(",").map((p) => p.trim());
  if (parts.length >= 2) return parts[parts.length - 2] || "Madrid";
  return "Madrid";
}

async function searchGoogle(q: string): Promise<PlaceSearchHit[]> {
  const key = process.env.GOOGLE_PLACES_API_KEY;
  if (!key) return [];

  const res = await fetch("https://places.googleapis.com/v1/places:searchText", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": key,
      "X-Goog-FieldMask":
        "places.id,places.displayName,places.formattedAddress,places.location,places.addressComponents",
    },
    body: JSON.stringify({
      textQuery: `${q} pizza Madrid`,
      languageCode: "es",
      regionCode: "ES",
      locationBias: {
        circle: {
          center: { latitude: MADRID.lat, longitude: MADRID.lng },
          radius: 22000,
        },
      },
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Places API ${res.status}: ${text}`);
  }

  const data = (await res.json()) as {
    places?: Array<{
      id?: string;
      displayName?: { text?: string };
      formattedAddress?: string;
      location?: { latitude?: number; longitude?: number };
      addressComponents?: Array<{ longText?: string; types?: string[] }>;
    }>;
  };

  return (data.places ?? [])
    .filter((p) => p.location?.latitude && p.location?.longitude)
    .map((p) => {
      const barrioComp = p.addressComponents?.find((c) =>
        c.types?.includes("sublocality") ||
        c.types?.includes("neighborhood") ||
        c.types?.includes("sublocality_level_1"),
      );
      return {
        id: p.id ?? `${p.displayName?.text}-${p.formattedAddress}`,
        name: p.displayName?.text ?? "Sin nombre",
        address: p.formattedAddress ?? "",
        barrio: barrioFromAddress(p.formattedAddress ?? "", barrioComp?.longText),
        lat: p.location!.latitude!,
        lng: p.location!.longitude!,
      };
    });
}

async function searchNominatim(q: string): Promise<PlaceSearchHit[]> {
  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("q", `${q} Madrid`);
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("limit", "8");
  url.searchParams.set("countrycodes", "es");
  url.searchParams.set("viewbox", "-3.85,40.52,-3.55,40.35");
  url.searchParams.set("bounded", "0");

  const res = await fetch(url, {
    headers: {
      "User-Agent": "PizzaRank/1.0 (roommates madrid pizza ranking)",
      Accept: "application/json",
    },
  });
  if (!res.ok) throw new Error(`Nominatim ${res.status}`);

  const data = (await res.json()) as Array<{
    place_id: number;
    display_name: string;
    lat: string;
    lon: string;
    name?: string;
    address?: {
      suburb?: string;
      neighbourhood?: string;
      city_district?: string;
      quarter?: string;
      road?: string;
      house_number?: string;
    };
  }>;

  return data.map((p) => {
    const addr = p.address ?? {};
    const street = [addr.road, addr.house_number].filter(Boolean).join(" ");
    return {
      id: `osm-${p.place_id}`,
      name: p.name || p.display_name.split(",")[0],
      address: street || p.display_name.split(",").slice(0, 2).join(", "),
      barrio: addr.suburb || addr.neighbourhood || addr.quarter || addr.city_district || "Madrid",
      lat: Number(p.lat),
      lng: Number(p.lon),
    };
  });
}

export async function GET(request: Request) {
  const q = new URL(request.url).searchParams.get("q")?.trim() ?? "";
  if (q.length < 2) {
    return NextResponse.json({ results: [] as PlaceSearchHit[] });
  }

  try {
    try {
      const google = await searchGoogle(q);
      if (google.length) return NextResponse.json({ results: google, source: "google" });
    } catch (err) {
      console.error("Google Places search failed", err);
    }
    const osm = await searchNominatim(q);
    return NextResponse.json({ results: osm, source: "osm" });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Search failed";
    return NextResponse.json({ error: message, results: [] }, { status: 500 });
  }
}
