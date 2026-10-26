"use client";
import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/client";

function Form() {
  const [signup, setSignup] = useState(!!useSearchParams().get("inscription"));
  const [email, setEmail] = useState(""); const [pw, setPw] = useState("");
  const [msg, setMsg] = useState<{ t: string; ok?: boolean } | null>(null); const [busy, setBusy] = useState(false);
  async function go(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setMsg(null);
    const sb = supabaseBrowser();
    if (signup) {
      const { error } = await sb.auth.signUp({ email, password: pw, options: { emailRedirectTo: `${location.origin}/mon-profil` } });
      setMsg(error ? { t: error.message } : { t: "Compte créé ! Clique sur le lien reçu par e-mail pour confirmer, puis connecte-toi.", ok: true });
    } else {
      const { error } = await sb.auth.signInWithPassword({ email, password: pw });
      if (error) setMsg({ t: "E-mail ou mot de passe incorrect." }); else location.href = "/mon-profil";
    }
    setBusy(false);
  }
  return (
    <section className="gut">
      <div className="pbar"><Link className="btn ghost" href="/">← Retour à l’annuaire</Link></div>
      <div className="pfc" style={{ maxWidth: 520 }}>
        <div className="panel regp">
          <h1 className="regh">{signup ? "Créer mon profil" : "Se connecter"}</h1>
          <p className="note">{signup ? "Crée ton compte avec ton e-mail : un lien de confirmation te sera envoyé." : "Retrouve ton profil avec ton e-mail et ton mot de passe."}</p>
          <form className="fs" style={{ border: 0, padding: 0 }} onSubmit={go}>
            <label className="f">Adresse e-mail<input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" /></label>
            <label className="f">Mot de passe (8 caractères minimum)<input type="password" required minLength={8} value={pw} onChange={(e) => setPw(e.target.value)} autoComplete={signup ? "new-password" : "current-password"} /></label>
            {msg && <p className="note" role="alert" style={{ color: msg.ok ? "inherit" : "var(--btn)", fontWeight: 700 }}>{msg.t}</p>}
            <button className="btn" disabled={busy}>{signup ? "Créer mon compte" : "Me connecter"}</button>
            <button type="button" className="btn ghost" onClick={() => setSignup(!signup)}>{signup ? "J’ai déjà un compte" : "Pas encore de compte ?"}</button>
          </form>
        </div>
      </div>
    </section>
  );
}
export default function Page() { return <Suspense><Form /></Suspense>; }
