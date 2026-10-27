import { publicProfiles } from "./public";
import { cityList, Profile } from "./types";
import { slug } from "./site";
export const allProfiles = (): Promise<Profile[]> => publicProfiles();
export const cityBySlug = (ps: Profile[], s: string) => ps.flatMap(cityList).find((c) => slug(c) === s);
/** Nom lisible d'une ville à partir de son adresse web, quand aucun profil visible ne l'utilise (profil en pause, ville vide…). */
export const cityFromSlug = (s: string) => s.split("-").filter(Boolean).map((w) => (w.length > 2 || /^[a-z]/.test(w) ? w[0].toUpperCase() + w.slice(1) : w)).join(" ");
