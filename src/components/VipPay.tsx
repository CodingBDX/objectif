"use client";
import { useCallback, useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import { useT } from "@/lib/i18n";
import { VIP_PLANS } from "@/components/VipPrices";
import { notifyAdmin } from "@/lib/notifyAdmin";
import Ic from "@/components/Ic";

const WERO = "+33695358137"; const PAYPAL_NAME = "Angèle Charier";
const PAYPAL_URL = process.env.NEXT_PUBLIC_PAYPAL_URL || "https://www.paypal.com/myaccount/transfer/homepage/pay";
type Order = { id: string; plan: string; amount: number; ref: string; status: "pending" | "declared" | "validated" | "refused" | "cancelled" };

/** Mon espace : choisir un forfait VIP, voir comment payer (Wero / PayPal), puis « J'ai payé » -> l'admin vérifie et valide. */
export default function VipPay({ vip }: { vip: boolean }) {
  const { tr } = useT(); const sb = supabaseBrowser();
  const [o, setO] = useState<Order | null>(null); const [plan, setPlan] = useState(VIP_PLANS[1][0]); const [busy, setBusy] = useState(false); const [err, setErr] = useState(""); const [copied, setCopied] = useState(false); const [ready, setReady] = useState(false);
  const load = useCallback(async () => {
    const { data, error } = await sb.from("vip_orders").select("id,plan,amount,ref,status").in("status", ["pending", "declared", "refused"]).order("created_at", { ascending: false }).limit(1);
    if (!error) setO((data && data[0]) as Order | null); setReady(true);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { load(); }, [load]);
  const call = async (fn: string, args: Record<string, unknown>, after?: () => void) => {
    setBusy(true); setErr(""); const { error } = await sb.rpc(fn, args); setBusy(false);
    if (error) { setErr(tr("Impossible pour le moment, réessaie dans un instant.")); return; } after?.(); load();
  };
  const copy = async () => { try { await navigator.clipboard.writeText(WERO); setCopied(true); setTimeout(() => setCopied(false), 1800); } catch {} };
  if (!ready) return null;

  if (o && o.status === "declared") return (
    <div className="vpay ok" role="status"><b>⏳ {tr("Paiement signalé")}</b>
      <span>{tr("Merci ! On vérifie la réception de ton paiement de {a} € (forfait {p}, référence {r}). Ton VIP est activé dès que c’est confirmé.", { a: o.amount, p: tr(o.plan), r: o.ref })}</span>
      <button type="button" className="btn ghost" disabled={busy} onClick={() => call("vip_order_cancel", { p_id: o.id })}>{tr("Annuler cette demande")}</button></div>);

  if (o && o.status === "pending") return (
    <div className="vpay" role="alert"><b>👑 {tr("Paiement VIP : forfait {p}, {a} €", { p: tr(o.plan), a: o.amount })}</b>
      <span>{tr("Règle {a} € par Wero ou PayPal, puis clique sur « J’ai payé ». Écris la référence dans le message du paiement :", { a: o.amount })} <code className="vref">{o.ref}</code></span>
      <div className="vpay-m">
        <div><small>Wero</small><b>{WERO}</b><button type="button" className="btn ghost" onClick={copy}>{copied ? tr("Copié ✓") : tr("Copier le numéro")}</button></div>
        <div><small>PayPal</small><b>{PAYPAL_NAME}</b><a className="btn ghost" href={PAYPAL_URL} target="_blank" rel="noopener noreferrer">{tr("Payer avec PayPal")}</a></div>
      </div>
      <div className="vpay-a"><button type="button" className="btn" disabled={busy} onClick={() => call("vip_order_declare", { p_id: o.id }, () => notifyAdmin("paiement"))}>{tr("J’ai payé")}</button>
        <button type="button" className="btn ghost" disabled={busy} onClick={() => call("vip_order_cancel", { p_id: o.id })}>{tr("Annuler")}</button></div>
      {err && <small className="vpay-e" role="alert">{err}</small>}</div>);

  return (
    <details className="dcard actbox vpay-c">
      <summary><Ic n="crown" s={20} />{vip ? tr("Prolonger mon VIP") : tr("Passer en VIP")}<small>{tr("Choisis ton forfait · paiement Wero ou PayPal")}</small></summary>
      <div style={{ display: "grid", gap: 12, padding: "16px 18px" }}>
        {o && o.status === "refused" && <p className="note" role="alert" style={{ margin: 0, color: "var(--btn)", fontWeight: 700 }}>{tr("Ton dernier paiement n’a pas pu être confirmé. Contacte-nous si tu penses que c’est une erreur.")}</p>}
        <div className="vplans" role="radiogroup" aria-label={tr("Forfait VIP")}>{VIP_PLANS.map(([d, p]) => <label key={d} className={`vplan${plan === d ? " on" : ""}`}><input type="radio" name="vplan" checked={plan === d} onChange={() => setPlan(d)} /><span>{tr(d)}</span><b>{p} €</b></label>)}</div>
        <button type="button" className="btn" disabled={busy} onClick={() => call("vip_order_create", { p_plan: plan })}>{tr("Continuer vers le paiement")}</button>
        {err && <small className="vpay-e" role="alert">{err}</small>}
      </div>
    </details>);
}
