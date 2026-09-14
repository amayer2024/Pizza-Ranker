import { CATEGORIES, type Lens, type Place, type Rating, type Scores } from "./types";

export function scoreOf(scores: Scores): number {
  return (
    scores.presentacion * 0.1 +
    scores.crust * 0.3 +
    scores.sabor * 0.4 +
    scores.lugar * 0.2
  );
}

export function fmt(n: number | null | undefined): string {
  return n === null || n === undefined ? "—" : n.toFixed(1);
}

export function eurStr(n: number): string {
  return `${n.toFixed(2).replace(".", ",")} €`;
}

export function scoreColor(n: number | null | undefined): string {
  if (n === null || n === undefined) return "var(--color-neutral-500)";
  const t = Math.max(0, Math.min(1, (n - 4) / 5));
  return `oklch(0.52 0.17 ${(25 + t * 120).toFixed(0)})`;
}

export function barWidth(n: number | null | undefined): string {
  if (n === null || n === undefined) return "0%";
  return `${Math.max(0, Math.min(100, n * 10))}%`;
}

export function lensRatings(ratings: Rating[], placeId: string, lens: Lens): Rating[] {
  const mine = ratings.filter((r) => r.placeId === placeId);
  return lens === "Todos" ? mine : mine.filter((r) => r.userName === lens);
}

export function placeScore(ratings: Rating[], placeId: string, lens: Lens): number | null {
  const rs = lensRatings(ratings, placeId, lens);
  if (!rs.length) return null;
  return rs.reduce((t, r) => t + scoreOf(r.scores), 0) / rs.length;
}

export function ranked(places: Place[], ratings: Rating[], lens: Lens) {
  return places
    .map((p) => ({
      place: p,
      score: placeScore(ratings, p.id, lens),
      votes: lensRatings(ratings, p.id, lens).length,
    }))
    .sort((a, b) => {
      if (a.score === null && b.score === null) return a.place.name.localeCompare(b.place.name);
      if (a.score === null) return 1;
      if (b.score === null) return -1;
      return b.score - a.score;
    });
}

export function categoryAvg(ratings: Rating[], key: keyof Scores): number | null {
  if (!ratings.length) return null;
  return ratings.reduce((t, r) => t + r.scores[key], 0) / ratings.length;
}

export function slugify(name: string): string {
  const s = name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return s || "sitio";
}

export function pesoLabel(info: boolean, weight: number, key?: string): string {
  if (key === "precio") return "€, no puntúa";
  if (key === "espera") return "min, no puntúa";
  return info ? "solo informativo" : `${weight}% del total`;
}

export function pesoShort(info: boolean, weight: number, key?: string): string {
  if (key === "precio") return "€";
  if (key === "espera") return "min";
  return info ? "no puntúa" : `${weight}%`;
}

export function formatCat(key: string, n: number | null | undefined): string {
  if (n === null || n === undefined) return "—";
  if (key === "precio") return eurStr(n);
  if (key === "espera") return `${Math.round(n)} min`;
  return n.toFixed(1);
}

export function catBarWidth(key: string, n: number | null | undefined): string {
  if (n === null || n === undefined) return "0%";
  if (key === "precio") return `${Math.max(0, Math.min(100, (n / 25) * 100))}%`;
  if (key === "espera") return `${Math.max(0, Math.min(100, (n / 60) * 100))}%`;
  return barWidth(n);
}

export function defaultScores(): Scores {
  return {
    presentacion: 5,
    crust: 5,
    sabor: 5,
    lugar: 5,
    precio: 0,
    espera: 0,
  };
}

export { CATEGORIES };
