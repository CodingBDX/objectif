/** Distance entre deux communes (API officielle, 1 petite requête par ville, mise en cache). */
const cache = new Map<string, Promise<[number, number] | null>>();
export const MAX_KM_VIP = 100;
export const MAX_KM_STD = 20;

import { extraCity } from "./extraCities";
export function cityCentre(name: string): Promise<[number, number] | null> {
  const ex = extraCity(name); if (ex) return Promise.resolve([ex.lon, ex.lat]);
  const k = name.trim().toLowerCase();
  if (!cache.has(k)) {
    cache.set(k, (async () => {
      try {
        const r = await fetch(`https://geo.api.gouv.fr/communes?nom=${encodeURIComponent(name.trim())}&fields=centre&boost=population&limit=1`);
        if (!r.ok) return null;
        const j = (await r.json()) as { centre?: { coordinates: [number, number] } }[];
        return j[0]?.centre?.coordinates || null;
      } catch { return null; }
    })());
  }
  return cache.get(k)!;
}

/** Mémorise le centre exact d'une commune choisie dans une liste (évite de confondre deux communes de même nom, ex. Saint-Denis 93 et La Réunion). */
export function primeCity(name: string, centre: [number, number]) { cache.set(name.trim().toLowerCase(), Promise.resolve(centre)); }

export function km(a: [number, number], b: [number, number]) {
  const R = 6371, rad = (x: number) => (x * Math.PI) / 180;
  const dLat = rad(b[1] - a[1]), dLon = rad(b[0] - a[0]);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a[1])) * Math.cos(rad(b[1])) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/** true si la ville est à plus de `max` km de la ville de base (false si on ne peut pas savoir). */
export async function tooFar(base: string, other: string, max: number) {
  if (!base || !other) return false;
  const [a, b] = await Promise.all([cityCentre(base), cityCentre(other)]);
  return !!a && !!b && km(a, b) > max;
}
