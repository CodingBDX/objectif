"use client";
import { useState } from "react";
import { sbLazy } from "@/lib/supabase/lazy";
import { logSec, HONEYPOT } from "@/lib/secEvent";
import { notifyAdmin } from "@/lib/notifyAdmin";

const REASONS = ["Photos ou vidéos publiées sans mon accord", "Personne mineure", "Usurpation d’identité", "Contenu sexuel ou inapproprié", "Arnaque ou faux profil", "Harcèlement", "Autre"];

export default function ReportBtn({ profileId }: { profileId: string }) {
  const [open, setOpen] = useState(false); const [done, setDone] = useState(false); const [err, setErr] = useState(""); const [busy, setBusy] = useState(false);
  async function send(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setBusy(true); setErr("");
    const f = new FormData(e.currentTarget);
    if (f.get("website")) { logSec("piege_signalement", ""); setBusy(false); setDone(true); return; }
    const { error } = await (await sbLazy()).from("reports").insert({ profile_id: profileId, reason: f.get("reason"), details: f.get("details") || "", contact: f.get("contact") || "" });
    setBusy(false); if (error) setErr("Envoi impossible, réessaie dans un instant."); else { setDone(true); notifyAdmin("signalement"); }
  }
  if (done) return <p className="note" role="status" style={{ margin: 0 }}><b>Merci, ton signalement est bien reçu.</b> Nous l’examinons rapidement.</p>;
  return (
    <>
      <button type="button" className="btn ghost" onClick={() => setOpen(!open)} aria-expanded={open}>🚩 Signaler ce profil</button>
      {open && (
        <form onSubmit={send} className="fs" style={{ flexBasis: "100%", background: "var(--bg1)", border: "1px solid var(--line)", borderRadius: 20, padding: 14 }}>
          <input {...HONEYPOT} defaultValue="" />
          <label className="f">Motif du signalement<select name="reason" required defaultValue=""><option value="" disabled>Choisir…</option>{REASONS.map((r) => <option key={r}>{r}</option>)}</select></label>
          <label className="f">Précisions (facultatif)<textarea name="details" maxLength={1000} rows={3} placeholder="Explique en quelques mots ce qui pose problème…" /></label>
          <label className="f">Ton e-mail pour te répondre (facultatif)<input name="contact" type="email" maxLength={120} autoComplete="email" /></label>
          {err && <p className="note" role="alert" style={{ color: "var(--btn)", fontWeight: 700, margin: 0 }}>{err}</p>}
          <div className="acts"><button className="btn" type="submit" disabled={busy}>Envoyer le signalement</button><button className="btn ghost" type="button" onClick={() => setOpen(false)}>Annuler</button></div>
        </form>
      )}
    </>
  );
}
