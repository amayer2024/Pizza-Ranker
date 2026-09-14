"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { usePizza } from "@/components/PizzaProvider";
import {
  catBarWidth,
  CATEGORIES,
  fmt,
  formatCat,
  lensRatings,
  pesoShort,
  placeScore,
  scoreColor,
} from "@/lib/scoring";
import { USERS, type CategoryKey } from "@/lib/types";

export function DetalleScreen() {
  const { id } = useParams<{ id: string }>();
  const { places, ratings, lens } = usePizza();
  const place = places.find((p) => p.id === id);

  if (!place) {
    return (
      <AppShell kicker="Sitio" title="No encontrado" backHref="/">
        <div className="pad-block">Ese sitio no está en la lista.</div>
      </AppShell>
    );
  }

  const rs = lensRatings(ratings, place.id, lens);
  const score = placeScore(ratings, place.id, lens);
  const byUser = (u: string) => rs.find((r) => r.userName === u);

  return (
    <AppShell kicker={place.barrio} title={place.name} backHref="/">
      <div className="detail-hero hide-desktop">
        <div>
          <div className="big" style={{ color: scoreColor(score) }}>
            {fmt(score)}
          </div>
          <div className="kicker" style={{ marginTop: 6 }}>
            {lens === "Todos" ? `${rs.length} de 3 valoraciones` : `Nota de ${lens}`}
          </div>
        </div>
        <div style={{ flex: 1, fontSize: 12, color: "var(--color-neutral-700)", lineHeight: 1.5 }}>
          {place.address}
          <br />
          {place.barrio}
        </div>
      </div>

      <div className="hide-mobile" style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(240px,320px)" }}>
        <div style={{ borderRight: "2px solid var(--color-text)" }}>
          <div
            className="kicker"
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(0,1fr) 54px 54px 54px 62px",
              padding: "10px 32px",
              borderBottom: "1px solid var(--color-divider)",
            }}
          >
            <div>Categoría</div>
            <div>Momo</div>
            <div>Ronit</div>
            <div>Amit</div>
            <div style={{ textAlign: "right" }}>Media</div>
          </div>
          {CATEGORIES.map((c) => {
            const vals = rs.map((r) => r.scores[c.key as CategoryKey]);
            const avg = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
            const cell = (u: string) => {
              const r = byUser(u);
              return r ? formatCat(c.key, r.scores[c.key as CategoryKey]) : "–";
            };
            return (
              <div
                key={c.key}
                style={{
                  display: "grid",
                  gridTemplateColumns: "minmax(0,1fr) 54px 54px 54px 62px",
                  alignItems: "center",
                  padding: "15px 32px",
                  borderBottom: "1px solid var(--color-divider)",
                }}
              >
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700 }}>{c.label}</div>
                  <div className="score-bar ink" style={{ marginTop: 8, maxWidth: 260 }}>
                    <span style={{ width: catBarWidth(c.key, avg) }} />
                  </div>
                </div>
                <div style={{ fontSize: 16, fontWeight: 700 }}>{cell("Momo")}</div>
                <div style={{ fontSize: 16, fontWeight: 700 }}>{cell("Ronit")}</div>
                <div style={{ fontSize: 16, fontWeight: 700 }}>{cell("Amit")}</div>
                <div style={{ fontSize: 16, fontWeight: 900, textAlign: "right" }}>{formatCat(c.key, avg)}</div>
              </div>
            );
          })}
        </div>
        <div style={{ padding: "24px 28px" }}>
          <div style={{ fontSize: 76, fontWeight: 900, letterSpacing: "-0.05em", lineHeight: 0.9, color: scoreColor(score) }}>
            {fmt(score)}
          </div>
          <div className="kicker" style={{ marginTop: 8 }}>
            {lens === "Todos" ? `${rs.length} de 3 valoraciones` : `Nota de ${lens}`}
          </div>
          <div style={{ fontSize: 13, color: "var(--color-neutral-700)", lineHeight: 1.6, marginTop: 16, borderTop: "1px solid var(--color-divider)", paddingTop: 14 }}>
            {place.address}
            <br />
            {place.barrio}
          </div>
          <Link href={`/nueva?place=${encodeURIComponent(place.id)}`} className="btn btn-primary btn-block" style={{ marginTop: 18 }}>
            Valorar {place.name}
          </Link>
          <div className="kicker" style={{ margin: "22px 0 10px" }}>
            Notas
          </div>
          {rs.filter((r) => r.note).map((n) => (
            <div key={n.id} style={{ fontSize: 13, lineHeight: 1.5, marginBottom: 12 }}>
              <strong>{n.userName}</strong> · <span style={{ color: "var(--color-neutral-800)" }}>{n.note}</span>
            </div>
          ))}
        </div>
      </div>

      {CATEGORIES.map((c) => {
        const vals = rs.map((r) => r.scores[c.key as CategoryKey]);
        const avg = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
        const per = USERS.map((u) => {
          const r = byUser(u);
          return `${u[0]} ${r ? formatCat(c.key, r.scores[c.key as CategoryKey]) : "–"}`;
        }).join("  ·  ");
        return (
          <div key={c.key} className="cat-row hide-desktop">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <div style={{ fontSize: 14, fontWeight: 700 }}>{c.label}</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
                <span className="kicker">{pesoShort(c.info, c.weight, c.key)}</span>
                <span style={{ fontSize: 18, fontWeight: 900 }}>{formatCat(c.key, avg)}</span>
              </div>
            </div>
            <div className="score-bar ink" style={{ marginTop: 8 }}>
              <span style={{ width: catBarWidth(c.key, avg) }} />
            </div>
            <div style={{ fontSize: 11, color: "var(--color-neutral-600)", marginTop: 7, letterSpacing: "0.04em" }}>
              {per}
            </div>
          </div>
        );
      })}
      <div className="kicker hide-desktop" style={{ padding: "16px 18px 8px" }}>
        Notas
      </div>
      {rs
        .filter((r) => r.note)
        .map((n) => (
          <div key={`m-${n.id}`} className="hide-desktop" style={{ padding: "0 18px 14px", fontSize: 13, lineHeight: 1.5 }}>
            <strong>{n.userName}</strong> · <span style={{ color: "var(--color-neutral-800)" }}>{n.note}</span>
          </div>
        ))}
      <div className="pad-block hide-desktop">
        <Link href={`/nueva?place=${encodeURIComponent(place.id)}`} className="btn btn-primary btn-block">
          Valorar {place.name}
        </Link>
      </div>
    </AppShell>
  );
}
