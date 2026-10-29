import { slug } from "./site";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
type P = { id: string; name: string; city: string; vip?: boolean; genre?: string };

/** Segment d'adresse d'un profil : « camille-bordeaux-1a2b3c4d » pour les VIP, l'identifiant simple sinon. */
export function profileSeg(p: P): string {
  if (!p.vip) return p.id;
  const parts = [slug(p.name), p.genre === "livecam" ? "" : slug(p.city)].filter(Boolean);
  return [...parts, p.id.slice(0, 8)].join("-");
}
export const profilePath = (p: P) => `/profil/${profileSeg(p)}`;

/** Ce que contient l'adresse : un identifiant complet, ou le début (8 caractères) de l'identifiant d'une adresse « jolie ». */
export const safeDecode = (s: string) => { try { return decodeURIComponent(s); } catch { return s; } };
export function parseProfileParam(param: string): { id?: string; prefix?: string } {
  const s = safeDecode(param).toLowerCase();
  if (UUID.test(s)) return { id: s };
  const m = s.match(/-([0-9a-f]{8})$/);
  return m ? { prefix: m[1] } : {};
}
/** Bornes d'identifiants qui commencent par ce préfixe (recherche rapide sur la clé primaire). */
export const prefixRange = (prefix: string) => [`${prefix}-0000-0000-0000-000000000000`, `${prefix}-ffff-ffff-ffff-ffffffffffff`] as const;
