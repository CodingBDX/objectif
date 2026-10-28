import { slug } from "./site";
// Coordonnées (lat, lon) des grandes villes de France : sert de repli si le service d'adresses ne répond pas
export const COORDS: Record<string, [number, number]> = {
  paris: [48.8566, 2.3522], marseille: [43.2965, 5.3698], lyon: [45.764, 4.8357], toulouse: [43.6047, 1.4442], nice: [43.7102, 7.262],
  nantes: [47.2184, -1.5536], montpellier: [43.6108, 3.8767], strasbourg: [48.5734, 7.7521], bordeaux: [44.8378, -0.5792], lille: [50.6292, 3.0573],
  rennes: [48.1173, -1.6778], reims: [49.2583, 4.0317], toulon: [43.1242, 5.928], "saint-etienne": [45.4397, 4.3872], "le-havre": [49.4944, 0.1079],
  grenoble: [45.1885, 5.7245], dijon: [47.322, 5.0415], angers: [47.4784, -0.5632], nimes: [43.8367, 4.3601], villeurbanne: [45.7667, 4.8803],
  "clermont-ferrand": [45.7772, 3.087], "le-mans": [48.0061, 0.1996], "aix-en-provence": [43.5297, 5.4474], brest: [48.3904, -4.4861], tours: [47.3941, 0.6848],
  amiens: [49.8941, 2.2958], limoges: [45.8336, 1.2611], annecy: [45.8992, 6.1294], perpignan: [42.6887, 2.8948], metz: [49.1193, 6.1757],
  besancon: [47.2378, 6.0241], orleans: [47.9029, 1.9093], rouen: [49.4432, 1.0993], mulhouse: [47.7508, 7.3359], caen: [49.1829, -0.3707],
  nancy: [48.6921, 6.1844], avignon: [43.9493, 4.8055], "la-rochelle": [46.1603, -1.1511], ajaccio: [41.9192, 8.7386], monaco: [43.7384, 7.4246]
};
export const km = (a: [number, number], b: [number, number]) => {
  const R = 6371, rad = (x: number) => (x * Math.PI) / 180, dLat = rad(b[0] - a[0]), dLon = rad(b[1] - a[1]);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a[0])) * Math.cos(rad(b[0])) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
};
/** Renvoie la ville de l'annuaire la plus proche de la position, ou null. */
export async function nearestCity(lat: number, lon: number, cities: string[]): Promise<string | null> {
  try { // 1) nom de la commune via l'API officielle des adresses (gratuite, sans clé)
    const ac = new AbortController(); const t = setTimeout(() => ac.abort(), 4000);
    const r = await fetch(`https://api-adresse.data.gouv.fr/reverse/?lon=${lon}&lat=${lat}&limit=1`, { signal: ac.signal }); clearTimeout(t);
    const name: string | undefined = (await r.json())?.features?.[0]?.properties?.city;
    const hit = name && cities.find((c) => slug(c) === slug(name));
    if (hit) return hit;
  } catch {}
  // 2) sinon la ville connue la plus proche, à moins de 80 km
  let best: string | null = null, bd = 80;
  for (const c of cities) { const k = COORDS[slug(c)]; if (!k) continue; const d = km([lat, lon], k); if (d < bd) { bd = d; best = c; } }
  return best;
}

const cc = new Map<string, [number, number] | null>();
/** Coordonnées d'une commune : table locale, sinon API officielle geo.api.gouv.fr (mémorisées). */
export async function coordsOf(name: string): Promise<[number, number] | null> {
  const k = slug(name); if (COORDS[k]) return COORDS[k]; if (cc.has(k)) return cc.get(k)!;
  try {
    const ls = localStorage.getItem("hp_c_" + k); if (ls) { const v = JSON.parse(ls); cc.set(k, v); return v; }
  } catch {}
  try {
    const r = await fetch(`https://geo.api.gouv.fr/communes?nom=${encodeURIComponent(name)}&fields=centre&boost=population&limit=1`);
    const j = await r.json(); const c = j?.[0]?.centre?.coordinates; const v: [number, number] | null = c ? [c[1], c[0]] : null;
    cc.set(k, v); try { localStorage.setItem("hp_c_" + k, JSON.stringify(v)); } catch {} return v;
  } catch { return null; }
}

/** Coordonnées d'une adresse postale (API officielle des adresses, gratuite) ; mémorisées dans le navigateur. */
export async function coordsOfAddress(addr: string): Promise<[number, number] | null> {
  const k = "hp_a_" + slug(addr);
  try { const ls = localStorage.getItem(k); if (ls) return JSON.parse(ls); } catch {}
  try {
    const r = await fetch(`https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(addr)}&limit=1`);
    const c = (await r.json())?.features?.[0]?.geometry?.coordinates; const v: [number, number] | null = c ? [c[1], c[0]] : null;
    try { if (v) localStorage.setItem(k, JSON.stringify(v)); } catch {} return v;
  } catch { return null; }
}
