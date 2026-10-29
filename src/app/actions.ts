"use server";
import { revalidatePath, revalidateTag } from "next/cache";
import { supabaseServer } from "@/lib/supabase/server";
import { pingIndexNow } from "@/lib/indexnow";
import { profilePath } from "@/lib/profilUrl";
import { siteUrl } from "@/lib/site";

/** Après une pause, une réactivation ou une modification de profil : vide le cache des listes pour que le changement soit visible tout de suite. */
export async function refreshListings() {
  const { data: { user } } = await supabaseServer().auth.getUser();
  if (!user) return;
  revalidateTag("profiles");
  revalidateTag("specialties");
  revalidatePath("/", "layout");
  // prévient Bing & co. que la fiche est nouvelle ou modifiée (sans effet si INDEXNOW_KEY n'est pas définie)
  try { const { data: p } = await supabaseServer().from("profiles").select("id,name,city,genre,vip,friendly_url,url_slug,paused").eq("id", user.id).maybeSingle(); if (p && !p.paused) await pingIndexNow([siteUrl() + profilePath(p)]); } catch {}
}
