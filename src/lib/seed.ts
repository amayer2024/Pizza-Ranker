import type { Place, Rating, Scores, UserName } from "./types";

const scores = (s: [number, number, number, number, number, number]): Scores => ({
  presentacion: s[0],
  crust: s[1],
  sabor: s[2],
  lugar: s[3],
  precio: s[4],
  espera: s[5],
});

export const SEED_PLACES: Place[] = [
  {
    id: "canpizza",
    name: "Can Pizza Chamberí",
    barrio: "Chamberí",
    address: "C. de Santa Engracia 53",
    priceEur: 0,
    waitMin: 0,
    lat: 40.4325951,
    lng: -3.6980319,
    googlePlaceId: null,
  },
];

const seedRating = (
  placeId: string,
  userName: UserName,
  s: [number, number, number, number, number, number],
  date: string,
  note: string,
): Rating => ({
  id: `${placeId}-${userName.toLowerCase()}`,
  placeId,
  userName,
  scores: scores(s),
  note,
  updatedAt: date,
});

export const SEED_RATINGS: Rating[] = [
  seedRating("canpizza", "Ronit", [7, 6.8, 6.2, 9, 15, 30], "2026-09-13T21:30:00.000Z", ""),
  seedRating("canpizza", "Momo", [7.8, 9, 8.8, 9.3, 15, 30], "2026-09-13T21:31:00.000Z", ""),
  seedRating("canpizza", "Amit", [7.7, 8.5, 8.2, 9.2, 13.9, 30], "2026-09-13T21:45:00.000Z", ""),
];
