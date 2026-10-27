"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase/client";
import { useT, LangSwitch } from "@/lib/i18n";

const CATS: Record<string, string> = { harcelement: "Harcèlement", menaces: "Menaces", impaye: "Impayé / arnaque", faux_rdv: "Faux rendez-vous", non_respect: "Non-respect des règles", autre: "Autre" };
type Res = { niveau: "aucun" | "attention" | "danger"; signalements: number; dernier: string | null; categories: string[] };
const LOOK = {
  aucun: { c: "#1e8a4c", bg: "#e6f7ec", t: "Aucun signalement", d: "Ce numéro n’a pas été signalé par d’autres profils. Reste prudent(e) quand même." },
  attention: { c: "#b36b00", bg: "#fff2d9", t: "Attention", d: "1 profil a signalé ce numéro." },
  danger: { c: "#c0213d", bg: "#ffe3e8", t: "Danger", d: "Plusieurs profils ont signalé ce numéro." },
} as const;
const fr = (iso: string, loc = "fr-FR") => new Date(iso + "T12:00:00").toLocaleDateString(loc, { day: "numeric", month: "long", year: "numeric" });

export default function Verifier() {
  const { tr, locale } = useT();
  const sb = supabaseBrowser();
  const [ok, setOk] = useState<null | boolean>(null);
  const [num, setNum] = useState(""); const [res, setRes] = useState<Res | null>(null); const [err, setErr] = useState(""); const [busy, setBusy] = useState(false);
  const [rn, setRn] = useState(""); const [cat, setCat] = useState("harcelement"); const [note, setNote] = useState(""); const [rmsg, setRmsg] = useState<{ t: string; ok?: boolean } | null>(null);

  async function check(n = num) {
    setErr(""); setRes(null); if (n.replace(/\D/g, "").length < 8) { setErr(tr("Entre un numéro de téléphone complet.")); return; }
    setBusy(true);
    const { data, error } = await sb.rpc("check_client", { p_phone: n });
    setBusy(false);
    if (error) { setErr(/invalide/i.test(error.message) ? tr("Numéro invalide.") : error.message); return; }
    setRes((data as Res[])[0] || null);
  }
  async function report(e: React.FormEvent) {
    e.preventDefault(); setRmsg(null); if (rn.replace(/\D/g, "").length < 8) { setRmsg({ t: tr("Entre un numéro de téléphone complet.") }); return; }
    setBusy(true);
    const { error } = await sb.rpc("report_client", { p_phone: rn, p_category: cat, p_note: note.trim() });
    setBusy(false);
    if (error) setRmsg({ t: /invalide/i.test(error.message) ? tr("Numéro invalide.") : error.message }); else { setRmsg({ t: tr("✔ Merci, le signalement est enregistré. Il aide les autres profils."), ok: true }); setRn(""); setNote(""); }
  }
  useEffect(() => { (async () => {
    const { data: { user } } = await sb.auth.getUser();
    if (!user) { location.href = "/connexion"; return; }
    const { data: p } = await sb.from("profiles").select("id").eq("id", user.id).maybeSingle();
    setOk(!!p);
    const n = new URLSearchParams(location.search).get("n"); if (p && n) { setNum(n); check(n); }
  })(); }, []);

  if (ok === null) return <section className="gut"><p className="note">{tr("Chargement…")}</p></section>;
  if (!ok) return <section className="gut"><h1>{tr("Vérifier un client")}</h1><p className="note">{tr("Cet outil est réservé aux profils inscrits. ")}<Link href="/mon-profil">{tr("Crée ton profil")}</Link>{tr(" pour l’utiliser.")}</p></section>;
  const L = res ? LOOK[res.niveau] : null;
  return (
    <section className="gut" style={{ maxWidth: 640, margin: "0 auto", display: "grid", gap: 16 }}>
      <div className="dtop"><h1>{tr("🛡️ Vérifier un client")}</h1><LangSwitch /><Link className="btn ghost" href="/mon-profil">{tr("← Mon espace")}</Link></div>
      <p className="note" style={{ margin: 0 }}>{tr("Outil de sécurité réservé aux profils. Entre le numéro d’un client avant de répondre ou de l’accepter : tu vois si d’autres profils l’ont signalé. Les signalements sont anonymes et les numéros ne sont jamais affichés ni conservés en clair.")}</p>

      <div className="dcard">
        <h3>{tr("Vérifier un numéro")}</h3>
        <form onSubmit={(e) => { e.preventDefault(); check(); }} style={{ display: "grid", gap: 10 }}>
          <input type="tel" inputMode="tel" autoComplete="off" placeholder="06 12 34 56 78" aria-label={tr("Numéro à vérifier")} value={num} onChange={(e) => setNum(e.target.value)} />
          <button className="btn" type="submit" disabled={busy}>{busy ? tr("Vérification…") : tr("Vérifier")}</button>
        </form>
        {err && <p className="note" role="alert" style={{ color: "#c0213d", margin: 0 }}>{err}</p>}
        {res && L && (
          <div role="status" style={{ background: L.bg, color: L.c, borderRadius: 18, padding: "14px 16px", border: `2px solid ${L.c}` }}>
            <div style={{ font: "700 20px var(--fd)" }}>{res.niveau === "danger" ? "🔴" : res.niveau === "attention" ? "🟠" : "🟢"} {tr(L.t)}{res.signalements ? " · " + tr("{n} signalement(s)", { n: res.signalements }) : ""}</div>
            <div style={{ marginTop: 4 }}>{tr(L.d)}</div>
            {res.categories?.length > 0 && <div style={{ marginTop: 6, fontWeight: 600 }}>{tr("Motifs : {m}", { m: res.categories.map((c) => tr(CATS[c] || c)).join(", ") })}</div>}
            {res.dernier && <div style={{ marginTop: 2, fontSize: 13 }}>{tr("Dernier signalement : {d}", { d: fr(res.dernier, locale) })}</div>}
          </div>
        )}
      </div>

      <div className="dcard">
        <h3>{tr("Signaler un client")}</h3>
        <form onSubmit={report} style={{ display: "grid", gap: 10 }}>
          <input type="tel" inputMode="tel" autoComplete="off" placeholder={tr("Numéro du client")} aria-label={tr("Numéro à signaler")} value={rn} onChange={(e) => setRn(e.target.value)} />
          <select aria-label={tr("Motif")} value={cat} onChange={(e) => setCat(e.target.value)}>{Object.entries(CATS).map(([k, v]) => <option key={k} value={k}>{tr(v)}</option>)}</select>
          <textarea rows={3} maxLength={300} placeholder={tr("Ce qui s’est passé (facultatif, 300 caractères). Reste factuel(le) : les autres profils ne voient pas ce texte, il sert à la modération.")} value={note} onChange={(e) => setNote(e.target.value)} />
          <button className="btn" type="submit" disabled={busy}>{busy ? tr("Envoi…") : tr("Signaler ce numéro")}</button>
        </form>
        {rmsg && <p className="note" role="status" style={{ margin: 0, color: rmsg.ok ? "#1e8a4c" : "#c0213d" }}>{rmsg.t}</p>}
        <p className="note" style={{ margin: 0, fontSize: 12 }}>{tr("Signale uniquement des faits réels qui te concernent. Un signalement abusif ou mensonger peut entraîner la suppression de ton profil.")}</p>
      </div>
    </section>
  );
}
