"use client";
import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import { useT } from "@/lib/i18n";

/** Parrainage : lien personnel ; 1 mois de VIP offert pour chaque amie dont le profil est vérifié (6 maximum). */
export default function ReferralCard() {
  const { tr } = useT(); const sb = supabaseBrowser();
  const [code, setCode] = useState(""); const [st, setSt] = useState<{ invited: number; rewarded: number } | null>(null); const [ok, setOk] = useState(false);
  useEffect(() => { (async () => {
    const c = await sb.rpc("my_ref_code"); if (!c.error && c.data) setCode(String(c.data));
    const s = await sb.rpc("my_referrals"); const r = (s.data as { invited: number; rewarded: number }[] | null)?.[0]; if (r) setSt(r);
  })(); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  if (!code) return null;
  const link = `${location.origin}/rejoindre?ref=${code}`;
  const text = `${tr("Rejoins Sex-Escorte, l’annuaire des escortes : crée ton profil gratuit ici")} 👉 ${link}`;
  const copy = async () => { try { await navigator.clipboard.writeText(link); setOk(true); setTimeout(() => setOk(false), 2500); } catch { prompt(tr("Copie ce lien"), link); } };
  return (
    <section className="dcard">
      <h3>{tr("🎁 Parraine une amie")}</h3>
      <p className="note" style={{ margin: 0 }}>{tr("Pour chaque amie qui crée son profil avec ton lien et dont le profil est vérifié, tu gagnes 1 mois de VIP (6 mois maximum).")}</p>
      <input readOnly value={link} aria-label={tr("Ton lien de parrainage")} onFocus={(e) => e.currentTarget.select()} />
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button type="button" className="btn" onClick={copy}>{ok ? tr("Lien copié ✔") : tr("Copier mon lien")}</button>
        <a className="btn ghost" href={`https://wa.me/?text=${encodeURIComponent(text)}`} target="_blank" rel="noopener noreferrer">WhatsApp</a>
      </div>
      {st && <p className="note" style={{ margin: 0 }}>{tr("Amies parrainées :")} <b>{st.invited}</b> · {tr("mois de VIP gagnés :")} <b>{st.rewarded}</b></p>}
    </section>
  );
}
