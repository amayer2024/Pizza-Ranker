"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { usePizza } from "@/components/PizzaProvider";
import { fmt, ranked } from "@/lib/scoring";

const MadridMap = dynamic(() => import("@/components/MadridMap"), { ssr: false });

export function MapaScreen() {
  const { places, ratings, lens } = usePizza();
  const rows = ranked(places, ratings, lens);
  const topId = rows.find((r) => r.score !== null)?.place.id;
  const pins = places.map((p) => ({
    ...p,
    score: rows.find((r) => r.place.id === p.id)?.score ?? null,
    isTop: p.id === topId,
  }));

  return (
    <AppShell kicker={`${places.length} sitios`} title="Mapa">
      <div className="mapa-layout">
        <div className="mapa-canvas pad-block">
          <MadridMap pins={pins} />
          <p className="text-muted hide-desktop" style={{ fontSize: 12, marginTop: 12 }}>
            Toca un sitio para ver su ficha.
          </p>
        </div>
        <aside className="mapa-list hide-mobile">
          <div className="kicker" style={{ marginBottom: 12 }}>
            Por barrio
          </div>
          {rows.map((r) => (
            <Link
              key={r.place.id}
              href={`/sitio/${r.place.id}`}
              style={{
                padding: "11px 0",
                borderBottom: "1px solid var(--color-divider)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
                gap: 10,
                textDecoration: "none",
                color: "inherit",
              }}
            >
              <div>
                <div style={{ fontSize: 14, fontWeight: 700 }}>{r.place.name}</div>
                <div style={{ fontSize: 11, color: "var(--color-neutral-600)" }}>{r.place.barrio}</div>
              </div>
              <div style={{ fontSize: 17, fontWeight: 900 }}>{fmt(r.score)}</div>
            </Link>
          ))}
        </aside>
      </div>
    </AppShell>
  );
}
