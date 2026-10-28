import { sbLazy, hasAuthCookie } from "./supabase/lazy";
/** Compte un événement (vue, appel, copie, réseau) une seule fois par visite et par profil. */
export function track(profileId: string, kind: "view" | "call" | "copy" | "social") {
  try {
    const k = `trk_${profileId}_${kind}`;
    if (sessionStorage.getItem(k)) return; sessionStorage.setItem(k, "1");
  } catch {}
  if (hasAuthCookie()) { sbLazy().then((sb) => sb.rpc("track_event", { p_profile: profileId, p_kind: kind })).then(() => {}, () => {}); return; }
  // visiteur anonyme : simple appel HTTP, sans charger le client Supabase
  fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/track_event`, { method: "POST", keepalive: true, headers: { "Content-Type": "application/json", apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}` }, body: JSON.stringify({ p_profile: profileId, p_kind: kind }) }).catch(() => {});
}
