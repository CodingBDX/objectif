import { slug } from "./site";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const GENRES = ["fille", "homme", "trans", "livecam"];
type P = { id: string; name: string; city: string; vip?: boolean; genre?: string; friendly_url?: boolean | null; url_slug?: string | null };

/** Adresse officielle d'un profil : /fille/bordeaux/camille si c'est un VIP qui a coché l'option, /profil/<identifiant> sinon. */
export function profilePath(p: P): string {
  if (p.vip && p.friendly_url && p.url_slug && p.genre && GENRES.includes(p.genre)) {
    return `/${p.genre}/${p.genre === "livecam" ? "en-ligne" : slug(p.city) || "france"}/${p.url_slug}`;
  }
  return `/profil/${p.id}`;
}

/** Ce que contient l'adresse /profil/… : un identifiant complet, ou le début (8 caractères) d'une ancienne adresse « jolie ». */
export const safeDecode = (s: string) => { try { return decodeURIComponent(s); } catch { return s; } };
export function parseProfileParam(param: string): { id?: string; prefix?: string } {
  const s = safeDecode(param).toLowerCase();
  if (UUID.test(s)) return { id: s };
  const m = s.match(/-([0-9a-f]{8})$/);
  return m ? { prefix: m[1] } : {};
}
/** Bornes d'identifiants qui commencent par ce préfixe (recherche rapide sur la clé primaire). */
export const prefixRange = (prefix: string) => [`${prefix}-0000-0000-0000-000000000000`, `${prefix}-ffff-ffff-ffff-ffffffffffff`] as const;
