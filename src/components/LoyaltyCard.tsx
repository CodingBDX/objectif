"use client";
import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import { useT } from "@/lib/i18n";
import { CROWNS, CROWN_AT } from "@/lib/types";
import CrownBadge from "@/components/CrownBadge";

type St = { earned: number; spent: number; balance: number; level: number; login_days: number; vip_days: number; done: boolean; verified: boolean; refs: number };

/** « Mes points » : solde, niveau (couronne), progression, et ce qu'on peut échanger. */
export default function LoyaltyCard() {
  const { tr } = useT(); const sb = supabaseBrowser();
  const [st, setSt] = useState<St | null>(null); const [off, setOff] = useState(false); const [busy, setBusy] = useState(false); const [msg, setMsg] = useState<{ t: string; ok?: boolean } | null>(null);
  useEffect(() => { (async () => { const { data, error } = await sb.rpc("loyalty_sync"); if (error) setOff(true); else setSt(data as St); })(); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  async function redeem(kind: "bump" | "vip7") {
    setBusy(true); setMsg(null);
    const { data, error } = await sb.rpc("loyalty_redeem", { p_kind: kind });
    if (error) setMsg({ t: error.message });
    else { setSt(data as St); setMsg({ t: kind === "bump" ? tr("Ton profil est remonté en tête de liste.") : tr("7 jours de VIP ajoutés !"), ok: true }); }
    setBusy(false);
  }
  if (off || !st) return null;
  const next = CROWN_AT[st.level + 1]; const prev = CROWN_AT[st.level]; const pct = next ? Math.min(100, Math.round(((st.earned - prev) / (next - prev)) * 100)) : 100;
  const cur = CROWNS[st.level];
  return (
    <section className="dcard">
      <h3>{tr("⭐ Mes points")}</h3>
      <div className="lyl"><CrownBadge level={st.level} size={30} /><div><b>{cur ? tr("Niveau {n}", { n: cur.n }) : tr("Pas encore de couronne")}</b><small>{st.balance} {tr("points à dépenser")} · {st.earned} {tr("gagnés au total")}</small></div></div>
      <div className="lybar" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct}><i style={{ width: pct + "%" }} /></div>
      <p className="note" style={{ margin: 0 }}>{next ? tr("Prochaine couronne ({n}) à {p} points.", { n: CROWNS[st.level + 1]!.n, p: next }) : tr("Tu as la couronne maximale.")}</p>
      <ul className="lyw">
        <li><b>+50</b> {tr("profil complet (3 photos et présentation de 150 caractères)")} {st.done ? "✓" : ""}</li>
        <li><b>+100</b> {tr("profil vérifié")} {st.verified ? "✓" : ""}</li>
        <li><b>+150</b> {tr("amie parrainée et vérifiée")} ({st.refs}/6)</li>
        <li><b>+1</b> {tr("par jour de connexion")} ({st.login_days})</li>
        <li><b>+1</b> {tr("par jour de VIP")} ({st.vip_days})</li>
      </ul>
      {msg && <p className="note" role={msg.ok ? "status" : "alert"} style={{ margin: 0, fontWeight: 700, color: msg.ok ? "inherit" : "var(--btn)" }}>{msg.t}</p>}
      <div className="lyb">
        <button type="button" className="btn ghost" disabled={busy || st.balance < 60} onClick={() => redeem("bump")}>{tr("Remonter maintenant")} · 60</button>
        <button type="button" className="btn" disabled={busy || st.balance < 400} onClick={() => redeem("vip7")}>{tr("7 jours de VIP")} · 400</button>
      </div>
      <p className="note" style={{ margin: 0 }}>{tr("Ton niveau ne baisse jamais, même quand tu dépenses des points.")}</p>
    </section>
  );
}
