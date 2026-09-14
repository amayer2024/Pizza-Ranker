"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { usePizza } from "@/components/PizzaProvider";
import { CATEGORIES, defaultScores, fmt, pesoLabel, scoreColor, scoreOf } from "@/lib/scoring";
import { USERS, type CategoryKey, type Scores, type UserName } from "@/lib/types";

export function NuevaScreen() {
  const searchParams = useSearchParams();
  const requestedPlace = searchParams.get("place");
  const { places, ratings, user, upsertRating } = usePizza();
  const [placeId, setPlaceId] = useState(requestedPlace ?? places[0]?.id ?? "");
  const [who, setWho] = useState<UserName>(user ?? "Momo");
  const [scores, setScores] = useState<Scores>(defaultScores());
  const [note, setNote] = useState("");
  const [msg, setMsg] = useState("");
  const [hydrated, setHydrated] = useState(false);

  const formPlaceId = placeId || places[0]?.id || "";
  const place = places.find((p) => p.id === formPlaceId);
  const total = scoreOf(scores);

  useEffect(() => {
    if (requestedPlace && places.some((p) => p.id === requestedPlace)) {
      setPlaceId(requestedPlace);
      return;
    }
    if (!placeId && places[0]) setPlaceId(places[0].id);
  }, [requestedPlace, places, placeId]);

  useEffect(() => {
    if (!formPlaceId) return;
    const found = ratings.find((r) => r.placeId === formPlaceId && r.userName === who);
    setScores(found?.scores ?? defaultScores());
    setNote(found?.note ?? "");
    setHydrated(true);
  }, [formPlaceId, who, ratings]);

  async function save() {
    if (!formPlaceId) return;
    await upsertRating({ placeId: formPlaceId, userName: who, scores, note });
    setMsg("Guardada. El ranking ya está actualizado.");
  }

  if (!places.length) {
    return (
      <AppShell kicker="Puntúa de 0 a 10" title="Nueva valoración">
        <div className="pad-block">
          Primero añade un sitio. <Link href="/nuevo-sitio">Nuevo sitio</Link>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell kicker="Puntúa de 0 a 10" title="Nueva valoración">
      <div className="nueva-layout">
        <div className="nueva-form">
          <div className="pad-block">
            <div className="kicker" style={{ marginBottom: 10 }}>
              Sitio
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {places.map((p) => (
                <button
                  key={p.id}
                  className={`chip ${p.id === formPlaceId ? "is-on" : ""}`}
                  onClick={() => {
                    setPlaceId(p.id);
                    setMsg("");
                  }}
                >
                  {p.name}
                </button>
              ))}
            </div>
            <Link href="/nuevo-sitio" className="linkish" style={{ display: "inline-block" }}>
              No está en la lista — añadir sitio
            </Link>
          </div>
          <div className="pad-block">
            <div className="kicker" style={{ marginBottom: 10 }}>
              Quién valora
            </div>
            <div className="user-row">
              {USERS.map((u) => (
                <button
                  key={u}
                  className={`chip ${u === who ? "is-on" : ""}`}
                  onClick={() => {
                    setWho(u);
                    setMsg("");
                  }}
                >
                  {u}
                </button>
              ))}
            </div>
          </div>
          {hydrated
            ? CATEGORIES.map((c) => {
                const val = scores[c.key as CategoryKey];
                return (
                  <div key={c.key} className="cat-row">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 9 }}>
                      <div style={{ fontSize: 14, fontWeight: 700 }}>{c.label}</div>
                      <div className="kicker">{pesoLabel(c.info, c.weight)}</div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                      <input
                        type="range"
                        className="ps"
                        min={0}
                        max={10}
                        step={0.1}
                        value={val}
                        onChange={(e) =>
                          setScores({
                            ...scores,
                            [c.key]: Math.round(parseFloat(e.target.value) * 10) / 10,
                          })
                        }
                        style={{ flex: 1, minWidth: 0 }}
                      />
                      <div style={{ width: 52, textAlign: "right", fontSize: 22, fontWeight: 900, color: scoreColor(val) }}>
                        {val.toFixed(1)}
                      </div>
                    </div>
                  </div>
                );
              })
            : null}
          <div className="pad-block">
            <div className="field">
              <label htmlFor="nota">Nota</label>
              <input
                id="nota"
                className="input"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Una frase y ya"
              />
            </div>
          </div>
          <div className="pad-block hide-desktop" style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div>
              <div className="kicker">Total</div>
              <div className="big-total" style={{ color: scoreColor(total) }}>
                {fmt(total)}
              </div>
            </div>
            <button className="btn btn-primary" style={{ flex: 1 }} onClick={save}>
              Guardar valoración
            </button>
          </div>
          {msg ? (
            <div className="hide-desktop" style={{ padding: "0 18px 18px", fontSize: 12, color: "var(--color-accent-700)", fontWeight: 700 }}>
              {msg}
            </div>
          ) : null}
        </div>
        <aside className="nueva-aside hide-mobile">
          <div className="kicker">Total ponderado</div>
          <div style={{ fontSize: 76, fontWeight: 900, letterSpacing: "-0.05em", lineHeight: 0.95, color: scoreColor(total) }}>
            {fmt(total)}
          </div>
          <div style={{ fontSize: 12, color: "var(--color-neutral-700)", lineHeight: 1.6, marginTop: 12, borderTop: "1px solid var(--color-divider)", paddingTop: 12 }}>
            Para {place?.name}, firmado por {who}. La nota sale de Presentación 10%, Crust 30%, Sabor 40% y Lugar 20%. Precio y tiempo de espera se guardan como dato, no puntúan.
          </div>
          <button className="btn btn-primary btn-block" style={{ marginTop: 20 }} onClick={save}>
            Guardar valoración
          </button>
          {msg ? (
            <div style={{ fontSize: 12, color: "var(--color-accent-700)", fontWeight: 700, marginTop: 12 }}>{msg}</div>
          ) : null}
        </aside>
      </div>
    </AppShell>
  );
}
