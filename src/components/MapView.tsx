"use client";
import { useEffect, useRef, useState } from "react";
import { coordsOf } from "@/lib/geo";
import { slug } from "@/lib/site";
import { thumbUrl } from "@/lib/img";

export type MapProfile = { id: string; name: string; sub: string; g: string; img: string };
export type MapCity = { city: string; n: number; p: MapProfile[] };
const V = "1.9.4"; const ZOOM_PROFILES = 8; const MAXP = 14;
const GI: Record<string, [string, string]> = { fille: ["♀", "#ee4f97"], homme: ["♂", "#3b8be0"], trans: ["⚧", "#9a5cc8"], livecam: ["●", "#e0344a"] };
const load = () => new Promise<any>((res, rej) => {
  const w = window as any; if (w.L) return res(w.L);
  if (!document.getElementById("lf-css")) { const l = document.createElement("link"); l.id = "lf-css"; l.rel = "stylesheet"; l.href = `https://unpkg.com/leaflet@${V}/dist/leaflet.css`; document.head.appendChild(l); }
  const s = document.createElement("script"); s.src = `https://unpkg.com/leaflet@${V}/dist/leaflet.js`; s.onload = () => res(w.L); s.onerror = rej; document.head.appendChild(s);
});
const esc = (t: string) => t.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] as string));

/** Positions (px) des bulles autour du centre de la ville : 1 au centre, puis un ou deux anneaux. */
function ring(k: number): [number, number][] {
  if (k === 1) return [[0, 0]];
  const out: [number, number][] = []; const r1 = k <= 6 ? 46 : 62; const n1 = Math.min(k, 8);
  for (let i = 0; i < n1; i++) { const a = (i / n1) * 2 * Math.PI - Math.PI / 2; out.push([Math.cos(a) * r1, Math.sin(a) * r1]); }
  const n2 = k - n1; for (let i = 0; i < n2; i++) { const a = (i / n2) * 2 * Math.PI - Math.PI / 2 + 0.3; out.push([Math.cos(a) * 118, Math.sin(a) * 118]); }
  return out;
}

/** Carte Leaflet / OpenStreetMap. Dézoomée : une bulle par ville. Zoomée : les profils (photo, pseudo, icône du genre). */
export default function MapView({ cities }: { cities: MapCity[] }) {
  const el = useRef<HTMLDivElement>(null); const [msg, setMsg] = useState("Chargement de la carte…");
  useEffect(() => {
    let map: any, dead = false;
    (async () => {
      try {
        const L = await load(); if (dead || !el.current) return;
        map = L.map(el.current, { scrollWheelZoom: false }).fitBounds([[41.2, -5.2], [51.2, 9.8]]);
        L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 18, attribution: "© les contributeurs d’OpenStreetMap" }).addTo(map);
        const cityLayer = L.layerGroup(), profLayer = L.layerGroup(); const pts: [number, number][] = [];
        await Promise.all(cities.map(async (c) => {
          const k = await coordsOf(c.city); if (!k || dead) return; pts.push(k);
          const size = Math.min(54, 30 + c.n * 3);
          L.marker(k, { icon: L.divIcon({ className: "mpin", iconSize: [size, size], html: `<span style="width:${size}px;height:${size}px">${c.n}</span>` }), title: `${c.city} : ${c.n} profil${c.n > 1 ? "s" : ""}` })
            .addTo(cityLayer).bindPopup(`<b>${esc(c.city)}</b> · ${c.n} profil${c.n > 1 ? "s" : ""}<br><a class="mgo" href="/ville/${slug(c.city)}">Voir tous les profils →</a><br><small>Zoome pour voir les profils.</small>`);
          const shown = c.p.slice(0, MAXP); const pos = ring(shown.length);
          shown.forEach((p, i) => {
            const [dx, dy] = pos[i]; const [gl, gc] = GI[p.g] || ["•", "#999"]; const W = 92, H = 78;
            const img = p.img ? `<img src="${esc(thumbUrl(p.img))}" alt="" onerror="if(!this.dataset.f){this.dataset.f=1;this.src='${esc(p.img)}'}">` : "";
            L.marker(k, { icon: L.divIcon({ className: "mprof", iconSize: [W, H], iconAnchor: [W / 2 - dx, 28 - dy],
              html: `<a href="/profil/${p.id}" title="${esc(p.name)}"><i>${img}<em style="background:${gc}">${gl}</em></i><b>${esc(p.name)}</b></a>` }), zIndexOffset: 500 }).addTo(profLayer);
          });
          if (c.n > shown.length) L.marker(k, { icon: L.divIcon({ className: "mprof", iconSize: [92, 26], iconAnchor: [46, -40], html: `<a class="more" href="/ville/${slug(c.city)}"><b>+${c.n - shown.length} autres</b></a>` }), zIndexOffset: 400 }).addTo(profLayer);
        }));
        const sync = () => { const z = map.getZoom(); if (z >= ZOOM_PROFILES) { map.removeLayer(cityLayer); map.addLayer(profLayer); } else { map.removeLayer(profLayer); map.addLayer(cityLayer); } };
        map.on("zoomend", sync);
        if (pts.length > 1) map.fitBounds(pts, { padding: [40, 40], maxZoom: 9 }); else if (pts.length === 1) map.setView(pts[0], 8);
        sync(); map.once("focus", () => map.scrollWheelZoom.enable());
        setMsg("");
      } catch { setMsg("La carte n’a pas pu se charger. Vérifie ta connexion et recharge la page."); }
    })();
    return () => { dead = true; map?.remove(); };
  }, [cities]);
  return (<div className="mapbox"><div ref={el} className="mapel" role="application" aria-label="Carte des profils par ville" />{msg && <p className="note mapmsg">{msg}</p>}</div>);
}
