"use client";
import { useEffect, useState } from "react";
import { mediaUrl } from "@/lib/img";
import { supabaseBrowser } from "@/lib/supabase/client";
import { useT } from "@/lib/i18n";
import CityInput from "@/components/CityInput";
import { cityCentre } from "@/lib/dist";
import type { Busy } from "@/lib/lodging";

const L = { fontSize: 14, fontWeight: 700, color: "var(--mut)" } as const;
const num = (v: string) => { const n = Math.round(Number(v)); return v.trim() && n > 0 ? Math.min(100000, n) : null; };

/** Encart « Logement » de Modifier mon profil : réservé aux profils VIP + vérifiés. Toute modification repasse en validation. */
export default function LodgingEditor({ uid }: { uid: string }) {
  const { tr } = useT(); const sb = supabaseBrowser();
  const [ready, setReady] = useState(false); const [ok, setOk] = useState(false); const [has, setHas] = useState(false); const [status, setStatus] = useState("");
  const [title, setTitle] = useState(""); const [desc, setDesc] = useState(""); const [city, setCity] = useState(""); const [area, setArea] = useState(""); const [addr, setAddr] = useState("");
  const [photos, setPhotos] = useState<string[]>([]); const [pd, setPd] = useState(""); const [pw, setPw] = useState(""); const [pm, setPm] = useState("");
  const [busy, setBusy] = useState<Busy[]>([]); const [msg, setMsg] = useState<{ t: string; ok?: boolean } | null>(null); const [wait, setWait] = useState(false);

  useEffect(() => { (async () => {
    const { data: p } = await sb.from("profiles").select("vip,verified").eq("id", uid).maybeSingle();
    const allowed = !!(p?.vip && p?.verified); setOk(allowed);
    const { data: l } = await sb.from("lodgings").select("*").eq("profile_id", uid).maybeSingle();
    if (l) {
      setHas(true); setStatus(l.status); setTitle(l.title); setDesc(l.description || ""); setCity(l.city); setArea(l.area || ""); setPhotos(l.photos || []);
      setPd(l.price_day ? String(l.price_day) : ""); setPw(l.price_week ? String(l.price_week) : ""); setPm(l.price_month ? String(l.price_month) : ""); setBusy(Array.isArray(l.busy) ? l.busy : []);
      const { data: a } = await sb.from("lodging_private").select("address").eq("profile_id", uid).maybeSingle(); setAddr(a?.address || "");
    }
    setReady(true);
  })(); /* eslint-disable-next-line */ }, [uid]);

  async function addPhotos(files: FileList | null) {
    const list = files ? Array.from(files).filter((f) => f.type.startsWith("image/")).slice(0, 3 - photos.length) : []; if (!list.length) return;
    setWait(true); const next = [...photos];
    for (const f of list) { try { const fd = new FormData(); fd.append("file", f); const r = await fetch("/api/upload", { method: "POST", body: fd }); const j = await r.json(); if (r.ok) next.push(j.url); } catch {} }
    setPhotos(next); setWait(false);
  }
  async function save(e: React.FormEvent) {
    e.preventDefault(); setMsg(null);
    if (!city) { setMsg({ t: tr("Choisis la ville dans la liste de suggestions.") }); return; }
    if (!photos.length) { setMsg({ t: tr("Ajoute au moins une photo du logement.") }); return; }
    if (!num(pd) && !num(pw) && !num(pm)) { setMsg({ t: tr("Indique au moins un prix (jour, semaine ou mois).") }); return; }
    setWait(true);
    const c = await cityCentre(city);
    const row = { title: title.trim(), description: desc.trim(), city, area: area.trim() || null, lat: c ? c[1] : null, lon: c ? c[0] : null, photos: photos.slice(0, 3), price_day: num(pd), price_week: num(pw), price_month: num(pm),
      busy: busy.filter((b) => b.from).map((b) => ({ from: b.from, to: b.to || b.from })).slice(0, 24) };
    const { error } = has ? await sb.from("lodgings").update(row).eq("profile_id", uid) : await sb.from("lodgings").insert({ profile_id: uid, ...row });
    if (error) { setWait(false); setMsg({ t: tr("Enregistrement impossible : ") + error.message }); return; }
    const { error: e2 } = await sb.from("lodging_private").upsert({ profile_id: uid, address: addr.trim() });
    setWait(false);
    if (e2) { setMsg({ t: tr("Adresse non enregistrée : ") + e2.message }); return; }
    setHas(true); setStatus("pending"); setMsg({ t: tr("✔ Enregistré. Ton logement sera visible après validation."), ok: true });
  }
  async function del() { setWait(true); await sb.from("lodgings").delete().eq("profile_id", uid); setWait(false); setHas(false); setStatus(""); setTitle(""); setDesc(""); setCity(""); setArea(""); setAddr(""); setPhotos([]); setPd(""); setPw(""); setPm(""); setBusy([]); setMsg({ t: tr("Logement supprimé."), ok: true }); }
  const setB = (i: number, k: keyof Busy, v: string) => setBusy(busy.map((b, j) => (j === i ? { ...b, [k]: v } : b)));

  if (!ready) return null;
  if (!ok) return <section className="dcard" id="logement"><h3>{tr("🏠 Logement")}</h3><p className="note" style={{ margin: 0 }}>{tr("🔒 Proposer un logement est réservé aux profils VIP et vérifiés.")}</p></section>;
  return (
    <form className="dcard" id="logement" onSubmit={save}>
      <h3>{tr("🏠 Logement")}</h3>
      <p className="note" style={{ margin: 0 }}>{tr("Propose un logement en location. Seuls la ville et le quartier sont affichés : ton adresse reste privée. Chaque modification est vérifiée avant d’être visible.")}</p>
      {has && <p className="note" role="status"><b>{status === "approved" ? tr("✅ Visible dans l’annuaire des logements") : status === "rejected" ? tr("❌ Refusé : modifie ton annonce pour la soumettre à nouveau") : tr("⏳ En attente de validation")}</b></p>}
      <label className="f">{tr("Titre")}<input required minLength={3} maxLength={60} value={title} onChange={(e) => setTitle(e.target.value)} placeholder={tr("Ex. Studio lumineux centre-ville")} /></label>
      <label className="f">{tr("Description")}<textarea maxLength={800} rows={4} value={desc} onChange={(e) => setDesc(e.target.value)} /></label>
      <div className="row2"><div className="f"><span style={L}>{tr("Ville")}</span><CityInput value={city} onChange={setCity} required label={tr("Ville du logement")} placeholder={tr("Ex. Lyon")} /></div>
        <label className="f">{tr("Quartier (affiché)")}<input maxLength={60} value={area} onChange={(e) => setArea(e.target.value)} /></label></div>
      <label className="f">{tr("Adresse du bien (privée, jamais affichée)")}<input required minLength={5} maxLength={200} value={addr} onChange={(e) => setAddr(e.target.value)} autoComplete="street-address" /></label>
      <div className="f"><span style={L}>{tr("Photos (3 maximum)")} {photos.length}/3</span>
        <div className="tags">{photos.map((src, i) => <span key={src} style={{ position: "relative", display: "inline-block" }}><img src={mediaUrl(src)} alt="" width={96} height={96} style={{ objectFit: "cover", borderRadius: 12 }} />
          <button type="button" className="rrm" style={{ position: "absolute", top: -8, right: -8, width: 32, height: 32 }} aria-label={tr("Retirer la photo")} onClick={() => setPhotos(photos.filter((_, j) => j !== i))}>✕</button></span>)}</div>
        {photos.length < 3 && <input type="file" accept="image/*" multiple disabled={wait} aria-label={tr("Ajouter des photos")} onChange={(e) => { addPhotos(e.target.files); e.target.value = ""; }} />}</div>
      <div className="f"><span style={L}>{tr("Prix (€)")}</span><div className="row3">
        <input type="number" inputMode="numeric" min={0} placeholder={tr("Par jour")} aria-label={tr("Prix par jour")} value={pd} onChange={(e) => setPd(e.target.value)} />
        <input type="number" inputMode="numeric" min={0} placeholder={tr("Par semaine")} aria-label={tr("Prix par semaine")} value={pw} onChange={(e) => setPw(e.target.value)} />
        <input type="number" inputMode="numeric" min={0} placeholder={tr("Par mois")} aria-label={tr("Prix par mois")} value={pm} onChange={(e) => setPm(e.target.value)} /></div></div>
      <div className="f"><span style={L}>{tr("Calendrier : dates où le logement est occupé")}</span>
        {busy.map((b, i) => <div className="trow" key={i}>
          <label className="tdate"><small>{tr("Du")}</small><input type="date" value={b.from} onChange={(e) => setB(i, "from", e.target.value)} aria-label={tr("Du (déplacement {n})", { n: i + 1 })} /></label>
          <label className="tdate"><small>{tr("Au")}</small><input type="date" value={b.to} min={b.from || undefined} onChange={(e) => setB(i, "to", e.target.value)} aria-label={tr("Au (déplacement {n})", { n: i + 1 })} /></label>
          <button type="button" className="rrm" aria-label={tr("Retirer")} onClick={() => setBusy(busy.filter((_, j) => j !== i))}>✕</button></div>)}
        {busy.length < 24 && <button type="button" className="btn ghost" onClick={() => setBusy([...busy, { from: "", to: "" }])}>{tr("+ Ajouter une période occupée")}</button>}</div>
      {msg && <p className="note" role={msg.ok ? "status" : "alert"} style={msg.ok ? undefined : { color: "var(--btn)", fontWeight: 700 }}>{msg.t}</p>}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}><button className="btn" type="submit" disabled={wait}>{tr("Enregistrer mon logement")}</button>
        {has && <button className="btn ghost" type="button" disabled={wait} onClick={del}>{tr("Supprimer mon logement")}</button>}</div>
    </form>
  );
}
