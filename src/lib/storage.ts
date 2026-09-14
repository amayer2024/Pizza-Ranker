import { SEED_PLACES, SEED_RATINGS } from "./seed";
import { getSupabase, hasSupabase } from "./supabase";
import type { Place, Rating, Scores, UserName } from "./types";

const PLACES_KEY = "pizza-rank:places";
const RATINGS_KEY = "pizza-rank:ratings";
const SEEDED_KEY = "pizza-rank:seeded";

function readLocal<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeLocal(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value));
}

function ensureLocalSeed() {
  if (typeof window === "undefined") return;
  if (localStorage.getItem(SEEDED_KEY)) return;
  if (!localStorage.getItem(PLACES_KEY)) writeLocal(PLACES_KEY, SEED_PLACES);
  if (!localStorage.getItem(RATINGS_KEY)) writeLocal(RATINGS_KEY, SEED_RATINGS);
  localStorage.setItem(SEEDED_KEY, "1");
}

type PlaceRow = {
  id: string;
  name: string;
  barrio: string;
  address: string;
  price_eur: number;
  wait_min: number;
  lat: number;
  lng: number;
  google_place_id: string | null;
};

type RatingRow = {
  id: string;
  place_id: string;
  user_name: UserName;
  presentacion: number;
  crust: number;
  sabor: number;
  lugar: number;
  precio: number;
  espera: number;
  note: string;
  updated_at: string;
};

function placeFromRow(row: PlaceRow): Place {
  return {
    id: row.id,
    name: row.name,
    barrio: row.barrio,
    address: row.address,
    priceEur: Number(row.price_eur),
    waitMin: Number(row.wait_min),
    lat: Number(row.lat),
    lng: Number(row.lng),
    googlePlaceId: row.google_place_id,
  };
}

function scoresFromRow(row: RatingRow): Scores {
  return {
    presentacion: Number(row.presentacion),
    crust: Number(row.crust),
    sabor: Number(row.sabor),
    lugar: Number(row.lugar),
    precio: Number(row.precio),
    espera: Number(row.espera),
  };
}

function ratingFromRow(row: RatingRow): Rating {
  return {
    id: row.id,
    placeId: row.place_id,
    userName: row.user_name,
    scores: scoresFromRow(row),
    note: row.note ?? "",
    updatedAt: row.updated_at,
  };
}

async function loadCloud(): Promise<{ places: Place[]; ratings: Rating[] } | null> {
  const sb = getSupabase();
  if (!sb) return null;
  const [placesRes, ratingsRes] = await Promise.all([
    sb.from("places").select("*").order("name"),
    sb.from("ratings").select("*"),
  ]);
  if (placesRes.error) throw placesRes.error;
  if (ratingsRes.error) throw ratingsRes.error;
  const places = (placesRes.data as PlaceRow[]).map(placeFromRow);
  const ratings = (ratingsRes.data as RatingRow[]).map(ratingFromRow);
  return { places, ratings };
}

export async function loadData(): Promise<{ places: Place[]; ratings: Rating[]; cloud: boolean }> {
  if (hasSupabase()) {
    try {
      const cloud = await loadCloud();
      if (cloud) {
        writeLocal(PLACES_KEY, cloud.places);
        writeLocal(RATINGS_KEY, cloud.ratings);
        return { ...cloud, cloud: true };
      }
    } catch (err) {
      console.error("Supabase load failed, using local data", err);
    }
  }
  ensureLocalSeed();
  return {
    places: readLocal(PLACES_KEY, SEED_PLACES),
    ratings: readLocal(RATINGS_KEY, SEED_RATINGS),
    cloud: false,
  };
}

export async function savePlace(place: Place): Promise<void> {
  const sb = getSupabase();
  if (sb) {
    const { error } = await sb.from("places").upsert({
      id: place.id,
      name: place.name,
      barrio: place.barrio,
      address: place.address,
      price_eur: place.priceEur,
      wait_min: place.waitMin,
      lat: place.lat,
      lng: place.lng,
      google_place_id: place.googlePlaceId,
    });
    if (error) throw error;
  }
  const places = readLocal<Place[]>(PLACES_KEY, []);
  writeLocal(
    PLACES_KEY,
    [...places.filter((p) => p.id !== place.id), place],
  );
}

export async function saveRating(rating: Rating): Promise<void> {
  const sb = getSupabase();
  if (sb) {
    const { error } = await sb.from("ratings").upsert({
      id: rating.id,
      place_id: rating.placeId,
      user_name: rating.userName,
      presentacion: rating.scores.presentacion,
      crust: rating.scores.crust,
      sabor: rating.scores.sabor,
      lugar: rating.scores.lugar,
      precio: rating.scores.precio,
      espera: rating.scores.espera,
      note: rating.note,
      updated_at: rating.updatedAt,
    });
    if (error) throw error;
  }
  const ratings = readLocal<Rating[]>(RATINGS_KEY, []);
  writeLocal(
    RATINGS_KEY,
    [...ratings.filter((r) => !(r.placeId === rating.placeId && r.userName === rating.userName)), rating],
  );
}
