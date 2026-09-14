"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Place } from "@/lib/types";
import { fmt } from "@/lib/scoring";

type Pin = Place & { score: number | null; isTop: boolean };

export default function MadridMap({ pins }: { pins: Pin[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (!ref.current) return;
    const map = L.map(ref.current, {
      zoomControl: true,
      attributionControl: true,
    }).setView([40.425, -3.7], 13);

    L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
      attribution: "&copy; OpenStreetMap, &copy; CARTO",
    }).addTo(map);

    const bounds: L.LatLngTuple[] = [];
    pins.forEach((p) => {
      bounds.push([p.lat, p.lng]);
      const label = `${p.name}  ${fmt(p.score)}`.replace(/&/g, "&amp;").replace(/</g, "&lt;");
      const icon = L.divIcon({
        className: "pr-pin",
        html: `<div class="pr-pin-wrap"><div class="pr-pin-label ${p.isTop ? "is-top" : ""}">${label}</div><div class="pr-pin-stem"></div></div>`,
        iconSize: [0, 0],
        iconAnchor: [0, 0],
      });
      L.marker([p.lat, p.lng], { icon, riseOnHover: true })
        .addTo(map)
        .on("click", () => router.push(`/sitio/${p.id}`));
    });
    if (bounds.length > 1) map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });

    return () => {
      map.remove();
    };
  }, [pins, router]);

  return (
    <div className="pr-map-frame">
      <div ref={ref} style={{ height: "100%", width: "100%" }} />
    </div>
  );
}
