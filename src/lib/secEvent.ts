import { supabaseBrowser } from "@/lib/supabase/client";

export type SecKind = "piege_contact" | "piege_signalement" | "piege_commentaire" | "connexion_echec" | "trop_rapide";
/** Enregistre un événement de sécurité (sans donnée personnelle). Ne bloque jamais l'utilisateur. */
export async function logSec(kind: SecKind, detail = "") {
  try { await supabaseBrowser().from("security_events").insert({ kind, detail: detail.slice(0, 200) }); } catch {}
}
/** Champ piège : invisible pour les humains. Un robot le remplit. */
export const HONEYPOT = { name: "website", tabIndex: -1, autoComplete: "off", "aria-hidden": true, className: "hpf" } as const;
