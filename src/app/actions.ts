"use server";
import { revalidatePath, revalidateTag } from "next/cache";
import { supabaseServer } from "@/lib/supabase/server";

/** Après une pause, une réactivation ou une modification de profil : vide le cache des listes pour que le changement soit visible tout de suite. */
export async function refreshListings() {
  const { data: { user } } = await supabaseServer().auth.getUser();
  if (!user) return;
  revalidateTag("profiles");
  revalidatePath("/", "layout");
}
