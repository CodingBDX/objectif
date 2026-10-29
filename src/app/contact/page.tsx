"use client";
import { Suspense, useRef, useState } from "react";
import { Crumbs } from "@/components/Ld";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import VipPrices from "@/components/VipPrices";
import { supabaseBrowser } from "@/lib/supabase/client";
import { logSec, HONEYPOT } from "@/lib/secEvent";

function Form() {
  const vip = useSearchParams().get("s") === "vip";
  const [done, setDone] = useState(false); const [err, setErr] = useState(""); const t0 = useRef(Date.now());
  async function send(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); const f = new FormData(e.currentTarget);
    if (f.get("website")) { logSec("piege_contact", String(f.get("website")).slice(0, 80)); setDone(true); return; } // robot : on fait semblant
    if (Date.now() - t0.current < 3000) { logSec("trop_rapide", "contact"); setErr("Un instant, réessaie dans quelques secondes."); return; }
    const { error } = await supabaseBrowser().from("messages").insert({ name: f.get("n"), contact: f.get("e"), subject: f.get("s"), body: f.get("m") });
    if (error) setErr("Envoi impossible, réessaie."); else setDone(true);
  }
  return (
    <section id="con" className="gut">
      <div className="pbar"><Crumbs inline items={[["Accueil", "/"], ["Contact", "#"]]} /></div>
      <div className="pfc" style={{ maxWidth: 640 }}>
        <div className="panel regp">
          <h1 style={{ font: "700 clamp(28px,5vw,38px)/1.1 var(--fd)", color: "var(--pink)", margin: "0 0 6px" }}>Nous contacter</h1>
          <p className="note" style={{ margin: "0 0 16px" }}>Une question, un profil à signaler, une demande de vérification ou de VIP ? Écris-nous.</p>
          {vip && !done && <div style={{ margin: "0 0 16px" }}><b>👑 VIP</b><VipPrices pay /></div>}
          {done ? <p className="note" role="status"><b>Message envoyé, merci !</b> Nous te répondons dès que possible.</p> : (
            <form className="fs" style={{ border: 0, padding: 0 }} onSubmit={send}>
              <input {...HONEYPOT} defaultValue="" />
              <div className="row2"><label className="f">Nom<input name="n" required maxLength={60} autoComplete="name" /></label>
                <label className="f">Adresse e-mail pour te répondre<input name="e" type="email" required maxLength={120} autoComplete="email" /></label></div>
              <label className="f">Sujet<select name="s" required defaultValue={vip ? "Devenir VIP" : ""}><option value="" disabled>Choisir…</option>
                {["Une question", "Signaler un profil", "Demande de vérification", "Devenir VIP", "Autre"].map((s) => <option key={s}>{s}</option>)}</select></label>
              <label className="f">Message<textarea name="m" required minLength={10} maxLength={1500} rows={6} placeholder="Écris ton message ici…" /></label>
              {err && <p className="note" role="alert" style={{ color: "var(--btn)", fontWeight: 700 }}>{err}</p>}
              <button className="btn" type="submit">Envoyer le message</button>
            </form>)}
        </div>
      </div>
    </section>
  );
}
export default function Page() { return <Suspense><Form /></Suspense>; }
