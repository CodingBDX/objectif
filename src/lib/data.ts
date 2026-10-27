import { supabaseServer } from "./supabase/server";
import { cityList, Profile } from "./types";
import { slug } from "./site";
export async function allProfiles(): Promise<Profile[]> {
  const { data } = await supabaseServer().from("profiles").select("*").eq("paused", false).order("created_at", { ascending: false }).limit(1000);
  const ps = (data || []) as Profile[];
  try {
    const { data: v } = await supabaseServer().rpc("popular_views");
    const m = new Map<string, number>(((v as { profile_id: string; views: number }[] | null) || []).map((x) => [x.profile_id, Number(x.views)] as [string, number]));
    ps.forEach((p) => { p.views = m.get(p.id) || 0; });
  } catch {}
  return ps;
}
export const cityBySlug = (ps: Profile[], s: string) => ps.flatMap(cityList).find((c) => slug(c) === s);
