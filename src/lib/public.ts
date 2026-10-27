import { createClient } from "@supabase/supabase-js";
import { unstable_cache } from "next/cache";
import { Profile } from "./types";

/** Lectures publiques (sans cookies) mises en cache 30 s côté serveur : la navigation entre pages devient quasi instantanée. */
const anon = () => createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, { auth: { persistSession: false, autoRefreshToken: false } });

export const publicProfiles = unstable_cache(async (): Promise<Profile[]> => {
  const sb = anon();
  const [a, b, c] = await Promise.all([
    sb.from("profiles").select("*").eq("paused", false).order("created_at", { ascending: false }).limit(1000),
    sb.rpc("popular_views"),
    sb.rpc("popular_favs")
  ]);
  const ps = (a.data || []) as Profile[];
  const rows = (b.data || []) as { profile_id: string; views: number }[];
  const m = new Map<string, number>(rows.map((x) => [x.profile_id, Number(x.views)] as [string, number]));
  const f = new Map<string, number>(((c.data || []) as { profile_id: string; favs: number }[]).map((x) => [x.profile_id, Number(x.favs)] as [string, number]));
  ps.forEach((p) => { p.views = m.get(p.id) || 0; p.favs = f.get(p.id) || 0; });
  return ps;
}, ["public-profiles"], { revalidate: 30 });

export const publicCities = unstable_cache(async (): Promise<string[]> => {
  const { data } = await anon().from("profiles").select("city").eq("paused", false);
  return Array.from(new Set((data || []).map((c: { city: string }) => c.city).filter(Boolean))).sort((x, y) => x.localeCompare(y, "fr"));
}, ["public-cities"], { revalidate: 30 });

export type Asso = { id: string; slug: string; name: string; city: string; more: string[]; region: string | null; description: string; services: string[]; phone: string | null; email: string | null; site: string | null; address: string | null; hours: string | null; created_at: string };
export const ASSO_COLS = "id,slug,name,city,more,region,description,services,phone,email,site,address,hours,created_at";
export const publicAssos = unstable_cache(async (): Promise<Asso[]> => {
  const { data } = await anon().from("associations").select(ASSO_COLS).eq("status", "approved").order("name").limit(1000);
  return (data || []) as Asso[];
}, ["public-assos"], { revalidate: 60 });
