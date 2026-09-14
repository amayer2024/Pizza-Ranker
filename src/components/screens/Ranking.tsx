"use client";

import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { usePizza } from "@/components/PizzaProvider";
import { barWidth, fmt, ranked, scoreColor } from "@/lib/scoring";

export function RankingScreen() {
  const { places, ratings, lens } = usePizza();
  const rows = ranked(places, ratings, lens);

  return (
    <AppShell kicker="Actualizado hoy" title="Ranking">
      <div className="hide-mobile rank-table-head">
        <div>#</div>
        <div>Sitio</div>
        <div>Barrio</div>
        <div>Nota final</div>
      </div>
      {rows.map((r, i) => (
        <Link key={r.place.id} href={`/sitio/${r.place.id}`} className="rank-row hide-desktop">
          <div className="rank-index">{String(i + 1).padStart(2, "0")}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="rank-name">{r.place.name}</div>
            <div className="rank-meta">
              <span>{r.place.barrio}</span>
            </div>
            <div className="score-bar" style={{ marginTop: 10 }}>
              <span style={{ width: barWidth(r.score) }} />
            </div>
          </div>
          <div className="rank-score">
            <strong style={{ color: scoreColor(r.score) }}>{fmt(r.score)}</strong>
            <span>{lens === "Todos" ? `${r.votes}/3` : r.votes ? "valorada" : "sin nota"}</span>
          </div>
        </Link>
      ))}
      {rows.map((r, i) => (
        <Link key={`d-${r.place.id}`} href={`/sitio/${r.place.id}`} className="rank-table-row hide-mobile" style={{ textDecoration: "none", color: "inherit", cursor: "pointer" }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: "var(--color-accent-700)" }}>
            {String(i + 1).padStart(2, "0")}
          </div>
          <div style={{ fontSize: 19, fontWeight: 800 }}>{r.place.name}</div>
          <div style={{ fontSize: 13, color: "var(--color-neutral-700)" }}>{r.place.barrio}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
            <div className="score-bar" style={{ flex: 1, height: 8 }}>
              <span style={{ width: barWidth(r.score) }} />
            </div>
            <div style={{ fontSize: 24, fontWeight: 900, width: 52, textAlign: "right", color: scoreColor(r.score) }}>
              {fmt(r.score)}
            </div>
          </div>
        </Link>
      ))}
      <div className="pad-block hide-desktop">
        <Link href="/compara" className="btn btn-secondary btn-block">
          Comparar dos sitios
        </Link>
      </div>
    </AppShell>
  );
}
