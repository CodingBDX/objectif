"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase/client";
import { SPECIALTIES, Trip } from "@/lib/types";
import { DAYL } from "@/lib/avail";
import CityInput from "@/components/CityInput";

type Hours = Record<string, [string, string] | null>;
const L = { fontSize: 14, fontWeight: 700, color: "var(--mut)" } as const;

export default function MyProfile() {
  const sb = supabaseBrowser();
  const [uid, setUid] = useState(""); const [loaded, setLoaded] = useState(false); const [isNewP, setIsNewP] = useState(true);
  const [f, setF] = useState({ name: "", genre: "", city: "", phone: "", instagram: "", snapchat: "", tiktok: "", site: "" });
  const [bio, setBio] = useState(""); const [more, setMore] = useState(["", "", ""]);
  const [spec, setSpec] = useState<string[]>([]); const [photos, setPhotos] = useState<string[]>([]); const [video, setVideo] = useState<string | null>(null);
  const [h24, setH24] = useState(false); const [hours, setHours] = useState<Hours>({}); const [trips, setTrips] = useState<Trip[]>([{ city: "", from: "", to: "" }, { city: "", from: "", to: "" }, { city: "", from: "", to: "" }]);
  const [tshow, setTshow] = useState(true); const [t30, setT30] = useState(""); const [t60, setT60] = useState(""); const [prog, setProg] = useState(-1); const [drag, setDrag] = useState(false); const [vip, setVip] = useState(false); const [paused, setPaused] = useState(false); const [ok18, setOk18] = useState(false);
  const [kind, setKind] = useState(""); const [isMember, setIsMember] = useState(false); const [pseudo, setPseudo] = useState(""); const [vlink, setVlink] = useState("");
  const [msg, setMsg] = useState<{ t: string; ok?: boolean } | null>(null);
  const [pMsg, setPMsg] = useState<{ t: string; ok?: boolean } | null>(null); const [vMsg, setVMsg] = useState<{ t: string; ok?: boolean } | null>(null); const [busy, setBusy] = useState(false);

  useEffect(() => { (async () => {
    const { data: { user } } = await sb.auth.getUser();
    if (!user) { location.href = "/connexion"; return; }
    setUid(user.id);
    const { data } = await sb.from("profiles").select("*").eq("id", user.id).maybeSingle();
    const { data: mem } = await sb.from("members").select("pseudo").eq("id", user.id).maybeSingle();
    if (mem) { setIsMember(true); setPseudo(mem.pseudo); }
    if (data) { setIsNewP(false); setOk18(true); setKind(data.genre === "livecam" ? "livecam" : "createur"); setVlink(data.vlink || "");
      setF({ name: data.name, genre: data.genre, city: data.city, phone: data.phone || "", instagram: data.instagram || "", snapchat: data.snapchat || "", tiktok: data.tiktok || "", site: data.site || "" });
      setBio(data.bio); setVip(!!data.vip); setMore([...(data.more || []), "", "", "", "", "", ""].slice(0, data.vip ? 6 : 3)); setSpec(data.specialties); setPhotos(data.photos); setVideo(data.video);
      setTshow(data.tarif_visible !== false); setT30(data.tarif_30 ? String(data.tarif_30) : ""); setT60(data.tarif_60 ? String(data.tarif_60) : ""); setH24(data.h24); setHours(data.hours || {}); setPaused(data.paused);
      setTrips([...(data.trips || []), { city: "", from: "", to: "" }, { city: "", from: "", to: "" }, { city: "", from: "", to: "" }].slice(0, Math.max(3, (data.trips || []).length)));
      if (new URLSearchParams(location.search).get("reactiver")) { await sb.from("profiles").update({ paused: false }).eq("id", user.id); setPaused(false); }
    }
    setLoaded(true);
  })(); }, []);

  async function up(file: File) {
    const fd = new FormData(); fd.append("file", file);
    const r = await fetch("/api/upload", { method: "POST", body: fd }); const j = await r.json();
    if (!r.ok) throw new Error(j.error); return j.url as string;
  }
  /** Vidéo : envoyée directement à Supabase (sans passer par le serveur du site, limité à ~4,5 Mo par envoi sur Vercel). */
  async function upVideo(file: File) {
    const ext = file.type === "video/webm" ? "webm" : file.type === "video/mp4" ? "mp4" : "mov";
    const path = `${uid}/${crypto.randomUUID()}.${ext}`;
    const { error } = await sb.storage.from("media").upload(path, file, { contentType: file.type, cacheControl: "31536000" });
    if (error) throw new Error(/size|exceed|payload/i.test(error.message) ? "fichier trop lourd (20 Mo maximum)" : error.message);
    return sb.storage.from("media").getPublicUrl(path).data.publicUrl;
  }
  async function addPhotos(files: FileList | File[] | null) {
    const all = files ? Array.from(files).filter((f) => f.type.startsWith("image/")) : []; if (!all.length) { if (files && (files as any).length) setPMsg({ t: "Choisis des images (JPG, PNG, WebP, HEIC…)." }); return; }
    const room = maxP - photos.length; if (room <= 0) { setPMsg({ t: `Tu as déjà ${maxP} photos : supprime-en une pour en ajouter.` }); return; }
    const list = all.slice(0, room); setBusy(true); setMsg(null); setProg(0);
    const next = [...photos]; let ok = 0, ko = 0;
    for (let i = 0; i < list.length; i++) {
      setPMsg({ t: `⏳ Envoi de la photo ${i + 1} sur ${list.length}…`, ok: true }); setProg(i / list.length);
      try { next.push(await up(list[i])); ok++; setPhotos([...next]); } catch { ko++; }
    }
    setProg(1); setTimeout(() => setProg(-1), 700);
    const skipped = all.length - list.length;
    setPMsg({ t: `${ok ? `✔ ${ok} photo${ok > 1 ? "s ajoutées" : " ajoutée"}.` : "Aucune photo n’a pu être envoyée."}${ko ? ` ${ko} en échec (trop lourde ou format non pris en charge).` : ""}${skipped > 0 ? ` ${skipped} ignorée${skipped > 1 ? "s" : ""} : maximum ${maxP} photos.` : ""}`, ok: ok > 0 && !ko });
    setBusy(false);
  }
  async function addVideo(file?: File) {
    if (!file) return;
    setVMsg(null);
    if (file.size > 20 * 1024 * 1024) { setVMsg({ t: `La vidéo fait ${(file.size / 1048576).toFixed(1).replace(".", ",")} Mo : elle dépasse la limite de 20 Mo.` }); return; }
    if (!["video/mp4", "video/webm", "video/quicktime"].includes(file.type)) { setVMsg({ t: "Format non accepté : choisis un MP4, WebM ou MOV." }); return; }
    setBusy(true); setMsg(null); setVMsg({ t: "⏳ Envoi de la vidéo en cours…", ok: true });
    try { setVideo(await upVideo(file)); setVMsg({ t: "✔ Vidéo ajoutée.", ok: true }); } catch (e: any) { setVMsg({ t: "Envoi impossible : " + e.message }); } setBusy(false);
  }
  const maxP = vip ? 20 : 10; const maxM = vip ? 6 : 3; const maxS = vip ? 30 : 5;
  const move = (i: number, d: number) => { const a = [...photos]; const j = i + d; if (j < 0 || j >= a.length) return; [a[i], a[j]] = [a[j], a[i]]; setPhotos(a); };

  async function save(e: React.FormEvent) {
    e.preventDefault(); setMsg(null);
    const genre = kind === "livecam" ? "livecam" : f.genre;
    if (!genre) { setMsg({ t: "Choisis ton profil (obligatoire)." }); return; }
    if (kind === "livecam" && !/^https?:\/\//.test(vlink)) { setMsg({ t: "Indique le lien de ton live (https://…)." }); return; }
    if (photos.length < 3) { setMsg({ t: "Ajoute au moins 3 photos." }); return; }
    setBusy(true);
    let region: string | null | undefined;
    try { const r = await fetch(`https://geo.api.gouv.fr/communes?nom=${encodeURIComponent(f.city)}&fields=nom,region&boost=population&limit=1`, { signal: AbortSignal.timeout(2500) }); if (r.ok) { const j = await r.json(); region = j?.[0]?.region?.nom || null; } } catch {}
    const row = { ...(region !== undefined ? { region } : {}), name: f.name, genre, vlink: kind === "livecam" ? vlink : null, city: f.city, bio, more: more.map((x) => x.trim()).filter(Boolean),
      phone: f.phone || null, instagram: f.instagram.replace("@", "") || null, snapchat: f.snapchat.replace("@", "") || null, tiktok: f.tiktok.replace("@", "") || null, site: f.site || null,
      tarif_visible: tshow, tarif_30: t30 ? Math.max(0, Math.min(10000, Math.round(Number(t30)))) : null, tarif_60: t60 ? Math.max(0, Math.min(10000, Math.round(Number(t60)))) : null, specialties: spec.slice(0, maxS), photos, video, h24, hours, trips: trips.filter((t) => t.city && t.from), paused };
    const { error } = isNewP ? await sb.from("profiles").insert({ id: uid, ...row }) : await sb.from("profiles").update(row).eq("id", uid);
    setBusy(false);
    if (error) setMsg({ t: error.message }); else { location.href = `/profil/${uid}`; }
  }
  async function saveMember(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setMsg(null);
    const { error } = await sb.from("members").insert({ id: uid, pseudo: pseudo.trim() });
    setBusy(false); if (error) setMsg({ t: error.message }); else location.href = "/";
  }
  const set = (k: string) => (e: any) => setF({ ...f, [k]: e.target.value });
  const setTrip = (i: number, k: keyof Trip, v: string) => setTrips(trips.map((t, j) => (j === i ? { ...t, [k]: v } : t)));
  if (!loaded) return <section className="gut"><p className="note">Chargement…</p></section>;

  return (
    <div id="reg" className="dash gut">
      <aside className="dside">
        <div className="dav">{(f.name || pseudo || "?").slice(0, 1).toUpperCase()}</div>
        <div className="dhi">{isNewP ? "Bienvenue 👋" : `Salut, ${(f.name || "").split(" ")[0]} 👋`}</div>
        <nav>
          {!isNewP && <Link href="/statistiques">📊 Statistiques</Link>}
          <Link className="on" href="/mon-profil">✏️ Mon profil</Link>
          {!isNewP && <Link href={`/profil/${uid}`}>👀 Voir ma page</Link>}
          <Link href="/">🏠 Annuaire</Link>
          <Link href="/contact">✉️ Contact</Link>
        </nav>
      </aside>
      <main className="dmain dedit">
        <div className="dtop"><h1>{isNewP ? "Créer mon profil" : "Modifier mon profil"}</h1></div>
        <div className="dform0">
          {!isNewP && <div className="acts dacts">
            <button type="button" className="btn ghost" onClick={async () => { await sb.from("profiles").update({ paused: !paused }).eq("id", uid); setPaused(!paused); }}>{paused ? "▶ Réactiver mon annonce" : "⏸ Mettre mon annonce en pause"}</button>
            <Link className="btn ghost" href={`/profil/${uid}`}>Voir mon profil</Link><Link className="btn ghost" href="/statistiques">📊 Mes statistiques</Link></div>}
          {isNewP && (<>
            <p className="note">Choisis le type de profil qui te correspond.</p>
            <div className="kinds" role="radiogroup" aria-label="Type de profil">
              <label className={`kind${kind === "createur" ? " on" : ""}`}><input type="radio" name="kind" checked={kind === "createur"} onChange={() => setKind("createur")} /><b>📷 Profil photographe</b><span>Photographe, vidéaste ou artiste : ton portfolio, ta vidéo, ton contact.</span></label>
              <label className={`kind${kind === "livecam" ? " on" : ""}`}><input type="radio" name="kind" checked={kind === "livecam"} onChange={() => setKind("livecam")} /><b>🔴 Profil livecam</b><span>Tu animes des lives créatifs (dessin, musique, cuisine, atelier). Catégorie à part.</span></label>
              {!isMember && <label className={`kind${kind === "membre" ? " on" : ""}`}><input type="radio" name="kind" checked={kind === "membre"} onChange={() => setKind("membre")} /><b>💬 Profil membre</b><span>Pour laisser des commentaires sous les profils. Rien d’autre.</span></label>}
            </div>
            {!kind && <p className="note" style={{ textAlign: "center", margin: 0 }}>👆 Clique sur un profil pour afficher le formulaire correspondant.</p>}
          </>)}
          {kind === "membre" && (
            <form onSubmit={saveMember}><fieldset className="fs">
              <label className="f">Pseudo<input value={pseudo} onChange={(e) => setPseudo(e.target.value)} required minLength={2} maxLength={30} autoComplete="nickname" /></label>
              <label className="chk"><input type="checkbox" required /> <span>Je suis majeur·e et je m’engage à rester respectueux·se (pas de propos haineux ni à caractère sexuel).</span></label>
              <p className="note">Un profil membre ne peut pas publier de photos ni de vidéos : seulement des commentaires.</p>
              {msg && <p className="note" role="alert" style={{ color: "var(--btn)", fontWeight: 700 }}>{msg.t}</p>}
              <button className="btn" type="submit" disabled={busy}>Créer mon profil membre</button>
            </fieldset></form>)}
          {(kind === "createur" || kind === "livecam") && <form onSubmit={save}><fieldset className="fs dform">
            {kind === "livecam" && <p className="note">Profil livecam : tu n’as pas d’autre catégorie. Indique le lien de ton live ci-dessous et tes horaires. Les lives doivent rester professionnels et non sexuels (aucune nudité).</p>}
<section className="dcard"><h3>Qui es-tu ?</h3><div className="row2">
              <label className="f">Nom ou nom de studio<input value={f.name} onChange={set("name")} required minLength={2} maxLength={40} /></label>
              {kind === "createur" && <label className="f">Profil (obligatoire)<select value={f.genre} onChange={set("genre")} required>
                <option value="" disabled>Choisir…</option><option value="fille">Fille</option><option value="homme">Homme</option><option value="trans">Trans</option></select></label>}
            </div>
            <div className="f"><span style={L}>{`Spécialités (jusqu’à ${maxS})`}{!vip && " · 30 en VIP"} <span style={{ fontWeight: 600 }}>{spec.length}/{maxS}</span></span>
              <div className="bub" role="group">{SPECIALTIES.map((s) => { const on = spec.includes(s);
                return <button type="button" key={s} className="bubble" aria-pressed={on} onClick={() => setSpec(on ? spec.filter((x) => x !== s) : spec.length < maxS ? [...spec, s] : spec)}>{s}</button>; })}</div></div>
</section><section className="dcard"><h3>Où te trouver ?</h3><div className="f"><span style={L}>Ville (tape les premières lettres)</span><CityInput value={f.city} onChange={(v) => setF({ ...f, city: v })} required label="Ville" placeholder="Ex. Lyon" /></div>
            <div className="f"><span style={L}>{`Villes supplémentaires (jusqu’à ${maxM}, optionnel)`}{!vip && " · 6 en VIP"}</span>
              <div className="row3">{more.slice(0, maxM).map((m, i) => <CityInput key={i} value={m} placeholder={`Ville ${i + 2}`} label={`Ville supplémentaire ${i + 1}`} onChange={(v) => setMore(more.map((x, j) => (j === i ? v : x)))} />)}</div></div>
            <div className="f"><span style={L}>Prochains déplacements (calendrier, optionnel)</span>
              {trips.map((t, i) => <div className="trow" key={i}>
                <CityInput placeholder="Ville visitée" value={t.city} onChange={(v) => setTrip(i, "city", v)} label={`Ville du déplacement ${i + 1}`} />
                <input type="date" value={t.from} onChange={(e) => setTrip(i, "from", e.target.value)} aria-label={`Du (déplacement ${i + 1})`} />
                <input type="date" value={t.to} onChange={(e) => setTrip(i, "to", e.target.value)} aria-label={`Au (déplacement ${i + 1})`} /></div>)}
              <span className="note">Indique la ville, la date d’arrivée et celle de départ. Rien d’obligatoire.</span></div>
</section><section className="dcard"><h3>Présentation et contact</h3><label className="f">Présentation<textarea value={bio} onChange={(e) => setBio(e.target.value)} maxLength={2000} rows={5} /></label>
            <div className="row2"><label className="f">Site ou réseau (optionnel)<input type="url" placeholder="https://" value={f.site} onChange={set("site")} /></label></div>
            <div className="f"><span style={L}>Tarifs 🌹 (optionnel, nombres uniquement)</span>{!vip && <p className="note" style={{ margin: 0 }}>🔒 Les tarifs sont réservés aux profils VIP : ils ne s’affichent pas sur ton profil. <Link href="/contact?s=vip">Devenir VIP</Link></p>}<div className="row2"><label className="f">Pour 30 minutes<input type="number" inputMode="numeric" min={0} max={10000} placeholder="ex. 80" value={t30} disabled={!vip} onChange={(e) => setT30(e.target.value)} /></label><label className="f">Pour 1 heure<input type="number" inputMode="numeric" min={0} max={10000} placeholder="ex. 150" value={t60} disabled={!vip} onChange={(e) => setT60(e.target.value)} /></label></div>{vip && <label className="chk"><input type="checkbox" checked={tshow} onChange={(e) => setTshow(e.target.checked)} /> <span>Afficher mes tarifs sur mon profil et sur ma carte</span></label>}</div>
            <label className="f">Numéro de téléphone (optionnel)<input type="tel" inputMode="tel" maxLength={20} placeholder="06 12 34 56 78" value={f.phone} onChange={set("phone")} /></label>
            <div className="f"><span style={L}>Réseaux sociaux (optionnel, ton pseudo sans @)</span>
              <div className="row3"><input maxLength={31} placeholder="Instagram" aria-label="Pseudo Instagram" value={f.instagram} onChange={set("instagram")} />
                <input maxLength={31} placeholder="Snapchat" aria-label="Pseudo Snapchat" value={f.snapchat} onChange={set("snapchat")} />
                <input maxLength={31} placeholder="TikTok" aria-label="Pseudo TikTok" value={f.tiktok} onChange={set("tiktok")} /></div></div>
            <p className="note">Le numéro et les pseudos seront visibles par tous sur ton profil. Ne mets que ce que tu veux partager publiquement.</p>

</section><section className="dcard"><h3>Mes photos</h3><div>
              <p className="note" style={{ margin: "0 0 6px" }}><b>Mes photos ({photos.length}/{maxP})</b> · la première sert de couverture. ◀ ▶ pour déplacer, ✕ pour supprimer.{photos.length < 3 && <span style={{ color: "var(--btn)", fontWeight: 700 }}> Il en faut au moins 3.</span>}</p>
              <div className="edph">{photos.map((src, i) => (
                <div key={src} className={`eph${i === 0 ? " first" : ""}`}><img src={src} alt={`Photo ${i + 1}`} />
                  {i === 0 && <span className="fst">En avant</span>}
                  <button type="button" className="rm" aria-label={`Supprimer la photo ${i + 1}`} title="Supprimer" onClick={() => setPhotos(photos.filter((_, j) => j !== i))}>✕</button>
                  <span className="mv">{i > 0 ? <button type="button" aria-label="Déplacer vers la gauche" onClick={() => move(i, -1)}>◀</button> : <i />}{i < photos.length - 1 ? <button type="button" aria-label="Déplacer vers la droite" onClick={() => move(i, 1)}>▶</button> : <i />}</span>
                </div>))}</div>
            </div>
            {photos.length < maxP && <label className={`dz${drag ? " drag" : ""}`} onDragOver={(e) => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)} onDrop={(e) => { e.preventDefault(); setDrag(false); if (!busy) addPhotos(e.dataTransfer.files); }}>
              <input type="file" accept="image/*" multiple disabled={busy} onChange={(e) => { addPhotos(e.target.files); e.target.value = ""; }} />
              <b>📷 {busy ? "Envoi en cours…" : "Choisir des photos"}</b>
              <span>Sélectionne <u>plusieurs photos d’un coup</u> dans ta galerie{"\u00A0"}— ou glisse-les ici sur ordinateur. Minimum 3, maximum {maxP}{vip ? "" : " (20 en VIP)"}. Le filigrane est ajouté automatiquement.</span>
              {prog >= 0 && <i className="dzp"><u style={{ width: Math.round(prog * 100) + "%" }} /></i>}
            </label>}
            {pMsg && <p className="note" role="alert" aria-live="polite" style={{ margin: 0, fontWeight: 700, color: pMsg.ok ? "inherit" : "var(--btn)" }}>{pMsg.t}</p>}
</section><section className="dcard"><h3>Vidéo</h3>{kind === "livecam" && <label className="f">Lien de ton live (obligatoire pour un profil livecam)<input type="url" placeholder="https://" value={vlink} onChange={(e) => setVlink(e.target.value)} required /></label>}
            <label className="f"><span>Vidéo de présentation (une seule, 20 Mo maximum)</span><input type="file" accept="video/mp4,video/webm,video/quicktime" disabled={busy} onChange={(e) => { addVideo(e.target.files?.[0]); e.target.value = ""; }} /></label>
            {vMsg && <p className="note" role="alert" aria-live="polite" style={{ margin: 0, fontWeight: 700, color: vMsg.ok ? "inherit" : "var(--btn)" }}>{vMsg.t}</p>}
            {video && <label className="chk"><input type="checkbox" onChange={(e) => e.target.checked && setVideo(null)} /> <span>🎬 Vidéo actuelle : cocher pour la supprimer</span></label>}

</section><section className="dcard"><h3>Disponibilités</h3><div className={`hf${h24 ? " is24" : ""}`}><strong>Mes heures de disponibilité (optionnel)</strong>
              <p className="note">Coche les jours où tu es joignable. Ton profil affichera « Dispo » pendant ces heures et sera grisé en dehors.</p>
              <label className="h24"><input type="checkbox" checked={h24} onChange={(e) => setH24(e.target.checked)} /> <b>Disponible 24h/24, 7j/7</b></label>
              {DAYL.map((d, i) => { const h = hours[String(i)];
                return <div className="d" key={d}><label><input type="checkbox" disabled={h24} checked={!!h} onChange={(e) => setHours({ ...hours, [String(i)]: e.target.checked ? (["09:00", "19:00"] as [string, string]) : null })} />{d}</label>
                  <input type="time" disabled={h24 || !h} value={h ? h[0] : "09:00"} onChange={(e) => h && setHours({ ...hours, [String(i)]: [e.target.value, h[1]] as [string, string] })} />
                  <input type="time" disabled={h24 || !h} value={h ? h[1] : "19:00"} onChange={(e) => h && setHours({ ...hours, [String(i)]: [h[0], e.target.value] as [string, string] })} /></div>; })}
            </div>
</section><section className="dcard"><label className="chk"><input type="checkbox" required checked={ok18} onChange={(e) => setOk18(e.target.checked)} /> <span>Je suis majeur·e, je détiens les droits sur ces contenus et ils sont professionnels (aucun contenu à caractère sexuel).</span></label>
            {msg && <p className="note" role="alert" style={{ color: msg.ok ? "inherit" : "var(--btn)", fontWeight: 700 }}>{msg.t}</p>}
            <button className="dbtn" type="submit" disabled={busy}>{busy ? "Patiente…" : isNewP ? "Publier mon profil" : "Enregistrer"}</button></section>
          </fieldset></form>}
        </div>
      </main>
    </div>
  );
}
