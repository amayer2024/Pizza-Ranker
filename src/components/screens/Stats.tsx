"use client";

import { AppShell } from "@/components/AppShell";
import { usePizza } from "@/components/PizzaProvider";
import { CATEGORIES, fmt, ranked, scoreOf } from "@/lib/scoring";
import { USERS } from "@/lib/types";

export function StatsScreen() {
  const { places, ratings } = usePizza();
  const top = ranked(places, ratings, "Todos").find((r) => r.score !== null);

  const people = USERS.map((u) => {
    const rs = ratings.filter((r) => r.userName === u);
    const avg = rs.length ? rs.reduce((t, r) => t + scoreOf(r.scores), 0) / rs.length : 0;
    return { u, avg, count: rs.length, raw: avg };
  });
  const hi = Math.max(...people.map((p) => p.raw), 0);
  const lo = Math.min(...people.map((p) => p.raw), hi);
  const tagged = people.map((p) => ({
    ...p,
    tag: p.raw === hi ? "El más blando" : p.raw === lo ? "El más duro" : "El del medio",
  }));

  return (
    <AppShell kicker="Quién puntúa cómo" title="Estadísticas">
      <div className="stats-people">
        {tagged.map((p) => (
          <div key={p.u} className="stat-person">
            <div className="hide-desktop" style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px 18px", borderBottom: "1px solid var(--color-divider)" }}>
              <div className="avatar" style={{ width: 34, height: 34, fontSize: 15 }}>
                {p.u[0]}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 16, fontWeight: 800 }}>{p.u}</div>
                <div style={{ fontSize: 11, color: "var(--color-neutral-700)", marginTop: 2 }}>
                  {p.count} valoraciones · media que da
                </div>
              </div>
              <div style={{ fontSize: 24, fontWeight: 900 }}>{fmt(p.avg)}</div>
            </div>
            <div className="hide-mobile" style={{ padding: "24px 32px", borderRight: "1px solid var(--color-divider)" }}>
              <div style={{ fontSize: 18, fontWeight: 800 }}>{p.u}</div>
              <div style={{ fontSize: 52, fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 1.1 }}>{fmt(p.avg)}</div>
              <div style={{ fontSize: 12, color: "var(--color-neutral-700)", lineHeight: 1.5, marginTop: 6 }}>
                {p.count} valoraciones · media que da
              </div>
              <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--color-accent-700)", marginTop: 10 }}>
                {p.tag}
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="kicker" style={{ padding: "18px 18px 8px" }}>
        Pesos de las categorías
      </div>
      {CATEGORIES.map((c) => (
        <div key={c.key} className="cat-row" style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ flex: 1, fontSize: 14, fontWeight: 700 }}>{c.label}</div>
          <div className="score-bar" style={{ width: 90 }}>
            <span style={{ width: c.info ? "0%" : `${c.weight}%` }} />
          </div>
          <div style={{ width: 78, textAlign: "right", fontSize: 14, fontWeight: 800 }}>
            {c.info ? "No puntúa" : `${c.weight}%`}
          </div>
        </div>
      ))}
      <div style={{ padding: "14px 18px 28px", fontSize: 12, fontWeight: 700, color: "var(--color-neutral-700)" }}>
        Cuatro categorías suman el 100%. Precio y Tiempo Espera se registran pero no entran en la nota.
        {top ? ` ${top.place.name} lidera con ${fmt(top.score)}.` : ""} Los pesos son fijos: se decidieron entre los tres y no se tocan desde la app.
      </div>
    </AppShell>
  );
}
