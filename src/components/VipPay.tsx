"use client";
import { useCallback, useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import { useT } from "@/lib/i18n";
import { useVipPlans } from "@/lib/vipPlans";
import { notifyAdmin } from "@/lib/notifyAdmin";
import Ic from "@/components/Ic";

const WERO = "+33695358137"; const PAYPAL_NAME = "Angèle";
const PAYPAL_ME = "https://www.paypal.me/angeleyessika";
type Order = { id: string; plan: string; amount: number; ref: string; created_at: string; status: "pending" | "declared" | "validated" | "refused" | "cancelled" };

/** Mon espace : choisir un forfait VIP, voir comment payer (Wero / PayPal), puis « J'ai payé » -> l'admin vérifie et valide. */
export default function VipPay({ vip }: { vip: boolean }) {
  const { tr } = useT(); const sb = supabaseBrowser();
  const [o, setO] = useState<Order | null>(null); const plans = useVipPlans(); const [plan, setPlan] = useState(""); const [busy, setBusy] = useState(false); const [err, setErr] = useState(""); const [copied, setCopied] = useState(false); const [ready, setReady] = useState(false); const [bank, setBank] = useState<{ iban: string; bic: string; holder: string } | null>(null); const [copiedI, setCopiedI] = useState(false); const [okT, setOkT] = useState(false); const [bopen, setBopen] = useState(false); const [fn, setFn] = useState(""); const [ln, setLn] = useState(""); const [okM, setOkM] = useState(false); const [left, setLeft] = useState(0);
  const load = useCallback(async () => {
    const { data, error } = await sb.from("vip_orders").select("id,plan,amount,ref,status,created_at").in("status", ["pending", "declared", "refused"]).order("created_at", { ascending: false }).limit(1);
    if (!error) setO((data && data[0]) as Order | null); setReady(true);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { load(); }, [load]);
  const oid = o && o.status === "pending" ? o.id : ""; const created = o?.created_at || "";
  useEffect(() => { setBank(null); setBopen(false); if (!oid) return; (async () => { const { data, error } = await sb.rpc("vip_order_bank", { p_id: oid, p_first: "", p_last: "" }); if (!error && data && data.iban) { setBank(data); setBopen(true); } })(); }, [oid]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (!created) return; const t = () => setLeft(Math.max(0, new Date(created).getTime() + 2 * 3600 * 1000 - Date.now())); t(); const i = setInterval(t, 1000); return () => clearInterval(i); }, [created]);
  const showBank = async () => {
    if (!o) return; setBusy(true); setErr("");
    const { data, error } = await sb.rpc("vip_order_bank", { p_id: o.id, p_first: fn, p_last: ln }); setBusy(false);
    if (error || !data || !data.iban) { setErr(error && /expiree/.test(error.message) ? tr("Cette référence a expiré. Annule et refais une commande.") : tr("Impossible pour le moment. Vérifie le prénom et le nom, ou réessaie dans un instant.")); return; }
    setBank(data);
  };
  const hms = (ms: number) => { const t = Math.floor(ms / 1000); return [Math.floor(t / 3600), Math.floor((t % 3600) / 60), t % 60].map((n) => String(n).padStart(2, "0")).join(":"); };
  const copyI = async () => { try { await navigator.clipboard.writeText((bank?.iban || "").replace(/\s/g, "")); setCopiedI(true); setTimeout(() => setCopiedI(false), 1800); } catch {} };
  const call = async (fn: string, args: Record<string, unknown>, after?: () => void) => {
    setBusy(true); setErr(""); const { error } = await sb.rpc(fn, args); setBusy(false);
    if (error) { setErr(tr("Impossible pour le moment, réessaie dans un instant.")); return; } after?.(); load();
  };
  const copy = async () => { try { await navigator.clipboard.writeText(WERO); setCopied(true); setTimeout(() => setCopied(false), 1800); } catch {} };
  const cur = plan || (plans[1] || plans[0])?.id || "";
  if (!ready) return null;

  if (o && o.status === "declared") return (
    <div className="vpay ok" role="status"><b>⏳ {tr("Paiement signalé")}</b>
      <span>{tr("Merci ! On vérifie la réception de ton paiement de {a} € (forfait {p}, référence {r}). Ton VIP est activé dès que c’est confirmé.", { a: o.amount, p: tr(o.plan), r: o.ref })}</span>
      <button type="button" className="btn ghost" disabled={busy} onClick={() => call("vip_order_cancel", { p_id: o.id })}>{tr("Annuler cette demande")}</button></div>);

  if (o && o.status === "pending" && left <= 0 && created) return (
    <div className="vpay" role="alert"><b>⌛ {tr("Référence expirée")}</b>
      <span>{tr("Le délai de 2 h est dépassé : la référence {r} n’est plus valable. Ne fais pas de paiement avec elle. Refais une commande.", { r: o.ref })}</span>
      <button type="button" className="btn" disabled={busy} onClick={() => call("vip_order_cancel", { p_id: o.id })}>{tr("Nouvelle commande")}</button></div>);

  if (o && o.status === "pending") return (
    <div className="vpay" role="alert"><b>👑 {tr("Paiement VIP : forfait {p}, {a} €", { p: tr(o.plan), a: o.amount })}</b>
      <span className="vtime">⏱ {tr("Temps restant")} <b>{hms(left)}</b>. {tr("Passé ce délai, la référence n’est plus valable.")}</span>
      <span>{tr("Règle {a} € par Wero, PayPal ou virement, puis clique sur « J’ai payé ». Si tu peux, écris la référence dans le message du paiement (conseillé pour le virement, facultatif pour Wero et PayPal, on retrouve ta commande avec ton « J’ai payé ») :", { a: o.amount })} <code className="vref">{o.ref}</code></span>
      <div className="vpay-m">
        <div><small>Wero</small><b>{WERO}</b><button type="button" className="btn ghost" onClick={copy}>{copied ? tr("Copié ✓") : tr("Copier le numéro")}</button></div>
        <div><small>PayPal</small><b>{PAYPAL_NAME}</b><a className="btn ghost" href={`${PAYPAL_ME}/${o.amount}EUR`} target="_blank" rel="noopener noreferrer">{tr("Payer avec PayPal")}</a></div>
        <div className="vbank"><small>{tr("Virement (instantané possible)")}</small>
          {bank ? <>{bank.holder && <b>{bank.holder}</b>}<b style={{ wordBreak: "break-all" }}>{bank.iban.replace(/\s/g, "").replace(/(.{4})/g, "$1 ").trim()}</b>{bank.bic && <span>BIC : {bank.bic}</span>}<span>{tr("Motif du virement :")} <code className="vref">{o.ref}</code></span><button type="button" className="btn ghost" onClick={copyI}>{copiedI ? tr("Copié ✓") : tr("Copier l’IBAN")}</button></>
          : !bopen ? <button type="button" className="btn ghost" onClick={() => setBopen(true)}>{tr("Payer par virement")}</button>
          : <>
            <span>{tr("Indique le prénom et le nom du titulaire du compte qui envoie le virement, pour que l’on identifie ton paiement. Une fois les coordonnées affichées, ce nom ne se modifie plus.")}</span>
            <label className="f">{tr("Prénom")}<input value={fn} onChange={(e) => setFn(e.target.value)} maxLength={60} autoComplete="given-name" /></label>
            <label className="f">{tr("Nom")}<input value={ln} onChange={(e) => setLn(e.target.value)} maxLength={60} autoComplete="family-name" /></label>
            <label className="chk" style={{ fontSize: 14 }}><input type="checkbox" checked={okM} onChange={(e) => setOkM(e.target.checked)} /> <span>{tr("J’indiquerai dans le motif du virement la référence affichée à l’étape suivante. Sans elle, le paiement n’est pas reconnu.")}</span></label>
            <button type="button" className="btn" disabled={busy || !okM || fn.trim().length < 2 || ln.trim().length < 2} onClick={showBank}>{tr("Afficher les coordonnées")}</button></>}
        </div>
      </div>
      <label className="chk" style={{ fontSize: 14 }}><input type="checkbox" checked={okT} onChange={(e) => setOkT(e.target.checked)} /> <span>{tr("J’ai lu les conditions du VIP (CGU, article 6). Je demande l’activation immédiate et, dans la mesure permise par la loi, je renonce à mon droit de rétractation une fois le VIP activé.")} <a href="/cgu#vip" target="_blank" rel="noopener noreferrer">{tr("Lire")}</a></span></label>
      <div className="vpay-a"><button type="button" className="btn" disabled={busy || !okT} onClick={() => call("vip_order_declare", { p_id: o.id }, () => notifyAdmin("paiement"))}>{tr("J’ai payé")}</button>
        <button type="button" className="btn ghost" disabled={busy} onClick={() => call("vip_order_cancel", { p_id: o.id })}>{tr("Annuler")}</button></div>
      {err && <small className="vpay-e" role="alert">{err}</small>}</div>);

  return (
    <details className="dcard actbox vpay-c">
      <summary><Ic n="crown" s={20} />{vip ? tr("Prolonger mon VIP") : tr("Passer en VIP")}<small>{tr("Choisis ton forfait · paiement Wero, PayPal ou virement")}</small></summary>
      <div style={{ display: "grid", gap: 12, padding: "16px 18px" }}>
        {o && o.status === "refused" && <p className="note" role="alert" style={{ margin: 0, color: "var(--btn)", fontWeight: 700 }}>{tr("Ton dernier paiement n’a pas pu être confirmé. Contacte-nous si tu penses que c’est une erreur.")}</p>}
        <div className="vplans" role="radiogroup" aria-label={tr("Forfait VIP")}>{plans.map((x) => <label key={x.id} className={`vplan${cur === x.id ? " on" : ""}`}><input type="radio" name="vplan" checked={cur === x.id} onChange={() => setPlan(x.id)} /><span>{tr(x.label)}</span><b>{x.price} €</b></label>)}</div>
        <button type="button" className="btn" disabled={busy} onClick={() => call("vip_order_create", { p_plan: cur })}>{tr("Continuer vers le paiement")}</button>
        {err && <small className="vpay-e" role="alert">{err}</small>}
      </div>
    </details>);
}
