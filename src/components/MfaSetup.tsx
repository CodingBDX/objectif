"use client";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import { useT } from "@/lib/i18n";

type Pending = { id: string; qr: string; secret: string };

/** Code à 6 chiffres demandé après le mot de passe (compte protégé). */
export function MfaChallenge({ onOk, title }: { onOk: () => void; title?: string }) {
  const { tr } = useT(); const sb = supabaseBrowser();
  const [code, setCode] = useState(""); const [busy, setBusy] = useState(false); const [err, setErr] = useState("");
  async function go(e: FormEvent) {
    e.preventDefault(); setBusy(true); setErr("");
    const { data: f } = await sb.auth.mfa.listFactors(); const fac = f?.totp?.[0];
    if (!fac) { setErr(tr("Aucune double authentification trouvée.")); setBusy(false); return; }
    const { error } = await sb.auth.mfa.challengeAndVerify({ factorId: fac.id, code: code.replace(/\s/g, "") });
    setBusy(false);
    if (error) { setErr(tr("Code incorrect ou expiré. Réessaie avec le code actuel.")); setCode(""); return; }
    onOk();
  }
  return (
    <form className="fs" style={{ border: 0, padding: 0 }} onSubmit={go}>
      <h2 style={{ margin: 0 }}>🔐 {title || tr("Code de sécurité")}</h2>
      <p className="note" style={{ margin: 0 }}>{tr("Ouvre ton application (Google Authenticator, Authy…) et saisis le code à 6 chiffres.")}</p>
      <label className="f">{tr("Code à 6 chiffres")}<input inputMode="numeric" autoComplete="one-time-code" pattern="[0-9 ]{6,7}" maxLength={7} required autoFocus value={code} onChange={(e) => setCode(e.target.value)} /></label>
      {err && <p className="note" role="alert" style={{ margin: 0, color: "var(--btn)", fontWeight: 700 }}>{err}</p>}
      <button className="btn" disabled={busy || code.replace(/\s/g, "").length < 6}>{busy ? "…" : tr("Valider")}</button>
    </form>
  );
}

/** Activer / désactiver la double authentification par application (TOTP). */
export default function MfaSetup({ forced = false, onDone }: { forced?: boolean; onDone?: () => void }) {
  const { tr } = useT(); const sb = supabaseBrowser();
  const [factor, setFactor] = useState<string | null | undefined>(undefined); // undefined = chargement
  const [pend, setPend] = useState<Pending | null>(null); const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false); const [msg, setMsg] = useState<{ t: string; ok?: boolean } | null>(null); const [off, setOff] = useState(false); const [acct, setAcct] = useState("");
  const load = useCallback(async () => {
    const { data, error } = await sb.auth.mfa.listFactors();
    if (error) { setOff(true); setFactor(null); return; }
    setFactor(data?.totp?.[0]?.id ?? null);
  }, [sb]);
  useEffect(() => { load(); }, [load]);

  async function start() {
    setBusy(true); setMsg(null);
    const { data: all } = await sb.auth.mfa.listFactors();
    for (const f of (all?.all || []).filter((x) => x.status === "unverified")) await sb.auth.mfa.unenroll({ factorId: f.id });
    const { data: u } = await sb.auth.getUser(); const mail = u?.user?.email || "mon-compte";
    setAcct(mail);
    const params = { factorType: "totp" as const, friendlyName: mail, issuer: "Sex-Escorte" };
    const { data, error } = await sb.auth.mfa.enroll(params);
    setBusy(false);
    if (error || !data) { setOff(true); setMsg({ t: tr("La double authentification n’est pas disponible pour le moment.") + (error ? " (" + error.message + ")" : "") }); return; }
    setPend({ id: data.id, qr: data.totp.qr_code, secret: data.totp.secret });
  }
  async function confirm(e: FormEvent) {
    e.preventDefault(); if (!pend) return; setBusy(true); setMsg(null);
    const { error } = await sb.auth.mfa.challengeAndVerify({ factorId: pend.id, code: code.replace(/\s/g, "") });
    setBusy(false);
    if (error) { setMsg({ t: tr("Code incorrect. Vérifie l’heure de ton téléphone et réessaie.") }); setCode(""); return; }
    setPend(null); setCode(""); setFactor(pend.id); setMsg({ t: tr("Double authentification activée ✓"), ok: true }); onDone?.();
  }
  async function disable() {
    if (!factor) return; setBusy(true); setMsg(null);
    const { error } = await sb.auth.mfa.unenroll({ factorId: factor });
    setBusy(false);
    if (error) { setMsg({ t: tr("Impossible de la désactiver : reconnecte-toi avec ton code puis réessaie.") }); return; }
    setFactor(null); setMsg({ t: tr("Double authentification désactivée."), ok: true });
  }
  if (factor === undefined) return null;
  const body = (
    <>
      {off && !pend && <p className="note" style={{ margin: 0 }}>{tr("Cette option n’est pas encore activée sur le site.")}</p>}
      {!off && factor && <>
        <p className="note" style={{ margin: 0 }}>✅ {tr("Activée : un code de ton application te sera demandé à chaque connexion.")}</p>
        {!forced && <button type="button" className="btn ghost" disabled={busy} onClick={disable}>{tr("Désactiver")}</button>}
      </>}
      {!off && !factor && !pend && <>
        <p className="note" style={{ margin: 0 }}>{forced ? tr("Obligatoire pour l’administration : ajoute une application d’authentification (Google Authenticator, Authy, 1Password…).") : tr("Même si quelqu’un trouve ton mot de passe, il ne pourra pas entrer sans le code de ton téléphone. Facultatif, mais recommandé.")}</p>
        <button type="button" className="btn" disabled={busy} onClick={start}>{busy ? "…" : tr("Activer la double authentification")}</button>
      </>}
      {pend && <form className="fs" style={{ border: 0, padding: 0 }} onSubmit={confirm}>
        <p className="note" style={{ margin: 0 }}><b>1.</b> {tr("Scanne ce QR code avec ton application d’authentification.")}</p>
        <img src={pend.qr} alt={tr("QR code de la double authentification")} width={180} height={180} style={{ background: "#fff", borderRadius: 16, padding: 8, border: "1px solid var(--line)", justifySelf: "center" }} />
        <div className="note" style={{ margin: 0, display: "grid", gap: 4 }}><span>{tr("Pas de QR code ? Saisis à la main dans ton application :")}</span>
          <span>• {tr("Site / émetteur")} : <b>Sex-Escorte</b></span>
          <span>• {tr("Compte / utilisateur")} : <b style={{ wordBreak: "break-all" }}>{acct}</b></span>
          <span>• {tr("Clé secrète")} : <code style={{ wordBreak: "break-all", userSelect: "all" }}>{pend.secret}</code></span>
          <span>• {tr("Type : basé sur l’heure (TOTP)")}</span></div>
        <p className="note" style={{ margin: 0 }}><b>2.</b> {tr("Saisis le code à 6 chiffres affiché.")}</p>
        <input aria-label={tr("Code à 6 chiffres")} inputMode="numeric" autoComplete="one-time-code" maxLength={7} required value={code} onChange={(e) => setCode(e.target.value)} />
        <button className="btn" disabled={busy || code.replace(/\s/g, "").length < 6}>{busy ? "…" : tr("Confirmer")}</button>
      </form>}
      {msg && <p className="note" role={msg.ok ? "status" : "alert"} style={{ margin: 0, fontWeight: 700, color: msg.ok ? "inherit" : "var(--btn)" }}>{msg.t}</p>}
    </>
  );
  return forced ? <div style={{ display: "grid", gap: 12 }}>{body}</div> : <section className="dcard"><h3>🔐 {tr("Double authentification")}</h3>{body}</section>;
}
