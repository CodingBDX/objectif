import { createClient } from "@supabase/supabase-js";
import { unstable_cache } from "next/cache";
import { Profile, SPECIALTIES } from "./types";
import { proxyMedia } from "./img";

/** Lectures publiques (sans cookies) mises en cache 5 min côté serveur (vidées tout de suite quand un profil change) : la navigation entre pages devient quasi instantanée. */
const anon = () => createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, { auth: { persistSession: false, autoRefreshToken: false } });

/** Liste des spécialités (modifiable dans l'admin). Si la table n'existe pas encore, on garde la liste intégrée au site. */
export const publicSpecialties = unstable_cache(async (): Promise<string[]> => {
  const { data, error } = await anon().from("specialties").select("name").order("position").order("name");
  const l = (data || []).map((r: { name: string }) => r.name);
  return error || !l.length ? SPECIALTIES : l;
}, ["public-specialties"], { revalidate: 300, tags: ["profiles", "specialties"] });

export const publicProfiles = unstable_cache(async (): Promise<Profile[]> => {
  const sb = anon();
  const [a, b, c, spec] = await Promise.all([
    sb.from("profiles").select("*").eq("paused", false).order("created_at", { ascending: false }).limit(1000),
    sb.rpc("popular_views"),
    sb.rpc("popular_favs"),
    publicSpecialties()
  ]);
  const ps = (a.data || []) as Profile[];
  const rows = (b.data || []) as { profile_id: string; views: number }[];
  const m = new Map<string, number>(rows.map((x) => [x.profile_id, Number(x.views)] as [string, number]));
  const f = new Map<string, number>(((c.data || []) as { profile_id: string; favs: number }[]).map((x) => [x.profile_id, Number(x.favs)] as [string, number]));
  ps.forEach((p) => { p.views = m.get(p.id) || 0; p.favs = f.get(p.id) || 0; p.specialties = (p.specialties || []).filter((x) => spec.includes(x)); proxyMedia(p); });
  return ps;
}, ["public-profiles"], { revalidate: 300, tags: ["profiles"] });

export const publicCities = unstable_cache(async (): Promise<string[]> => {
  const { data } = await anon().from("profiles").select("city,genre").eq("paused", false);
  return Array.from(new Set((data || []).filter((c: { genre: string }) => c.genre !== "livecam").map((c: { city: string }) => c.city).filter(Boolean))).sort((x, y) => x.localeCompare(y, "fr"));
}, ["public-cities"], { revalidate: 300, tags: ["profiles"] });

export type Asso = { id: string; slug: string; name: string; city: string; more: string[]; region: string | null; description: string; services: string[]; phone: string | null; email: string | null; site: string | null; address: string | null; hours: string | null; created_at: string; featured?: boolean; national?: boolean };
export const ASSO_COLS = "id,slug,name,city,more,region,description,services,phone,email,site,address,hours,created_at,featured,national";
