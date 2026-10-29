"use client";
import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import { refreshListings } from "@/app/actions";
import { useT } from "@/lib/i18n";

/** « Remonter mon annonce » : passe le profil en tête de sa catégorie (1 fois / 24 h, VIP : 1 fois / 12 h). */
export default function BumpCard() {
  const { tr } = useT(); const sb = supabaseBrowser();
  const [last, setLast] = useState<string | null>(null); const [vip, setVip] = useState(false); const [busy, setBusy] = useState(false); const [msg, setMsg] = useState<{ t: string; ok?: boolean } | null>(null);
  useEffect(() => { (async () => { const { data: { user } } = await sb.auth.getUser(); if (!user) return;
    const { data } = await sb.from("profiles").select("bumped_at,vip").eq("id", user.id).maybeSingle();
    if (data) { setLast((data as { bumped_at: string | null }).bumped_at); setVip(!!(data as { vip: boolean }).vip); } })(); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const wait = (vip ? 12 : 24) * 36e5; const next = last ? new Date(last).getTime() + wait : 0; const can = Date.now() >= next;
  const fmt = (t: number) => new Intl.DateTimeFormat("fr-FR", { timeZone: "Europe/Paris", day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }).format(t);
  async function go() {
    setBusy(true); setMsg(null);
    const { data, error } = await sb.rpc("bump_my_profile");
    if (error) setMsg({ t: error.message.replace(/^.*?(Déjà)/, "$1") });
    else { setLast(String(data)); await refreshListings(); setMsg({ t: tr("C’est fait : ton profil est remonté en tête de sa catégorie."), ok: true }); }
    setBusy(false);
  }
  return (
    <section className="dcard">
      <h3>{tr("⬆️ Remonter mon annonce")}</h3>
      <p className="note" style={{ margin: 0 }}>{tr("Passe ton profil en tête de sa catégorie (avant les autres profils du même type).")} {vip ? tr("Profil VIP : une remontée toutes les 12 h.") : tr("Une remontée toutes les 24 h. En VIP : toutes les 12 h.")}</p>
      {last && !can && <p className="note" style={{ margin: 0 }}>{tr("Prochaine remontée possible le")} <b>{fmt(next)}</b></p>}
      {msg && <p className="note" role={msg.ok ? "status" : "alert"} style={{ margin: 0, fontWeight: 700, color: msg.ok ? "inherit" : "var(--btn)" }}>{msg.t}</p>}
      <button type="button" className="btn" disabled={busy || !can} onClick={go}>{busy ? tr("…") : tr("Remonter mon annonce")}</button>
    </section>
  );
}
