"use client";
import { useEffect, useRef, useState } from "react";
import { ZONE_RADIUS } from "@/lib/quartiers";

const V = "1.9.4";
const load = () => new Promise<any>((res, rej) => {
  const w = window as any; if (w.L) return res(w.L);
  if (!document.getElementById("lf-css")) { const l = document.createElement("link"); l.id = "lf-css"; l.rel = "stylesheet"; l.href = `https://unpkg.com/leaflet@${V}/dist/leaflet.css`; document.head.appendChild(l); }
  const s = document.createElement("script"); s.src = `https://unpkg.com/leaflet@${V}/dist/leaflet.js`; s.onload = () => res(w.L); s.onerror = rej; document.head.appendChild(s);
});

/** Zone approximative : un grand cercle sur un quartier (jamais de point ni de rue). Chargée seulement quand elle devient visible. */
export default function ZoneMap({ lat, lon, label }: { lat: number; lon: number; label: string }) {
  const box = useRef<HTMLDivElement>(null); const [go, setGo] = useState(false); const [err, setErr] = useState("");
  useEffect(() => {
    const el = box.current; if (!el) return;
    if (!("IntersectionObserver" in window)) { setGo(true); return; }
    const io = new IntersectionObserver((e) => { if (e[0].isIntersecting) { setGo(true); io.disconnect(); } }, { rootMargin: "200px" });
    io.observe(el); return () => io.disconnect();
  }, []);
  useEffect(() => {
    if (!go || !box.current) return; let map: any, dead = false;
    (async () => {
      try {
        const L = await load(); if (dead || !box.current) return;
        map = L.map(box.current, { zoomControl: false, dragging: false, scrollWheelZoom: false, doubleClickZoom: false, touchZoom: false, boxZoom: false, keyboard: false, attributionControl: true });
        L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 14, attribution: "© OpenStreetMap" }).addTo(map);
        const c = L.circle([lat, lon], { radius: ZONE_RADIUS, color: "#d63384", weight: 2, fillColor: "#ee4f97", fillOpacity: 0.22 }).addTo(map);
        map.invalidateSize(); map.fitBounds(c.getBounds(), { padding: [10, 10], maxZoom: 14 }); setTimeout(() => { if (!dead && map) { map.invalidateSize(); map.fitBounds(c.getBounds(), { padding: [10, 10], maxZoom: 14 }); } }, 300);
      } catch (e) { setErr(e instanceof Error ? e.message.slice(0, 80) : "chargement impossible"); }
    })();
    return () => { dead = true; if (map) map.remove(); };
  }, [go, lat, lon]);
  return <div className="zmap" role="img" aria-label={`Zone approximative : ${label}`}>{err ? <p className="note">Carte indisponible ({err}). Recharge la page.</p> : <div ref={box} className="zmapc" />}</div>;
}
