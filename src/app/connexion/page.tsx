"use client";
import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/client";
import { useT } from "@/lib/i18n";

function Form() {
  const { tr } = useT();
  const sp = useSearchParams(); const [signup, setSignup] = useState(!!sp.get("inscription"));
  const nx = sp.get("next") === "/mon-association" ? "/mon-association" : "/mon-profil";
  const [adult, setAdult] = useState(false); const [email, setEmail] = useState(""); const [pw, setPw] = useState("");
  const [msg, setMsg] = useState<{ t: string; ok?: boolean } | null>(null); const [busy, setBusy] = useState(false);
  async function go(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setMsg(null);
    const sb = supabaseBrowser();
    if (signup) {
      const { data, error } = await sb.auth.signUp({ email, password: pw, options: { emailRedirectTo: `${location.origin}${nx}`, data: { adult_confirmed_at: new Date().toISOString() } } });
      if (!error && data?.session) { location.href = nx; return; }
      setMsg(error ? { t: error.message } : { t: tr("Compte créé ! Clique sur le lien reçu par e-mail pour confirmer, puis connecte-toi."), ok: true });
    } else {
      const { error } = await sb.auth.signInWithPassword({ email, password: pw });
      if (error) setMsg({ t: tr("E-mail ou mot de passe incorrect.") }); else location.href = nx;
    }
    setBusy(false);
  }
  return (
    <section className="gut">
      <div className="pbar"><Link className="btn ghost" href="/">{tr("← Retour à l’annuaire")}</Link></div>
      <div className="pfc" style={{ maxWidth: 520 }}>
        <div className="panel regp">
          <h1 className="regh">{signup ? tr("Créer mon profil") : tr("Se connecter")}</h1>
          <p className="note">{signup ? tr("Crée ton compte avec ton e-mail et un mot de passe.") : tr("Retrouve ton profil avec ton e-mail et ton mot de passe.")}</p>
          <form className="fs" style={{ border: 0, padding: 0 }} onSubmit={go}>
            <label className="f">{tr("Adresse e-mail")}<input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" /></label>
            <label className="f">{tr("Mot de passe (8 caractères minimum)")}<input type="password" required minLength={8} value={pw} onChange={(e) => setPw(e.target.value)} autoComplete={signup ? "new-password" : "current-password"} /></label>
            {signup && <label className="chk"><input type="checkbox" required checked={adult} onChange={(e) => setAdult(e.target.checked)} /> <span>{tr("Je certifie avoir")} <b>{tr("18 ans ou plus")}</b> {tr("et j’accepte les")} <Link href="/cgu" style={{ textDecoration: "underline" }}>{tr("conditions d’utilisation")}</Link> {tr("et la")} <Link href="/confidentialite" style={{ textDecoration: "underline" }}>{tr("politique de confidentialité")}</Link>.</span></label>}
            {msg && <p className="note" role="alert" style={{ color: msg.ok ? "inherit" : "var(--btn)", fontWeight: 700 }}>{msg.t}</p>}
            <button className="btn" disabled={busy}>{signup ? tr("Créer mon compte") : tr("Me connecter")}</button>
            <button type="button" className="btn ghost" onClick={() => setSignup(!signup)}>{signup ? tr("J’ai déjà un compte") : tr("Pas encore de compte ?")}</button>
          </form>
        </div>
      </div>
    </section>
  );
}
export default function Page() { return <Suspense><Form /></Suspense>; }
