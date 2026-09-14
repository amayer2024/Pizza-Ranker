"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { usePizza } from "@/components/PizzaProvider";
import type { Place, PlaceSearchHit } from "@/lib/types";

export function NuevoSitioScreen() {
  const router = useRouter();
  const { addPlace, places } = usePizza();
  const [query, setQuery] = useState("");
  const [hits, setHits] = useState<PlaceSearchHit[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchErr, setSearchErr] = useState("");
  const [name, setName] = useState("");
  const [barrio, setBarrio] = useState("");
  const [address, setAddress] = useState("");
  const [lat, setLat] = useState(40.4168);
  const [lng, setLng] = useState(-3.7038);
  const [googlePlaceId, setGooglePlaceId] = useState<string | null>(null);
  const [msg, setMsg] = useState("");
  const [added, setAdded] = useState<Place | null>(null);

  async function search(e: React.FormEvent) {
    e.preventDefault();
    setSearchErr("");
    setSearching(true);
    try {
      const res = await fetch(`/api/places/search?q=${encodeURIComponent(query)}`);
      const data = (await res.json()) as { results?: PlaceSearchHit[]; error?: string };
      if (!res.ok) throw new Error(data.error || "No se pudo buscar");
      setHits(data.results ?? []);
      if (!(data.results ?? []).length) setSearchErr("Nada en Madrid con ese nombre. Rellena a mano.");
    } catch (err) {
      setSearchErr(err instanceof Error ? err.message : "Error de búsqueda");
    } finally {
      setSearching(false);
    }
  }

  function pick(hit: PlaceSearchHit) {
    setName(hit.name);
    setBarrio(hit.barrio);
    setAddress(hit.address);
    setLat(hit.lat);
    setLng(hit.lng);
    setGooglePlaceId(hit.id.startsWith("osm-") ? null : hit.id);
    setHits([]);
    setMsg("");
  }

  async function save() {
    if (!name.trim()) {
      setMsg("Ponle nombre al sitio.");
      return;
    }
    const place = await addPlace({
      name: name.trim(),
      barrio: barrio.trim() || "Madrid",
      address: address.trim() || "Dirección pendiente",
      priceEur: 0,
      waitMin: 0,
      lat,
      lng,
      googlePlaceId,
    });
    setAdded(place);
  }

  const preview = `${name || "Sin nombre"} · ${barrio || "barrio"}`;

  return (
    <AppShell kicker="Alta en la lista" title="Nuevo sitio" backHref="/nueva">
      <div className="sitio-layout">
        <div className="sitio-form">
          <form className="pad-block" onSubmit={search}>
            <div className="kicker" style={{ marginBottom: 10 }}>
              Buscar en Madrid
            </div>
            <div className="field">
              <label htmlFor="q">Nombre del sitio</label>
              <input
                id="q"
                className="input"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Can Pizza Chamberí"
              />
            </div>
            <button className="btn btn-secondary btn-block" type="submit" disabled={searching}>
              {searching ? "Buscando…" : "Buscar pizzería"}
            </button>
            {searchErr ? (
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--color-accent-700)", marginTop: 10 }}>{searchErr}</div>
            ) : null}
            {hits.map((h) => (
              <button type="button" key={h.id} className="search-hit" onClick={() => pick(h)}>
                <strong>{h.name}</strong>
                <span>
                  {h.address} · {h.barrio}
                </span>
              </button>
            ))}
            <p className="text-muted" style={{ fontSize: 12, marginTop: 12 }}>
              Elige un resultado para rellenar nombre, dirección y pin. Precio y espera los puntúas después, cada uno en su valoración.
              {places.length ? ` ${places.length} sitios ya en la lista.` : ""}
            </p>
          </form>
          <div className="pad-block">
            <div className="field">
              <label htmlFor="np-n">Nombre</label>
              <input id="np-n" className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Can Pizza" />
            </div>
            <div className="field" style={{ marginTop: 12 }}>
              <label htmlFor="np-b">Barrio</label>
              <input id="np-b" className="input" value={barrio} onChange={(e) => setBarrio(e.target.value)} placeholder="Chamberí" />
            </div>
            <div className="field" style={{ marginTop: 12 }}>
              <label htmlFor="np-d">Dirección</label>
              <input id="np-d" className="input" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="C. de Alonso Cano 45" />
            </div>
          </div>
        </div>
        <aside className="sitio-aside">
          <div className="kicker">Quedará como</div>
          <div style={{ fontSize: 18, fontWeight: 800, marginTop: 6, lineHeight: 1.3 }}>{preview}</div>
          <button className="btn btn-primary btn-block" style={{ marginTop: 16 }} onClick={save}>
            Añadir a la lista
          </button>
          {msg ? <div style={{ fontSize: 12, fontWeight: 700, color: "var(--color-accent-700)", marginTop: 12 }}>{msg}</div> : null}
        </aside>
      </div>

      {added ? (
        <div className="dialog-backdrop" role="presentation">
          <div className="dialog" role="dialog" aria-modal="true" aria-labelledby="rate-title">
            <div className="dialog-title" id="rate-title">
              ¿Valorar {added.name}?
            </div>
            <p className="dialog-body">
              {added.name} ya está en la lista. Dale tu nota ahora — presentación, crust, sabor, lugar, precio y espera.
            </p>
            <div className="dialog-actions">
              <button className="btn btn-secondary" type="button" onClick={() => router.push("/")}>
                Ahora no
              </button>
              <button
                className="btn btn-primary"
                type="button"
                onClick={() => router.push(`/nueva?place=${encodeURIComponent(added.id)}`)}
              >
                Valorar {added.name}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </AppShell>
  );
}
