import { cap, cityList, Profile } from "./types";
import { km } from "./geo";

type Com = { nom: string; population?: number; centre?: { coordinates: [number, number] } };
const GEO = "https://geo.api.gouv.fr";
const get = async (u: string) => { try { const r = await fetch(u, { next: { revalidate: 86400 }, signal: AbortSignal.timeout(2500) }); return r.ok ? await r.json() : null; } catch { return null; } };

/** Les 3 communes les plus proches (même département, ≥ 2 000 habitants), avec ou sans profil. API officielle, mise en cache 24 h. */
export async function nearbyCommunes(city: string, n = 3): Promise<string[]> {
  const me: Com[] | null = await get(`${GEO}/communes?nom=${encodeURIComponent(city)}&fields=nom,centre,codeDepartement&boost=population&limit=1`);
  const m = me?.[0] as (Com & { codeDepartement?: string }) | undefined; if (!m?.centre || !m.codeDepartement) return [];
  const all: Com[] | null = await get(`${GEO}/communes?codeDepartement=${m.codeDepartement}&fields=nom,centre,population`);
  if (!all) return [];
  const c0: [number, number] = [m.centre.coordinates[1], m.centre.coordinates[0]];
  return all.filter((x) => x.nom !== m.nom && x.centre && (x.population || 0) >= 2000)
    .map((x) => ({ nom: x.nom, d: km(c0, [x.centre!.coordinates[1], x.centre!.coordinates[0]]) })).sort((a, b) => a.d - b.d).slice(0, n).map((x) => x.nom);
}

const GP: Record<string, [string, string]> = { fille: ["fille", "filles"], homme: ["homme", "hommes"], trans: ["profil trans", "profils trans"], livecam: ["livecam", "livecam"] };
const list = (a: string[]) => (a.length > 1 ? a.slice(0, -1).join(", ") + " et " + a[a.length - 1] : a[0] || "");

/** Phrase d'intro d'une page ville : nombre de profils, genres présents, 5 spécialités, 3 villes proches. */
export async function cityIntro(city: string, profiles: Profile[]): Promise<string> {
  const ps = profiles.filter((p) => cityList(p).includes(city)); const n = ps.length;
  const gc: Record<string, number> = {}; ps.forEach((p) => { gc[p.genre] = (gc[p.genre] || 0) + 1; });
  const genres = Object.entries(gc).sort((a, b) => b[1] - a[1]).map(([g, k]) => `${k} ${(GP[g] || [g, g])[k > 1 ? 1 : 0]}`);
  const sc: Record<string, number> = {}; ps.forEach((p) => p.specialties.forEach((s) => { const k = s.toLowerCase(); sc[k] = (sc[k] || 0) + 1; }));
  const specs = Object.entries(sc).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "fr")).slice(0, 5).map(([s]) => cap(s));
  const near = await nearbyCommunes(city, 3);
  return `${n} profil${n > 1 ? "s" : ""} à ${city}` + (genres.length ? ` (${list(genres)})` : "") + ", avec leurs disponibilités et leurs prochains passages."
    + (specs.length ? ` Spécialités les plus présentes : ${list(specs)}.` : "") + (near.length ? ` Villes proches : ${list(near)}.` : "");
}

/** Région de chaque ville : lue d'abord dans les profils (colonne `region`, instantané). L'API officielle (cache 7 jours, 1,2 s max) ne sert que pour les villes sans région enregistrée. */
export async function regionMap(profiles: Profile[]): Promise<Record<string, string>> {
  const out: Record<string, string> = {};
  profiles = profiles.filter((p) => p.genre !== "livecam");
  profiles.forEach((p) => { if (p.region) out[p.city] = p.region; });
  const missing = Array.from(new Set(profiles.map((p) => p.city))).filter((c) => !out[c]).slice(0, 40);
  await Promise.all(missing.map(async (c) => {
    try {
      const r = await fetch(`${GEO}/communes?nom=${encodeURIComponent(c)}&fields=nom,region&boost=population&limit=1`, { next: { revalidate: 604800 }, signal: AbortSignal.timeout(1200) });
      if (!r.ok) return; const j = (await r.json()) as { region?: { nom: string } }[];
      if (j?.[0]?.region?.nom) out[c] = j[0].region.nom;
    } catch {}
  }));
  return out;
}
