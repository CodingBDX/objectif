import { supabaseBrowser } from "./supabase/client";
/** Compte un événement (vue, appel, copie, réseau) une seule fois par visite et par profil. */
export function track(profileId: string, kind: "view" | "call" | "copy" | "social") {
  try {
    const k = `trk_${profileId}_${kind}`;
    if (sessionStorage.getItem(k)) return; sessionStorage.setItem(k, "1");
  } catch {}
  supabaseBrowser().rpc("track_event", { p_profile: profileId, p_kind: kind }).then(() => {}, () => {});
}
