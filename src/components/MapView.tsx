"use client";
import { useEffect, useRef, useState } from "react";
import { coordsOf } from "@/lib/geo";
import { slug } from "@/lib/site";

export type MapCity = { city: string; n: number; p: { id: string; name: string; sub: string }[] };
const V = "1.9.4";
const load = () => new Promise<any>((res, rej) => {
  const w = window as any; if (w.L) return res(w.L);
  if (!document.getElementById("lf-css")) { const l = document.createElement("link"); l.id = "lf-css"; l.rel = "stylesheet"; l.href = `https://unpkg.com/leaflet@${V}/dist/leaflet.css`; document.head.appendChild(l); }
  const s = document.createElement("script"); s.src = `https://unpkg.com/leaflet@${V}/dist/leaflet.js`; s.onload = () => res(w.L); s.onerror = rej; document.head.appendChild(s);
});
const esc = (t: string) => t.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] as string));

/** Carte Leaflet / OpenStreetMap : une bulle par ville. Chargée uniquement sur cette page. */
export default function MapView({ cities }: { cities: MapCity[] }) {
  const el = useRef<HTMLDivElement>(null); const [msg, setMsg] = useState("Chargement de la carte…");
  useEffect(() => {
    let map: any, dead = false;
    (async () => {
      try {
        const L = await load(); if (dead || !el.current) return;
        map = L.map(el.current, { scrollWheelZoom: false }).fitBounds([[41.2, -5.2], [51.2, 9.8]]);
        L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 18, attribution: "© les contributeurs d’OpenStreetMap" }).addTo(map);
        const pts: [number, number][] = [];
        await Promise.all(cities.map(async (c) => {
          const k = await coordsOf(c.city); if (!k || dead) return; pts.push(k);
          const size = Math.min(54, 30 + c.n * 3);
          const icon = L.divIcon({ className: "mpin", iconSize: [size, size], html: `<span style="width:${size}px;height:${size}px">${c.n}</span>` });
          const list = c.p.map((p) => `<li><a href="/profil/${p.id}">${esc(p.name)}</a>${p.sub ? ` <small>${esc(p.sub)}</small>` : ""}</li>`).join("");
          L.marker(k, { icon, title: `${c.city} : ${c.n} profil${c.n > 1 ? "s" : ""}` }).addTo(map)
            .bindPopup(`<b>${esc(c.city)}</b> · ${c.n} profil${c.n > 1 ? "s" : ""}<ul class="mpop">${list}</ul><a class="mgo" href="/ville/${slug(c.city)}">Voir tous les profils →</a>`);
        }));
        if (pts.length > 1) map.fitBounds(pts, { padding: [40, 40], maxZoom: 9 }); else if (pts.length === 1) map.setView(pts[0], 8);
        map.once("focus", () => map.scrollWheelZoom.enable());
        setMsg("");
      } catch { setMsg("La carte n’a pas pu se charger. Vérifie ta connexion et recharge la page."); }
    })();
    return () => { dead = true; map?.remove(); };
  }, [cities]);
  return (<div className="mapbox"><div ref={el} className="mapel" role="application" aria-label="Carte des profils par ville" />{msg && <p className="note mapmsg">{msg}</p>}</div>);
}
