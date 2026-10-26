"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase/client";
import { GENRES, SPECIALTIES, Trip } from "@/lib/types";

const DAYS = ["Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi","Dimanche"];
type Hours = Record<string, [string, string] | null>;

export default function MyProfile() {
  const sb = supabaseBrowser();
  const [uid, setUid] = useState(""); const [loaded, setLoaded] = useState(false); const [isNewP, setIsNewP] = useState(true);
  const [f, setF] = useState({ name: "", genre: "", city: "", bio: "", phone: "", instagram: "", snapchat: "", tiktok: "", site: "" });
  const [spec, setSpec] = useState<string[]>([]); const [photos, setPhotos] = useState<string[]>([]); const [video, setVideo] = useState<string | null>(null);
  const [h24, setH24] = useState(false); const [hours, setHours] = useState<Hours>({}); const [trips, setTrips] = useState<Trip[]>([]); const [paused, setPaused] = useState(false);
  const [msg, setMsg] = useState<{ t: string; ok?: boolean } | null>(null); const [busy, setBusy] = useState(false);

  useEffect(() => { (async () => {
    const { data: { user } } = await sb.auth.getUser();
    if (!user) { location.href = "/connexion"; return; }
    setUid(user.id);
    const { data } = await sb.from("profiles").select("*").eq("id", user.id).maybeSingle();
    if (data) { setIsNewP(false);
      setF({ name: data.name, genre: data.genre, city: data.city, bio: data.bio, phone: data.phone || "", instagram: data.instagram || "", snapchat: data.snapchat || "", tiktok: data.tiktok || "", site: data.site || "" });
      setSpec(data.specialties); setPhotos(data.photos); setVideo(data.video); setH24(data.h24); setHours(data.hours || {}); setTrips(data.trips || []); setPaused(data.paused); }
    setLoaded(true);
  })(); }, []);

  async function up(file: File) {
    const fd = new FormData(); fd.append("file", file);
    const r = await fetch("/api/upload", { method: "POST", body: fd }); const j = await r.json();
    if (!r.ok) throw new Error(j.error); return j.url as string;
  }
  async function addPhotos(files: FileList | null) {
    if (!files) return; setBusy(true); setMsg(null);
    try { const next = [...photos];
      for (const file of Array.from(files)) { if (next.length >= 6) break; next.push(await up(file)); }
      setPhotos(next);
    } catch (e: any) { setMsg({ t: e.message }); } setBusy(false);
  }
  async function addVideo(file?: File) {
    if (!file) return;
    if (file.size > 15 * 1024 * 1024) { setMsg({ t: "La vidéo dépasse 15 Mo." }); return; }
    setBusy(true); try { setVideo(await up(file)); } catch (e: any) { setMsg({ t: e.message }); } setBusy(false);
  }
  const move = (i: number, d: number) => { const a = [...photos]; const j = i + d; if (j < 0 || j >= a.length) return; [a[i], a[j]] = [a[j], a[i]]; setPhotos(a); };

  async function save(e: React.FormEvent) {
    e.preventDefault(); setMsg(null);
    if (!f.genre) { setMsg({ t: "Choisis ton genre (obligatoire)." }); return; }
    if (photos.length < 3) { setMsg({ t: "Ajoute au moins 3 photos." }); return; }
    setBusy(true);
    const row = { ...f, phone: f.phone || null, instagram: f.instagram || null, snapchat: f.snapchat || null, tiktok: f.tiktok || null, site: f.site || null,
      specialties: spec, photos, video, h24, hours, trips: trips.filter((t) => t.city && t.from && t.to), paused };
    const { error } = isNewP ? await sb.from("profiles").insert({ id: uid, ...row }) : await sb.from("profiles").update(row).eq("id", uid);
    setBusy(false);
    if (error) setMsg({ t: error.message }); else { setIsNewP(false); setMsg({ t: "Profil enregistré ✔", ok: true }); }
  }
  const set = (k: string) => (e: any) => setF({ ...f, [k]: e.target.value });
  if (!loaded) return <p>Chargement…</p>;

  return (
    <form className="panel" onSubmit={save} style={{ maxWidth: 760, margin: "0 auto" }}>
      <h1 style={{ marginTop: 0 }}>{isNewP ? "Créer mon profil" : "Modifier mon profil"}</h1>
      {!isNewP && <p>{paused ? <b className="err">⏸ Ton annonce est en pause. </b> : null}
        <button type="button" className="btn ghost" onClick={() => setPaused(!paused)}>{paused ? "Réactiver" : "Mettre en pause"}</button>{" "}
        <Link className="btn ghost" href={`/profil/${uid}`}>Voir mon profil</Link></p>}
      <label className="f">Nom ou pseudo<input value={f.name} onChange={set("name")} required minLength={2} maxLength={40} /></label>
      <label className="f">Genre (obligatoire)<select value={f.genre} onChange={set("genre")} required>
        <option value="" disabled>Choisir…</option>{GENRES.map((g) => <option key={g.id} value={g.id}>{g.icon} {g.label.replace(/s$/, "")}</option>)}</select></label>
      <div className="f">Spécialités ({spec.length}/6)
        <div className="chips">{SPECIALTIES.map((s) => { const on = spec.includes(s); return (
          <button type="button" key={s} className={`chip ${on ? "on" : ""}`} onClick={() => setSpec(on ? spec.filter((x) => x !== s) : spec.length < 6 ? [...spec, s] : spec)}>{s}</button>); })}</div></div>
      <label className="f">Ville<input value={f.city} onChange={set("city")} required /></label>
      <label className="f">Présentation<textarea value={f.bio} onChange={set("bio")} maxLength={2000} /></label>
      <label className="f">Téléphone<input value={f.phone} onChange={set("phone")} inputMode="tel" /></label>
      <label className="f">Instagram<input value={f.instagram} onChange={set("instagram")} placeholder="@pseudo" /></label>
      <label className="f">Snapchat<input value={f.snapchat} onChange={set("snapchat")} /></label>
      <label className="f">TikTok<input value={f.tiktok} onChange={set("tiktok")} /></label>
      <label className="f">Site web<input value={f.site} onChange={set("site")} placeholder="https://" /></label>

      <h3>Photos ({photos.length}/6 — 3 minimum)</h3>
      <div className="thumbs">{photos.map((u, i) => (
        <div key={u}><img src={u} alt="" />
          <button type="button" onClick={() => setPhotos(photos.filter((_, j) => j !== i))} aria-label="Supprimer">✕</button>
          {i > 0 && <button type="button" className="mv" onClick={() => move(i, -1)} aria-label="Mettre en avant">★</button>}
        </div>))}</div>
      {photos.length < 6 && <p><input type="file" accept="image/*" multiple disabled={busy} onChange={(e) => addPhotos(e.target.files)} /></p>}
      <p className="mut">Le filigrane est ajouté automatiquement. Pour tes photos Instagram : enregistre-les sur ton téléphone, puis ajoute-les ici.</p>

      <h3>Vidéo (15 Mo max)</h3>
      {video && <p><video src={video} controls style={{ maxWidth: 260 }} /> <button type="button" className="btn ghost" onClick={() => setVideo(null)}>Retirer</button></p>}
      <p><input type="file" accept="video/mp4,video/webm,video/quicktime" disabled={busy} onChange={(e) => addVideo(e.target.files?.[0])} /></p>

      <h3>Disponibilités</h3>
      <label><input type="checkbox" style={{ width: "auto" }} checked={h24} onChange={(e) => setH24(e.target.checked)} /> Disponible 24h/24, 7j/7</label>
      {!h24 && DAYS.map((d, i) => { const h = hours[String(i)]; return (
        <p key={d} style={{ margin: "6px 0" }}><b style={{ display: "inline-block", width: 90 }}>{d}</b>
          <input type="checkbox" style={{ width: "auto" }} checked={!!h} onChange={(e) => setHours({ ...hours, [i]: e.target.checked ? ["10:00", "20:00"] : null })} />{" "}
          {h && <><input type="time" style={{ width: 110 }} value={h[0]} onChange={(e) => setHours({ ...hours, [i]: [e.target.value, h[1]] })} /> – <input type="time" style={{ width: 110 }} value={h[1]} onChange={(e) => setHours({ ...hours, [i]: [h[0], e.target.value] })} /></>}
        </p>); })}

      <h3>Prochains déplacements (facultatif)</h3>
      {trips.map((t, i) => (
        <p key={i} className="chips" style={{ margin: "6px 0" }}>
          <input style={{ width: 150 }} placeholder="Ville" value={t.city} onChange={(e) => setTrips(trips.map((x, j) => j === i ? { ...x, city: e.target.value } : x))} />
          <input type="date" style={{ width: 150 }} value={t.from} onChange={(e) => setTrips(trips.map((x, j) => j === i ? { ...x, from: e.target.value } : x))} />
          <input type="date" style={{ width: 150 }} value={t.to} onChange={(e) => setTrips(trips.map((x, j) => j === i ? { ...x, to: e.target.value } : x))} />
          <button type="button" className="btn ghost" onClick={() => setTrips(trips.filter((_, j) => j !== i))}>✕</button></p>))}
      <button type="button" className="btn ghost" onClick={() => setTrips([...trips, { city: "", from: "", to: "" }])}>+ Ajouter une ville</button>

      {msg && <p className={msg.ok ? "ok" : "err"}>{msg.t}</p>}
      <p><button className="btn" disabled={busy}>{busy ? "Patiente…" : "Enregistrer"}</button></p>
    </form>
  );
}
