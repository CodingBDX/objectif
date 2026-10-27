import { supabaseServer } from "./supabase/server";
import { cityList, Profile } from "./types";
import { slug } from "./site";
export async function allProfiles(): Promise<Profile[]> {
  const { data } = await supabaseServer().from("profiles").select("*").eq("paused", false).order("created_at", { ascending: false }).limit(1000);
  return (data || []) as Profile[];
}
export const cityBySlug = (ps: Profile[], s: string) => ps.flatMap(cityList).find((c) => slug(c) === s);
