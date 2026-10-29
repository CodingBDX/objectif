"use client";
import { useState } from "react";
import Ic from "./Ic";
import CopyBtn from "./CopyBtn";
import { TrackLink } from "./Track";
import { sbLazy } from "@/lib/supabase/lazy";
import { useT } from "@/lib/i18n";

const telHref = (s: string) => { const d = s.replace(/[^\d+]/g, ""); return /^0\d{9}$/.test(d) ? "+33" + d.slice(1) : d.replace(/^00/, "+"); };
const waHref = (s: string, text?: string) => { let d = s.replace(/\D/g, ""); if (/^0\d{9}$/.test(d)) d = "33" + d.slice(1); else d = d.replace(/^00/, ""); return `https://wa.me/${d}${text ? `?text=${encodeURIComponent(text)}` : ""}`; };
const fmtPh = (s: string) => { const d = s.replace(/\D/g, ""); return /^0\d{9}$/.test(d) ? d.replace(/(\d{2})(?=\d)/g, "$1 ") : s; };

/** Le numéro n'est jamais dans la page : il est demandé à la base au clic, avec une limite par visiteur (anti-scraping). */
export default function PhoneReveal({ id, live, mine, name }: { id: string; live: boolean; mine: boolean; name: string }) {
  const { tr } = useT();
  const [ph, setPh] = useState<string | null>(null); const [busy, setBusy] = useState(false); const [err, setErr] = useState("");
  async function show() {
    setBusy(true); setErr("");
    try { const sb = await sbLazy(); const { data, error } = await sb.rpc("reveal_phone", { p_id: id });
      if (error) setErr(/trop/i.test(error.message) ? tr("Trop de demandes. Réessaie dans un moment.") : error.message); else if (!data) setErr(tr("Numéro non disponible.")); else setPh(String(data)); }
    catch { setErr(tr("Impossible d’afficher le numéro.")); }
    setBusy(false);
  }
  if (!ph) return (
    <span className="pph"><Ic n="phone" s={18} />
      <button type="button" className="nb phb2" onClick={show} disabled={busy} aria-label={live ? `WhatsApp ${name}` : `${tr("Afficher le numéro")} ${name}`}>{busy ? tr("Chargement…") : live ? tr("Afficher le WhatsApp") : tr("Afficher le numéro")}</button>
      {err && <small role="alert" style={{ color: "var(--btn)", fontWeight: 700 }}>{err}</small>}
    </span>
  );
  return (
    <span className="pph"><Ic n="phone" s={18} /><TrackLink id={id} kind="call" skip={mine} className="nb" href={live ? waHref(ph, tr("Bonjour {n}, je vous contacte depuis Sex-Escorte.com. Êtes-vous disponible ?", { n: name })) : `tel:${telHref(ph)}`} aria-label={live ? `WhatsApp ${name}` : `Appeler ${name}`} {...(live ? { target: "_blank", rel: "noopener noreferrer" } : {})}>{fmtPh(ph)}</TrackLink><CopyBtn text={ph} label="Copier" className="" trackId={mine ? undefined : id} /></span>
  );
}
