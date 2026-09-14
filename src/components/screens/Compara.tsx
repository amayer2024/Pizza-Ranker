"use client";

import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { usePizza } from "@/components/PizzaProvider";
import { CATEGORIES, categoryAvg, formatCat, fmt, lensRatings, placeScore, scoreColor } from "@/lib/scoring";
import type { CategoryKey } from "@/lib/types";

export function ComparaScreen() {
  const { places, ratings, lens } = usePizza();
  const [aId, setAId] = useState(places[0]?.id ?? "");
  const [bId, setBId] = useState(places[1]?.id ?? places[0]?.id ?? "");
  const a = places.find((p) => p.id === aId) ?? places[0];
  const b = places.find((p) => p.id === bId) ?? places[1] ?? places[0];

  if (!a || !b) {
    return (
      <AppShell kicker="Cara a cara" title="Comparar">
        <div className="pad-block">Hacen falta al menos dos sitios.</div>
      </AppShell>
    );
  }

  const aRs = lensRatings(ratings, a.id, lens);
  const bRs = lensRatings(ratings, b.id, lens);
  const aSc = placeScore(ratings, a.id, lens);
  const bSc = placeScore(ratings, b.id, lens);
  const verdict =
    aSc === null || bSc === null
      ? "Faltan valoraciones con este filtro."
      : aSc === bSc
        ? "Empate técnico."
        : `${(aSc > bSc ? a.name : b.name)} gana por ${Math.abs(aSc - bSc).toFixed(1)} puntos.`;

  return (
    <AppShell kicker="Cara a cara" title="Comparar" backHref="/">
      <div className="pad-block">
        <div className="kicker" style={{ marginBottom: 10 }}>
          Izquierda
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {places.map((p) => (
            <button key={`a-${p.id}`} className={`chip ${p.id === a.id ? "is-on" : ""}`} onClick={() => setAId(p.id)}>
              {p.name}
            </button>
          ))}
        </div>
        <div className="kicker" style={{ margin: "14px 0 10px" }}>
          Derecha
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {places.map((p) => (
            <button key={`b-${p.id}`} className={`chip ${p.id === b.id ? "is-on" : ""}`} onClick={() => setBId(p.id)}>
              {p.name}
            </button>
          ))}
        </div>
      </div>
      <div className="cmp-head">
        <div>
          <div style={{ fontSize: 15, fontWeight: 800, lineHeight: 1.2 }}>{a.name}</div>
          <div style={{ fontSize: 42, fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 1.1, color: scoreColor(aSc) }}>
            {fmt(aSc)}
          </div>
          <div className="hide-mobile" style={{ fontSize: 12, color: "var(--color-neutral-700)" }}>
            {a.barrio}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 15, fontWeight: 800, lineHeight: 1.2 }}>{b.name}</div>
          <div style={{ fontSize: 42, fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 1.1, color: scoreColor(bSc) }}>
            {fmt(bSc)}
          </div>
          <div className="hide-mobile" style={{ fontSize: 12, color: "var(--color-neutral-700)" }}>
            {b.barrio}
          </div>
        </div>
      </div>
      {CATEGORIES.map((c) => {
        const av = categoryAvg(aRs, c.key as CategoryKey) ?? 0;
        const bv = categoryAvg(bRs, c.key as CategoryKey) ?? 0;
        return (
          <div key={c.key} className="cmp-row">
            <div style={{ fontSize: 20, fontWeight: 900, color: av > bv ? "var(--color-accent)" : "var(--color-neutral-600)" }}>
              {formatCat(c.key, av)}
            </div>
            <div className="kicker" style={{ textAlign: "center" }}>
              {c.label}
            </div>
            <div style={{ fontSize: 20, fontWeight: 900, textAlign: "right", color: bv > av ? "var(--color-accent)" : "var(--color-neutral-600)" }}>
              {formatCat(c.key, bv)}
            </div>
          </div>
        );
      })}
      <div style={{ padding: 18, fontSize: 13, lineHeight: 1.5, color: "var(--color-neutral-800)" }}>{verdict}</div>
    </AppShell>
  );
}
