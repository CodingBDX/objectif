"use client";
import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
export default function Contact() {
  const [done, setDone] = useState(false); const [err, setErr] = useState("");
  async function send(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); const f = new FormData(e.currentTarget);
    const { error } = await supabaseBrowser().from("messages").insert({ name: f.get("name"), contact: f.get("contact"), subject: f.get("subject"), body: f.get("body") });
    if (error) setErr("Envoi impossible, réessaie."); else setDone(true);
  }
  const vip = typeof window !== "undefined" && new URLSearchParams(location.search).get("s") === "vip";
  return done ? <p className="panel ok">Message envoyé, merci !</p> : (
    <form className="panel" style={{ maxWidth: 560, margin: "0 auto" }} onSubmit={send}>
      <h1 style={{ marginTop: 0 }}>Nous contacter</h1>
      <label className="f">Nom<input name="name" required maxLength={80} /></label>
      <label className="f">Ton e-mail ou téléphone<input name="contact" required maxLength={120} /></label>
      <label className="f">Sujet<select name="subject" defaultValue={vip ? "Devenir VIP" : "Une question"}>
        {["Une question", "Signaler un profil", "Demande de vérification", "Devenir VIP", "Autre"].map((s) => <option key={s}>{s}</option>)}</select></label>
      <label className="f">Message<textarea name="body" required maxLength={3000} /></label>
      {err && <p className="err">{err}</p>}
      <button className="btn">Envoyer</button>
    </form>
  );
}
