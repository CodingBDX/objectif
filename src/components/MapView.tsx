"use client";
import { useEffect, useRef, useState } from "react";
import { coordsOf, coordsOfAddress } from "@/lib/geo";
import { slug } from "@/lib/site";
import { thumbUrl } from "@/lib/img";
import { ZONE_RADIUS, type MapZone } from "@/lib/quartiers";

export type MapProfile = { id: string; name: string; sub: string; g: string; img: string };
export type MapAsso = { slug: string; name: string; address: string; city: string; phone: string | null };
export type MapLodging = { id: string; title: string; city: string; area: string | null; lat: number; lon: number; day: number | null; week: number | null; month: number | null };
export type MapCity = { city: string; n: number; p: MapProfile[] };
const V = "1.9.4"; const ZOOM_PROFILES = 7; const MAXP = 14;
const GI: Record<string, [string, string]> = { fille: ["♀", "#ee4f97"], homme: ["♂", "#3b8be0"], trans: ["⚧", "#9a5cc8"], livecam: ["●", "#e0344a"] };
const load = () => new Promise<any>((res, rej) => {
  const w = window as any; if (w.L) return res(w.L);
  if (!document.getElementById("lf-css")) { const l = document.createElement("link"); l.id = "lf-css"; l.rel = "stylesheet"; l.href = `https://unpkg.com/leaflet@${V}/dist/leaflet.css`; document.head.appendChild(l); }
  const s = document.createElement("script"); s.src = `https://unpkg.com/leaflet@${V}/dist/leaflet.js`; s.onload = () => res(w.L); s.onerror = rej; document.head.appendChild(s);
});
const esc = (t: string) => t.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] as string));

/** Positions (px) des bulles autour du centre de la ville : 1 au centre, puis un ou deux anneaux. */
function ring(k: number, f = 1): [number, number][] {
  if (k === 1) return [[0, 0]];
  const out: [number, number][] = []; const r1 = (k <= 6 ? 46 : 62) * f; const n1 = Math.min(k, 8);
  for (let i = 0; i < n1; i++) { const a = (i / n1) * 2 * Math.PI - Math.PI / 2; out.push([Math.cos(a) * r1, Math.sin(a) * r1]); }
  const n2 = k - n1; for (let i = 0; i < n2; i++) { const a = (i / n2) * 2 * Math.PI - Math.PI / 2 + 0.3; out.push([Math.cos(a) * 118 * f, Math.sin(a) * 118 * f]); }
  return out;
}

/** Carte Leaflet / OpenStreetMap. Dézoomée : une bulle par ville. Zoomée : les profils (photo, pseudo, icône du genre). */
export default function MapView({ cities, assos = [], lodgings = [], zones = [] }: { cities: MapCity[]; assos?: MapAsso[]; lodgings?: MapLodging[]; zones?: MapZone[] }) {
  const el = useRef<HTMLDivElement>(null); const [msg, setMsg] = useState("Chargement de la carte…");
  useEffect(() => {
    let map: any, dead = false;
    (async () => {
      try {
        const L = await load(); if (dead || !el.current) return;
        map = L.map(el.current, { scrollWheelZoom: false }).fitBounds([[41.2, -5.2], [51.2, 9.8]]);
        L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 18, attribution: "© les contributeurs d’OpenStreetMap" }).addTo(map);
        const cityLayer = L.layerGroup(), profLayer = L.layerGroup(); const pts: [number, number][] = []; const data: { c: MapCity; k: [number, number] }[] = [];
        await Promise.all(cities.map(async (c) => {
          const k = await coordsOf(c.city); if (!k || dead) return; pts.push(k);
          const size = Math.min(54, 30 + c.n * 3);
          L.marker(k, { icon: L.divIcon({ className: "mpin", iconSize: [size, size], html: `<span style="width:${size}px;height:${size}px">${c.n}</span>` }), title: `${c.city} : ${c.n} profil${c.n > 1 ? "s" : ""}` })
            .addTo(cityLayer).bindPopup(`<b>${esc(c.city)}</b> · ${c.n} profil${c.n > 1 ? "s" : ""}<br><a class="mgo" href="/ville/${slug(c.city)}">Voir tous les profils →</a><br><small>Zoome pour voir les profils.</small>`);
          data.push({ c, k });
        }));
        // associations de soutien (visibles seulement des escortes) : à leur adresse d'accueil, à tous les niveaux de zoom
        await Promise.all(assos.map(async (a) => {
          const k = (await coordsOfAddress(`${a.address} ${/\d{5}/.test(a.address) ? "" : a.city}`.trim())) || (await coordsOf(a.city)); if (!k || dead) return; pts.push(k);
          L.marker(k, { icon: L.divIcon({ className: "masso", iconSize: [38, 38], iconAnchor: [19, 19], html: "<span>🤝</span>" }), title: a.name, zIndexOffset: 900 })
            .addTo(map).bindPopup(`<b>${esc(a.name)}</b><br>📍 ${esc(a.address)}${a.phone ? `<br>📞 ${esc(a.phone)}` : ""}<br><a class="mgo" href="/associations/${esc(a.slug)}">Voir la fiche →</a>`);
        }));
        // logements (profils VIP + vérifiés, annonce validée) : au centre de la ville, jamais à l'adresse
        const seen: Record<string, number> = {};
        lodgings.forEach((l) => {
          const key = `${l.lat.toFixed(2)},${l.lon.toFixed(2)}`; const i = seen[key] = (seen[key] || 0) + 1; const k: [number, number] = [l.lat + (i - 1) * 0.006, l.lon + (i - 1) * 0.006]; pts.push(k);
          const pr = [l.day ? `${l.day} €/jour` : "", l.week ? `${l.week} €/sem.` : "", l.month ? `${l.month} €/mois` : ""].filter(Boolean).join(" · ");
          L.marker(k, { icon: L.divIcon({ className: "masso", iconSize: [38, 38], iconAnchor: [19, 19], html: "<span>🏠</span>" }), title: l.title, zIndexOffset: 800 })
            .addTo(map).bindPopup(`<b>${esc(l.title)}</b><br>📍 ${esc(l.city)}${l.area ? " · " + esc(l.area) : ""}${pr ? `<br>${esc(pr)}` : ""}<br><a class="mgo" href="/logements/${esc(l.id)}">Voir le logement →</a>`);
        });
        // zones de rue (quartiers) : grands cercles roses, visibles à partir d'un zoom « ville » ; jamais de point exact
        const zoneLayer = L.layerGroup();
        zones.forEach((z) => {
          L.circle([z.lat, z.lon], { radius: ZONE_RADIUS, color: "#d63384", weight: 2, dashArray: "6 6", fillColor: "#ee4f97", fillOpacity: 0.18 }).addTo(zoneLayer)
            .bindPopup(`<b>${esc(z.q)}</b> · ${esc(z.city)}<br>Zone approximative<br>${z.p.map((p) => `<a class="mgo" href="/profil/${esc(p.id)}">${esc(p.name)}</a>`).join(" · ")}`);
          L.marker([z.lat, z.lon], { icon: L.divIcon({ className: "mpin", iconSize: [34, 34], html: `<span style="width:34px;height:34px">${z.n}</span>` }), title: `${z.q} : ${z.n} profil${z.n > 1 ? "s" : ""}` }).addTo(zoneLayer)
            .bindPopup(`<b>${esc(z.q)}</b> · ${esc(z.city)}<br>Zone approximative<br>${z.p.map((p) => `<a class="mgo" href="/profil/${esc(p.id)}">${esc(p.name)}</a>`).join(" · ")}`);
        });
        // les profils s'écartent quand on zoome : le rayon des cercles grandit avec le zoom
        const draw = () => {
          profLayer.clearLayers(); const sc0 = window.innerWidth < 700 ? 0.7 : 1; const zs = Math.min(2.4, Math.max(1, 1 + (map.getZoom() - ZOOM_PROFILES) * 0.3)); const sc = sc0 * zs; const f = Math.min(5, Math.max(0.9, 1 + (map.getZoom() - ZOOM_PROFILES) * 0.45) * zs) * sc0;
          data.forEach(({ c, k }) => {
            const shown = c.p.slice(0, MAXP); const pos = ring(shown.length, f);
            shown.forEach((p, i) => {
              const [dx, dy] = pos[i]; const [gl, gc] = GI[p.g] || ["•", "#999"]; const W = Math.round(92 * sc), H = Math.round(78 * sc);
              const img = p.img ? `<img src="${esc(thumbUrl(p.img))}" referrerpolicy="no-referrer" alt="" onerror="if(!this.dataset.f){this.dataset.f=1;this.src='${esc(p.img)}'}">` : "";
              L.marker(k, { icon: L.divIcon({ className: "mprof", iconSize: [W, H], iconAnchor: [W / 2 - dx, 28 * sc - dy],
                html: `<a href="/profil/${p.id}" title="${esc(p.name)}" style="--s:${sc}"><i>${img}<em style="background:${gc}">${gl}</em></i><b>${esc(p.name)}</b></a>` }), zIndexOffset: 500 }).addTo(profLayer);
            });
            if (c.n > shown.length) L.marker(k, { icon: L.divIcon({ className: "mprof", iconSize: [92, 26], iconAnchor: [46, -40], html: `<a class="more" href="/ville/${slug(c.city)}"><b>+${c.n - shown.length} autres</b></a>` }), zIndexOffset: 400 }).addTo(profLayer);
          });
        };
        const sync = () => { const z = map.getZoom(); if (z >= 9) map.addLayer(zoneLayer); else map.removeLayer(zoneLayer); if (z >= ZOOM_PROFILES) { draw(); map.removeLayer(cityLayer); map.addLayer(profLayer); } else { map.removeLayer(profLayer); map.addLayer(cityLayer); } };
        map.on("zoomend", sync);
        if (pts.length > 1) map.fitBounds(pts, { padding: [40, 40], maxZoom: 9 }); else if (pts.length === 1) map.setView(pts[0], 8);
        sync(); map.once("focus", () => map.scrollWheelZoom.enable());
        setMsg("");
      } catch { setMsg("La carte n’a pas pu se charger. Vérifie ta connexion et recharge la page."); }
    })();
    return () => { dead = true; map?.remove(); };
  }, [cities, assos, lodgings, zones]);
  return (<div className="mapbox"><div ref={el} className="mapel" role="application" aria-label="Carte des profils par ville" />{msg && <p className="note mapmsg">{msg}</p>}</div>);
}
