"use client";
import { useState } from "react";
import Ic from "./Ic";
import CopyBtn from "./CopyBtn";
import { TrackLink } from "./Track";
import { sbLazy } from "@/lib/supabase/lazy";
import { useT } from "@/lib/i18n";

const telHref = (s: string) => { const d = s.replace(/[^\d+]/g, ""); return /^0\d{9}$/.test(d) ? "+33" + d.slice(1) : d.replace(/^00/, "+"); };
const waHref = (s: string, text?: string) => { let d = s.replace(/\D/g, ""); if (/^0\d{9}$/.test(d)) d = "33" + d.slice(1); else d = d.replace(/^00/, ""); return `https://wa.me/${d}${text ? `?text=${encodeURIComponent(text)}` : ""}`; };
const waDigits = (s: string) => { let d = s.replace(/\D/g, ""); if (/^0\d{9}$/.test(d)) d = "33" + d.slice(1); else d = d.replace(/^00/, ""); return d; };
/** Sur téléphone : ouvre l'application WhatsApp directement (sans la page intermédiaire de WhatsApp) ; si elle n'est pas installée, on retombe sur le lien wa.me. */
const waOpen = (ph: string, text: string) => (e: React.MouseEvent<HTMLAnchorElement>) => {
  if (typeof navigator === "undefined" || !/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) return;
  e.preventDefault();
  const t = setTimeout(() => { window.open(waHref(ph, text), "_blank", "noopener"); }, 1600);
  const stop = () => clearTimeout(t); document.addEventListener("visibilitychange", stop, { once: true }); window.addEventListener("pagehide", stop, { once: true });
  location.href = `whatsapp://send?phone=${waDigits(ph)}&text=${encodeURIComponent(text)}`;
};
const fmtPh = (s: string) => { const d = s.replace(/\D/g, ""); return /^0\d{9}$/.test(d) ? d.replace(/(\d{2})(?=\d)/g, "$1 ") : s; };

/** Le numéro n'est jamais dans la page : il est demandé à la base au clic, avec une limite par visiteur (anti-scraping). */
export default function PhoneReveal({ id, path, live, mine, name, wa, sms }: { id: string; path?: string; live: boolean; mine: boolean; name: string; wa?: boolean; sms?: boolean }) {
  const { tr } = useT();
  const origin = typeof location !== "undefined" ? location.origin : "https://sex-escorte.com";
  // Le premier lien (l’accueil) donne l’aperçu avec l’image du site dans WhatsApp / SMS ; le lien du profil vient après ; une image ne peut pas être jointe automatiquement.
  const msg = tr("Bonjour {n} 👋\nJe vous contacte depuis Sex-Escorte.com : {h}\nJ’ai vu votre profil : {u}\nÊtes-vous disponible ?", { n: name, h: origin, u: `${origin}${path || `/profil/${id}`}` });
  const [ph, setPh] = useState<string | null>(null); const [busy, setBusy] = useState(false); const [err, setErr] = useState("");
  async function show() {
    setBusy(true); setErr("");
    try { const sb = await sbLazy(); const { data, error } = await sb.rpc("reveal_phone", { p_id: id });
      if (error) setErr(/trop/i.test(error.message) ? tr("Trop de demandes. Réessaie dans un moment.") : error.message); else if (!data) setErr(tr("Numéro non disponible.")); else setPh(String(data)); }
    catch { setErr(tr("Impossible d’afficher le numéro.")); }
    setBusy(false);
  }
  const wb = wa && !live, sb2 = sms && !live;
  if (!ph) return (<>
    <span className="pph"><Ic n="phone" s={18} />
      <button type="button" className="nb phb2" onClick={show} disabled={busy} aria-label={live ? `WhatsApp ${name}` : `${tr("Afficher le numéro")} ${name}`}>{busy ? tr("Chargement…") : live ? tr("Afficher le WhatsApp") : tr("Afficher le numéro")}</button>
      {err && <small role="alert" style={{ color: "var(--btn)", fontWeight: 700 }}>{err}</small>}
    </span>
    {wb && <button type="button" className="soc wab" onClick={show} disabled={busy} aria-label={`WhatsApp ${name}`} title="WhatsApp"><svg className="ic" viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M20 11.5a8 8 0 0 1-11.8 7L4 20l1.5-4.1A8 8 0 1 1 20 11.5z"/><path d="M9 8.5c0 3 2.5 5.5 5.5 5.5l1-1.3-1.8-.9-.8.6a4 4 0 0 1-1.8-1.8l.6-.8-.9-1.8z"/></svg></button>}
    {sb2 && <button type="button" className="soc wab smsb" onClick={show} disabled={busy} aria-label={`SMS ${name}`} title="SMS"><svg className="ic" viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M4 5h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H9l-4 3.5V17H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z"/><path d="M8 10h8M8 13h5"/></svg></button>}
  </>);
  return (<>
    <span className="pph"><Ic n="phone" s={18} /><TrackLink id={id} kind="call" skip={mine} className="nb" href={live ? waHref(ph, msg) : `tel:${telHref(ph)}`} aria-label={live ? `WhatsApp ${name}` : `Appeler ${name}`} {...(live ? { target: "_blank", rel: "noopener noreferrer", onClick: waOpen(ph, msg) } : {})}>{fmtPh(ph)}</TrackLink><CopyBtn text={ph} label="Copier" className="" trackId={mine ? undefined : id} /></span>
    {wb && <TrackLink id={id} kind="call" skip={mine} className="soc wab" href={waHref(ph, msg)} target="_blank" rel="noopener noreferrer" onClick={waOpen(ph, msg)} aria-label={`WhatsApp ${name}`} title="WhatsApp"><svg className="ic" viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M20 11.5a8 8 0 0 1-11.8 7L4 20l1.5-4.1A8 8 0 1 1 20 11.5z"/><path d="M9 8.5c0 3 2.5 5.5 5.5 5.5l1-1.3-1.8-.9-.8.6a4 4 0 0 1-1.8-1.8l.6-.8-.9-1.8z"/></svg></TrackLink>}
    {sb2 && <TrackLink id={id} kind="call" skip={mine} className="soc wab smsb" href={`sms:${telHref(ph)}?&body=${encodeURIComponent(msg)}`} aria-label={`SMS ${name}`} title="SMS"><svg className="ic" viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M4 5h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H9l-4 3.5V17H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z"/><path d="M8 10h8M8 13h5"/></svg></TrackLink>}
  </>);
}
