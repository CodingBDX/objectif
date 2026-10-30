"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useT } from "@/lib/i18n";
import { sbLazy, hasAuthCookie } from "@/lib/supabase/lazy";
import Ic from "@/components/Ic";

/** Vue « Favoris » : active ou coupe l'alerte e-mail quand un favori devient disponible (désactivée par défaut). */
export default function FavAlert() {
  const { tr } = useT();
  const [state, setState] = useState<"load" | "out" | "in">("load"); const [on, setOn] = useState(false); const [uid, setUid] = useState(""); const [msg, setMsg] = useState(""); const [busy, setBusy] = useState(false);
  useEffect(() => { (async () => {
    try {
      if (!hasAuthCookie()) { setState("out"); return; }
      const sb = await sbLazy(); const { data: { user } } = await sb.auth.getUser(); if (!user) { setState("out"); return; }
      setUid(user.id); const { data } = await sb.from("fav_alerts").select("enabled").eq("user_id", user.id).maybeSingle(); setOn(!!data?.enabled); setState("in");
    } catch { setState("out"); }
  })(); }, []);
  if (state === "load") return null;
  const change = async (v: boolean) => {
    setBusy(true); setMsg("");
    try { const sb = await sbLazy(); const { error } = await sb.from("fav_alerts").upsert({ user_id: uid, enabled: v, updated_at: new Date().toISOString() }); if (error) setMsg(tr("Impossible d’enregistrer pour le moment.")); else setOn(v); } catch { setMsg(tr("Impossible d’enregistrer pour le moment.")); }
    setBusy(false);
  };
  return (
    <div className="favalert" role="group" aria-label={tr("Alerte favoris")}>
      <span className="fa-i" aria-hidden="true"><Ic n="clock" s={20} /></span>
      {state === "in"
        ? <label className="fa-t"><input type="checkbox" checked={on} disabled={busy} onChange={(e) => change(e.target.checked)} /> <span><b>{tr("Me prévenir par e-mail quand un favori est disponible")}</b><small>{tr("Un seul e-mail groupé, 6 profils par jour au maximum. Tu peux te désabonner à tout moment.")}</small></span></label>
        : <div className="fa-t"><span><b>{tr("Être prévenu quand un favori est disponible")}</b><small>{tr("Connecte-toi pour recevoir une alerte par e-mail.")} <Link href="/connexion?next=/%3Ffav%3D1">{tr("Se connecter")}</Link></small></span></div>}
      {msg && <span className="note" role="alert" style={{ color: "var(--btn)", fontWeight: 700 }}>{msg}</span>}
    </div>
  );
}
