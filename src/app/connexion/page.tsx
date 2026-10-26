"use client";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
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
    <form className="panel" style={{ maxWidth: 420, margin: "0 auto" }} onSubmit={go}>
      <h1 style={{ marginTop: 0 }}>{signup ? "Créer mon profil" : "Se connecter"}</h1>
      <label className="f">E-mail<input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" /></label>
      <label className="f">Mot de passe<input type="password" required minLength={8} value={pw} onChange={(e) => setPw(e.target.value)} autoComplete={signup ? "new-password" : "current-password"} /></label>
      {msg && <p className={msg.ok ? "ok" : "err"}>{msg.t}</p>}
      <button className="btn" disabled={busy}>{signup ? "Créer mon compte" : "Me connecter"}</button>{" "}
      <button type="button" className="btn ghost" onClick={() => setSignup(!signup)}>{signup ? "J'ai déjà un compte" : "Pas de compte ?"}</button>
    </form>
  );
}
export default function Page() { return <Suspense><Form /></Suspense>; }
