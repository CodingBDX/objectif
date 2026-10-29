"use client";
import { Suspense, useState } from "react";
import { Crumbs } from "@/components/Ld";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/client";
import { useT } from "@/lib/i18n";
import Turnstile from "@/components/Turnstile";

/** Force du mot de passe : 0 (trop court) à 4 (très solide). */
function strength(pw: string) {
  if (pw.length < 8) return 0;
  let n = 0; if (pw.length >= 12) n++; if (pw.length >= 16) n++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) n++; if (/\d/.test(pw)) n++; if (/[^A-Za-z0-9]/.test(pw)) n++;
  if (/^(.)\1+$/.test(pw) || /^(password|motdepasse|azerty|qwerty|12345678|123456789)/i.test(pw)) n = 0;
  return Math.max(1, Math.min(4, n));
}
/** Mot de passe aléatoire de 16 caractères (sans caractères ambigus), généré dans le navigateur. */
function suggest() {
  const abc = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%&*?"; const a = new Uint32Array(16); crypto.getRandomValues(a);
  let out = Array.from(a, (x) => abc[x % abc.length]).join("");
  if (!/\d/.test(out)) out = out.slice(0, 15) + "7"; if (!/[A-Z]/.test(out)) out = "K" + out.slice(1); if (!/[a-z]/.test(out)) out = out.slice(0, 1) + "m" + out.slice(2); if (!/[^A-Za-z0-9]/.test(out)) out = out.slice(0, 14) + "!" + out.slice(15);
  return out;
}

function Form() {
  const { tr } = useT();
  const sp = useSearchParams(); const [signup, setSignup] = useState(!!sp.get("inscription"));
  const nx = sp.get("next") === "/mon-association" ? "/mon-association" : "/mon-profil";
  const [adult, setAdult] = useState(false); const [email, setEmail] = useState(""); const [pw, setPw] = useState("");
  const [msg, setMsg] = useState<{ t: string; ok?: boolean } | null>(null); const [busy, setBusy] = useState(false);
  const [show, setShow] = useState(false); const [cap, setCap] = useState(""); const [capN, setCapN] = useState(0);
  async function go(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setMsg(null);
    const sb = supabaseBrowser();
    if (signup) {
      const { data, error } = await sb.auth.signUp({ email, password: pw, options: { captchaToken: cap || undefined, emailRedirectTo: `${location.origin}${nx}`, data: { adult_confirmed_at: new Date().toISOString() } } });
      if (!error && data?.session) { location.href = nx; return; }
      setMsg(error ? { t: error.message } : { t: tr("Compte créé ! Clique sur le lien reçu par e-mail pour confirmer, puis connecte-toi."), ok: true });
    } else {
      const { error } = await sb.auth.signInWithPassword({ email, password: pw, options: { captchaToken: cap || undefined } });
      if (error) setMsg({ t: tr("E-mail ou mot de passe incorrect.") }); else location.href = nx;
    }
    setBusy(false); setCap(""); setCapN((n) => n + 1);
  }
  return (
    <section className="gut">
      <div className="pbar"><Crumbs inline items={[[tr("Accueil"), "/"], [signup ? tr("Créer mon profil") : tr("Se connecter"), "#"]]} /></div>
      <div className="pfc" style={{ maxWidth: 520 }}>
        <div className="panel regp">
          <h1 className="regh">{signup ? tr("Créer mon profil") : tr("Se connecter")}</h1>
          <p className="note">{signup ? tr("Crée ton compte avec ton e-mail et un mot de passe.") : tr("Retrouve ton profil avec ton e-mail et ton mot de passe.")}</p>
          <form className="fs" style={{ border: 0, padding: 0 }} onSubmit={go}>
            <label className="f">{tr("Adresse e-mail")}<input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" /></label>
            <label className="f">{tr("Mot de passe (8 caractères minimum)")}<input type={show ? "text" : "password"} required minLength={8} value={pw} onChange={(e) => setPw(e.target.value)} autoComplete={signup ? "new-password" : "current-password"} /></label>
            {signup && (() => { const k = strength(pw); const L = [tr("Trop court"), tr("Faible"), tr("Moyen"), tr("Solide"), tr("Très solide")][k]; const col = ["#c0392b", "#e67e22", "#d4a017", "#2e9e5b", "#1f8a4c"][k];
              return <div className="pwh" aria-live="polite">
                <div className="pwbar" aria-hidden="true">{[1, 2, 3, 4].map((i) => <i key={i} style={{ background: pw && k >= i ? col : undefined }} />)}</div>
                <small>{pw ? <><b style={{ color: col }}>{L}</b> · </> : null}{tr("Conseil : 12 caractères ou plus, avec majuscules, chiffres et symboles. N’utilise pas le même mot de passe qu’ailleurs.")}</small>
                <div className="pwa"><button type="button" className="btn ghost" onClick={() => { setPw(suggest()); setShow(true); }}>🔐 {tr("Suggérer un mot de passe sûr")}</button>
                  <button type="button" className="btn ghost" onClick={() => setShow(!show)}>{show ? tr("Masquer") : tr("Afficher")}</button></div>
                {show && pw && <small>{tr("Note-le dans un endroit sûr (gestionnaire de mots de passe) avant de continuer.")}</small>}
              </div>; })()}
            {signup && <label className="chk"><input type="checkbox" required checked={adult} onChange={(e) => setAdult(e.target.checked)} /> <span>{tr("Je certifie avoir")} <b>{tr("18 ans ou plus")}</b> {tr("et j’accepte les")} <Link href="/cgu" style={{ textDecoration: "underline" }}>{tr("conditions d’utilisation")}</Link> {tr("et la")} <Link href="/confidentialite" style={{ textDecoration: "underline" }}>{tr("politique de confidentialité")}</Link>.</span></label>}
            <Turnstile onToken={setCap} resetKey={capN} />
            {msg && <p className="note" role="alert" style={{ color: msg.ok ? "inherit" : "var(--btn)", fontWeight: 700 }}>{msg.t}</p>}
            <button className="btn" disabled={busy || !cap}>{signup ? tr("Créer mon compte") : tr("Me connecter")}</button>
            <button type="button" className="btn ghost" onClick={() => setSignup(!signup)}>{signup ? tr("J’ai déjà un compte") : tr("Pas encore de compte ?")}</button>
          </form>
        </div>
      </div>
    </section>
  );
}
export default function Page() { return <Suspense><Form /></Suspense>; }
