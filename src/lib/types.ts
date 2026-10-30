export type Genre = "fille" | "homme" | "trans" | "livecam";
export const CATS: Record<string, string> = { fille: "Fille", homme: "Homme", trans: "Trans", livecam: "Livecam" };
export const CIC: Record<string, string> = { fille: "fille", homme: "homme", trans: "trans", livecam: "live" };
export const SPECIALTIES = ["Girlfriend experience","Accompagnement","Dîner","Soirée","Week-end","Voyage","Massage","Massage tantrique","Relaxation","Sensuel","Câlin","Duo","Couple","Rôle play","Lingerie","Tenues sur demande","Strip-tease","Danse","Glamour","Élégante","Naturelle","Discrète","Complice","Fétichisme","Domination","Soumission","Pieds","Livecam","Sortie culturelle","Langues & conversation"];
export type Trip = { city: string; from: string; to: string };
export type Hours = Record<string, [string, string] | null>;
export type Profile = {
  id: string; name: string; genre: Genre; city: string; more: string[]; specialties: string[]; region?: string | null; age?: number | null; height_cm?: number | null; weight_kg?: number | null; ethnicity?: string | null; nationality?: string | null; district?: string | null; crown?: number; points?: number; street?: boolean; zone?: string | null; zone_map?: boolean; zone_map_blocked?: boolean; street_hours?: string | null; whatsapp?: boolean; sms?: boolean; friendly_url?: boolean; url_slug?: string | null; slogan?: string | null; hair?: string | null; eyes?: string | null; bra?: string | null; smoker?: string | null; receives?: boolean; rates?: Rate[] | null; pay_wero?: string | null; pay_paypal?: string | null; travels?: boolean; drinker?: string | null; languages?: string[]; bio: string;
  phone: string | null; instagram: string | null; snapchat: string | null; tiktok: string | null; site: string | null;
  h24: boolean; hours: Hours; trips: Trip[]; trip_public?: boolean;
  photos: string[]; video: string | null; vlink: string | null; vip: boolean; verified: boolean; paused: boolean; created_at: string; bumped_at?: string | null; views?: number; favs?: number; tarif?: number | null; tarif_visible?: boolean; tarif_30?: number | null; tarif_60?: number | null;
};
export const lab = (p: Profile) => CATS[p.genre] || "";
export const isNew = (p: Profile) => { const d = Date.now() - new Date(p.created_at).getTime(); return d >= 0 && d < 30 * 864e5; };
/** Ville de base uniquement : les compteurs, filtres et pages ville ne comptent que les profils basés dans la ville. */
export const LIVE_CITY = "En ligne";
export const cityList = (p: Profile) => (p.genre === "livecam" ? [] : [p.city]);
export const cap = (s: string) => (s ? s[0].toUpperCase() + s.slice(1) : s);

/** Les tarifs ne sont affichés que pour les profils VIP qui ont choisi de les montrer. */
export type Rate = { d: string; p: number };
export const RATE_OPTS: [string, string][] = [["30min", "30 min"], ["45min", "45 min"], ["1h", "1 h"], ["1h30", "1 h 30"], ["2h", "2 h"], ["3h", "3 h"], ["soiree", "Soirée"], ["nuit", "Nuit"], ["weekend", "Week-end"]];
/** Tarifs à afficher : la liste « rates » si elle existe, sinon les anciens champs 30 min / 1 h. */
export const rateList = (p: Profile): Rate[] => {
  const r = (Array.isArray(p.rates) ? p.rates : []).filter((x) => x && x.p > 0 && RATE_OPTS.some((o) => o[0] === x.d));
  if (r.length) return r.slice(0, 8);
  return [p.tarif_30 ? { d: "30min", p: p.tarif_30 } : null, p.tarif_60 ? { d: "1h", p: p.tarif_60 } : null].filter(Boolean) as Rate[];
};
export const showTarif = (p: Profile) => (!!p.vip || p.genre === "livecam") && p.tarif_visible !== false && rateList(p).length > 0;

export const LANGS = ["Français", "Anglais", "Espagnol", "Portugais", "Italien", "Allemand", "Arabe", "Russe", "Roumain", "Chinois", "Néerlandais", "Polonais"];
export const ETHNIES = ["Africaine", "Antillaise", "Asiatique", "Caucasienne", "Latine", "Métisse", "Maghrébine", "Moyen-orientale", "Indienne", "Autre"];
export const HAIRS = ["Blonds", "Châtains", "Bruns", "Noirs", "Roux", "Auburn", "Gris / blancs", "Colorés"];
export const EYES = ["Bleus", "Verts", "Marron", "Noisette", "Noirs", "Gris"];
export const BRAS = ["A", "B", "C", "D", "E", "F", "G+"];
export const HABIT: [string, string][] = [["", "Non précisé"], ["non", "Non"], ["parfois", "Parfois"], ["oui", "Oui"]];

export const CROWNS = [null, { n: "Bronze", c: "#b87333" }, { n: "Argent", c: "#a9b4c2" }, { n: "Or", c: "#f2b01e" }, { n: "Diamant", c: "#4fc3f7" }] as const;
export const CROWN_AT = [0, 250, 700, 1500, 3000];
