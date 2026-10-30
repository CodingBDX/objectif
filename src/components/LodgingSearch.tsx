"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useT } from "@/lib/i18n";
import CityInput from "@/components/CityInput";
import { cityCentre, km } from "@/lib/dist";
import { slug } from "@/lib/site";
import { WARNING } from "@/lib/lodging";
import { sbLazy } from "@/lib/supabase/lazy";

export type LItem = { id: string; title: string; city: string; area: string | null; lat: number | null; lon: number | null; photo: string; day: number | null; week: number | null; month: number | null; owner: string };
const RADII = [0, 10, 25, 50, 100, 200, 100000];

export default function LodgingSearch({ items, strip, initialCity = "" }: { items: LItem[]; strip?: boolean; initialCity?: string }) {
  const { tr } = useT(); const [city, setCity] = useState(initialCity); const [r, setR] = useState(25); const [c0, setC0] = useState<[number, number] | null>(null);
  const [alerts, setAlerts] = useState<string[]>([]); const [aMsg, setAMsg] = useState("");
  useEffect(() => { (async () => { try { const sb = await sbLazy(); const { data } = await sb.rpc("my_lodging_alerts"); setAlerts(((data || []) as { city: string }[]).map((x) => x.city.toLowerCase())); } catch {} })(); }, []);
  const alertOn = !!city && alerts.includes(city.toLowerCase());
  async function toggleAlert(on: boolean) {
    setAMsg(""); const sb = await sbLazy(); const { error } = await sb.rpc("set_lodging_alert", { p_city: city, p_on: on });
    if (error) { setAMsg(error.message); return; }
    setAlerts((a) => on ? [...a, city.toLowerCase()] : a.filter((x) => x !== city.toLowerCase()));
    setAMsg(on ? tr("✔ Alerte activée : tu seras prévenu·e par e-mail.") : tr("Alerte désactivée."));
  }
  const pick = async (v: string) => { setC0(v ? await cityCentre(v) : null); };
  useEffect(() => { setCity(initialCity); if (initialCity) cityCentre(initialCity).then(setC0); else setC0(null); }, [initialCity]);
  const list = useMemo(() => {
    if (!city) return items;
    return items.filter((l) => {
      if (slug(l.city) === slug(city)) return true;
      if (r === 0 || !c0 || l.lat == null || l.lon == null) return false;
      return km(c0, [l.lon, l.lat]) <= r;
    });
  }, [items, city, r, c0]);
  return (
    <>
      <section className="dcard" style={{ display: "grid", gap: 12 }}>
        <p className="note" role="note" style={{ margin: 0 }}>⚠️ {tr(WARNING)}</p>
        <div className="row2">
          <div className="f"><span style={{ fontSize: 14, fontWeight: 700, color: "var(--mut)" }}>{tr("Ville")}</span>
            <CityInput value={city} onChange={(v) => { setCity(v); if (!v) setC0(null); }} onPick={pick} label={tr("Ville")} placeholder={tr("Ex. Lyon")} /></div>
          <label className="f">{tr("Distance autour de la ville")}
            <select value={r} onChange={(e) => setR(Number(e.target.value))}>{RADII.map((x) => <option key={x} value={x}>{x === 0 ? tr("Cette ville seulement") : x >= 100000 ? tr("Toute la France") : `${x} km`}</option>)}</select></label></div>
        {city.trim().length >= 2 && <label className="chk"><input type="checkbox" checked={alertOn} onChange={(e) => toggleAlert(e.target.checked)} /> <span>{tr("🔔 Je cherche un logement à {c} : préviens-moi par e-mail quand il y en a un.", { c: city })}</span></label>}
        {aMsg && <p className="note" role="status" style={{ margin: 0 }}>{aMsg}</p>}
      </section>
      {strip && list.length > 0 ? <div className="lstrip">{list.map((l) => (
          <Link key={l.id} href={`/logements/${l.id}`} className="lslide" aria-label={l.title}>
            <i>{l.photo ? <img src={l.photo} alt="" loading="lazy" /> : null}</i>
            <b>{l.title}</b><small>{l.city}{l.day ? ` · ${l.day} €` : l.week ? ` · ${l.week} €` : l.month ? ` · ${l.month} €` : ""}</small></Link>))}</div> : null}
      {strip && list.length > 0 ? null : list.length === 0 ? <p className="note" role="status">{tr("Aucun logement ici pour l’instant. Élargis la distance, ou propose le tien depuis Modifier le profil.")}</p> :
        <div className="lgrid">{list.map((l) => (
          <Link key={l.id} href={`/logements/${l.id}`} className="lcard">
            {l.photo ? <img src={l.photo} alt={l.title} width={640} height={420} loading="lazy" decoding="async" /> : <span className="lph" />}
            <div className="lbody"><b>{l.title}</b><span className="note">📍 {l.city}{l.area ? ` · ${l.area}` : ""}</span>
              <span className="rates">{l.day ? <span>{tr("Jour")} <b>{l.day}</b></span> : null}{l.week ? <span>{tr("Semaine")} <b>{l.week}</b></span> : null}{l.month ? <span>{tr("Mois")} <b>{l.month}</b></span> : null}</span>
              <small className="note">{l.owner}</small></div></Link>))}</div>}
    </>
  );
}
