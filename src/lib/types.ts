export const USERS = ["Momo", "Ronit", "Amit"] as const;
export type UserName = (typeof USERS)[number];
export type Lens = "Todos" | UserName;

export const CATEGORIES = [
  { key: "presentacion", label: "Presentación", weight: 10, info: false },
  { key: "crust", label: "Crust", weight: 30, info: false },
  { key: "sabor", label: "Sabor", weight: 40, info: false },
  { key: "lugar", label: "Lugar", weight: 20, info: false },
  { key: "precio", label: "Precio", weight: 0, info: true },
  { key: "espera", label: "Tiempo Espera", weight: 0, info: true },
] as const;

export type CategoryKey = (typeof CATEGORIES)[number]["key"];

export type Scores = Record<CategoryKey, number>;

export type Place = {
  id: string;
  name: string;
  barrio: string;
  address: string;
  priceEur: number;
  waitMin: number;
  lat: number;
  lng: number;
  googlePlaceId: string | null;
};

export type Rating = {
  id: string;
  placeId: string;
  userName: UserName;
  scores: Scores;
  note: string;
  updatedAt: string;
};

export type PlaceSearchHit = {
  id: string;
  name: string;
  address: string;
  barrio: string;
  lat: number;
  lng: number;
};
