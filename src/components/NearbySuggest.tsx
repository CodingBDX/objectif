"use client";
import { useEffect, useState } from "react";
import { useT } from "@/lib/i18n";
import { km, primeCity } from "@/lib/dist";
import { geoNom, withDep } from "@/lib/cityname";

type Com = { nom: string; population?: number; centre?: { coordinates: [number, number] }; codeDepartement?: string; codeRegion?: string };
const cache = new Map<string, Promise<{ nom: string; d: number; pop: number; at: [number, number] }[]>>();

/** Communes proches de la ville de base (API officielle, mise en cache), les plus peuplées d'abord. */
function load(base: string, maxKm: number) {
  const key = `${base.toLowerCase()}|${maxKm}`;
  if (!cache.has(key)) cache.set(key, (async () => {
    try {
      const f = "nom,centre,population,codeDepartement,codeRegion";
      const r0 = await fetch(`https://geo.api.gouv.fr/communes?${geoNom(base)}&fields=${f}&boost=population&limit=1`);
      const me = ((await r0.json()) as Com[])[0]; const c0 = me?.centre?.coordinates; if (!c0) return [];
      // Île-de-France et villes sans voisins dans leur département : on cherche dans toute la région ; sinon dans le département (≤ 20 km) ou la région (VIP).
      const wide = maxKm > 20 || me.codeRegion === "11";
      const r = await fetch(`https://geo.api.gouv.fr/communes?${wide ? `codeRegion=${me.codeRegion}` : `codeDepartement=${me.codeDepartement}`}&fields=${f}`);
      const all = (await r.json()) as Com[];
      return all.filter((c) => c.centre && c.nom.toLowerCase() !== me.nom.toLowerCase()).map((c) => ({ nom: withDep(c.nom, c.codeDepartement, all), pop: c.population || 0, d: km(c0, c.centre!.coordinates), at: c.centre!.coordinates }))
        .filter((c) => c.d <= maxKm).sort((a, b) => b.pop - a.pop).slice(0, 30);
    } catch { return []; }
  })());
  return cache.get(key)!;
}

/** Villes proches à cliquer pour remplir « Villes supplémentaires » sans chercher à la main. */
export default function NearbySuggest({ city, maxKm, picked, full, onAdd }: { city: string; maxKm: number; picked: string[]; full: boolean; onAdd: (c: string) => void }) {
  const { tr } = useT(); const [list, setList] = useState<{ nom: string; d: number; pop: number; at: [number, number] }[]>([]); const [all, setAll] = useState(false);
  useEffect(() => {
    setAll(false); const c = city.trim(); if (c.length < 3) { setList([]); return; }
    let dead = false; const t = setTimeout(() => { load(c, maxKm).then((l) => { if (!dead) setList(l); }); }, 500);
    return () => { dead = true; clearTimeout(t); };
  }, [city, maxKm]);
  const shown = list.filter((x) => !picked.some((p) => p.trim().toLowerCase() === x.nom.toLowerCase()));
  if (!shown.length) return null;
  return (
    <div className="nsug" aria-label={tr("Villes proches de {c}", { c: city })}>
      <span className="nsugh">{tr("📍 Villes proches de {c} (clique pour ajouter) :", { c: city.trim() })}</span>
      {shown.slice(0, all ? 30 : 10).map((x) => <button key={x.nom} type="button" className="nbub" disabled={full} title={x.nom} onClick={() => { primeCity(x.nom, x.at); onAdd(x.nom); }}>+ {x.nom}</button>)}
      {shown.length > 10 && <button type="button" className="nbmore" onClick={() => setAll(!all)}>{all ? tr("Voir moins") : tr("Voir plus ({n})", { n: shown.length })}</button>}
      {full && <span className="nsugf">{tr("Toutes les places sont prises : retire une ville pour en ajouter.")}</span>}
    </div>
  );
}
