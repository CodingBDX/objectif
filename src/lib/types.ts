export type Genre = "fille" | "homme" | "trans" | "livecam";
export const CATS: Record<string, string> = { fille: "Fille", homme: "Homme", trans: "Trans", livecam: "Livecam" };
export const CIC: Record<string, string> = { fille: "fille", homme: "homme", trans: "trans", livecam: "live" };
export const SPECIALTIES = ["Portrait","Mode","Mariage","Studio","Lifestyle","Boudoir","Glamour","Artistique","Nu artistique","Urbain","Nature","Voyage","Événementiel","Produit","Culinaire","Sport","Danse","Musique","Vidéo clip","Court-métrage","Drone","Retouche","Illustration","Peinture","Maquillage","Stylisme","Tatouage","Livecam","Streaming","Réseaux sociaux"];
export type Trip = { city: string; from: string; to: string };
export type Hours = Record<string, [string, string] | null>;
export type Profile = {
  id: string; name: string; genre: Genre; city: string; more: string[]; specialties: string[]; bio: string;
  phone: string | null; instagram: string | null; snapchat: string | null; tiktok: string | null; site: string | null;
  h24: boolean; hours: Hours; trips: Trip[];
  photos: string[]; video: string | null; vlink: string | null; vip: boolean; verified: boolean; paused: boolean; created_at: string; views?: number; favs?: number; tarif?: number | null; tarif_30?: number | null; tarif_60?: number | null;
};
export const lab = (p: Profile) => CATS[p.genre] || "";
export const isNew = (p: Profile) => { const d = Date.now() - new Date(p.created_at).getTime(); return d >= 0 && d < 30 * 864e5; };
/** Ville de base uniquement : les compteurs, filtres et pages ville ne comptent que les profils basés dans la ville. */
export const cityList = (p: Profile) => [p.city];
export const cap = (s: string) => (s ? s[0].toUpperCase() + s.slice(1) : s);
