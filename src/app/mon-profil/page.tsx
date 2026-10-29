"use client";
import { useEffect, useRef, useState } from "react";
import { Crumbs } from "@/components/Ld";
import Link from "next/link";
import AssoForm from "@/components/AssoForm";
import StatsPanel from "@/components/StatsPanel";
import BumpCard from "@/components/BumpCard";
import ReferralCard from "@/components/ReferralCard";
import VerifRequest from "@/components/VerifRequest";
import LodgingFinder from "@/components/LodgingFinder";
import { supabaseBrowser } from "@/lib/supabase/client";
import { SPECIALTIES, Trip } from "@/lib/types";
import { DAYL } from "@/lib/avail";
import { geoNom } from "@/lib/cityname";
import NearbySuggest from "@/components/NearbySuggest";
import CityInput from "@/components/CityInput";
import RichEditor from "@/components/RichEditor";
import { refreshListings } from "@/app/actions";
import { useT } from "@/lib/i18n";
import { tooFar, MAX_KM_VIP, MAX_KM_STD } from "@/lib/dist";
import { LIVE_CITY } from "@/lib/types";
import { slug as toSlug } from "@/lib/site";
import { plain } from "@/lib/rich";
import VipPrices from "@/components/VipPrices";
import { LANGS, ETHNIES, HAIRS, EYES, BRAS, HABIT, RATE_OPTS, rateList } from "@/lib/types";
const ordn = (n: number) => (n === 1 ? "1er" : n + "e");
const ARR: Record<string, string[]> = {
  paris: Array.from({ length: 20 }, (_, i) => `Paris ${ordn(i + 1)}`), lyon: Array.from({ length: 9 }, (_, i) => `Lyon ${ordn(i + 1)}`), marseille: Array.from({ length: 16 }, (_, i) => `Marseille ${ordn(i + 1)}`)
};
const NATIONALITES = ["Française", "Belge", "Suisse", "Luxembourgeoise", "Monégasque", "Italienne", "Espagnole", "Portugaise", "Allemande", "Britannique", "Roumaine", "Polonaise", "Russe", "Ukrainienne", "Brésilienne", "Colombienne", "Vénézuélienne", "Marocaine", "Algérienne", "Tunisienne", "Sénégalaise", "Ivoirienne", "Camerounaise", "Congolaise", "Thaïlandaise", "Chinoise", "Libanaise", "Turque"];

type Hours = Record<string, [string, string] | null>;
const L = { fontSize: 14, fontWeight: 700, color: "var(--mut)" } as const;

export default function MyProfile() {
  const sb = supabaseBrowser(); const { tr } = useT();
  const [uid, setUid] = useState(""); const [loaded, setLoaded] = useState(false); const [isNewP, setIsNewP] = useState(true);
  const [f, setF] = useState({ name: "", genre: "", city: "", phone: "", instagram: "", snapchat: "", tiktok: "", site: "" });
  const [recv, setRecv] = useState(false); const [trav, setTrav] = useState(false);
  const [hair, setHair] = useState(""); const [eyes, setEyes] = useState(""); const [bra, setBra] = useState(""); const [smoker, setSmoker] = useState(""); const [drinker, setDrinker] = useState("");
  const [age, setAge] = useState(""); const [hcm, setHcm] = useState(""); const [wkg, setWkg] = useState(""); const [eth, setEth] = useState(""); const [nat, setNat] = useState(""); const [dist, setDist] = useState(""); const [plink, setPlink] = useState(""); const [slogan, setSlogan] = useState(""); const [furl, setFurl] = useState(false); const [uslug, setUslug] = useState(""); const [wa, setWa] = useState(false); const [sms, setSms] = useState(false); const memo = useRef<Record<string, { more: string[]; dist: string }>>({}); const [langs, setLangs] = useState<string[]>([]);
  const [bio, setBio] = useState(""); const [more, setMore] = useState(["", "", ""]);
  const [vdrag, setVdrag] = useState(false); const [spec, setSpec] = useState<string[]>([]); const [specList, setSpecList] = useState<string[]>(SPECIALTIES); const [photos, setPhotos] = useState<string[]>([]); const [video, setVideo] = useState<string | null>(null);
  const [h24, setH24] = useState(false); const [hours, setHours] = useState<Hours>({}); const [trips, setTrips] = useState<Trip[]>([{ city: "", from: "", to: "" }, { city: "", from: "", to: "" }, { city: "", from: "", to: "" }]);
  const [rates, setRates] = useState<{ d: string; p: string }[]>([]); const [tshow, setTshow] = useState(true); const [t30, setT30] = useState(""); const [t60, setT60] = useState(""); const [prog, setProg] = useState(-1); const [drag, setDrag] = useState(false); const [vip, setVip] = useState(false); const [verif, setVerif] = useState(false); const [paused, setPaused] = useState(false); const [ok18, setOk18] = useState(false);
  const [kind, setKind] = useState(""); const [isMember, setIsMember] = useState(false); const [pseudo, setPseudo] = useState(""); const [mphone, setMphone] = useState(""); const [hasPhone, setHasPhone] = useState(true); const [vlink, setVlink] = useState("");
  const [msg, setMsg] = useState<{ t: string; ok?: boolean } | null>(null); const [farMsg, setFarMsg] = useState(""); const [wero, setWero] = useState(""); const [paypal, setPaypal] = useState("");
  const [delAsk, setDelAsk] = useState(false); const [delTxt, setDelTxt] = useState(""); const [delBusy, setDelBusy] = useState(false); const [delMsg, setDelMsg] = useState("");
  const [pMsg, setPMsg] = useState<{ t: string; ok?: boolean } | null>(null); const [vMsg, setVMsg] = useState<{ t: string; ok?: boolean } | null>(null); const [busy, setBusy] = useState(false);

  useEffect(() => { document.querySelectorAll<HTMLElement>(".acc .dcard > h3").forEach((h) => { h.tabIndex = 0; h.setAttribute("role", "button"); h.setAttribute("aria-expanded", String(h.parentElement!.classList.contains("open"))); }); }); // titres des menus déroulants : accessibles au clavier
  useEffect(() => { (async () => {
    const { data: { user } } = await sb.auth.getUser();
    if (!user) { location.href = "/connexion"; return; }
    setUid(user.id);
    const sl = await sb.from("specialties").select("name").order("position").order("name");
    const SL: string[] = !sl.error && sl.data?.length ? sl.data.map((r: { name: string }) => r.name) : SPECIALTIES; setSpecList(SL);
    const { data } = await sb.from("profiles").select("*").eq("id", user.id).maybeSingle();
    const { data: mem } = await sb.from("members").select("pseudo,phone_hash").eq("id", user.id).maybeSingle();
    if (mem) { setIsMember(true); setPseudo(mem.pseudo); setHasPhone(!!mem.phone_hash); }
    if (data) { setIsNewP(false); setOk18(true); setKind(data.genre === "livecam" ? "livecam" : "createur"); setVlink(data.vlink || "");
      const { data: ph } = await sb.from("profile_phones").select("phone").eq("profile_id", user.id).maybeSingle();
      setF({ name: data.name, genre: data.genre, city: data.city, phone: ph?.phone || data.phone || "", instagram: data.instagram || "", snapchat: data.snapchat || "", tiktok: data.tiktok || "", site: data.site || "" });
      setRecv(!!data.receives); setTrav(!!data.travels);
      setHair(data.hair || ""); setEyes(data.eyes || ""); setBra(data.bra || ""); setSmoker(data.smoker || ""); setDrinker(data.drinker || "");
      setAge(data.age ? String(data.age) : ""); setHcm(data.height_cm ? String(data.height_cm) : ""); setWkg(data.weight_kg ? String(data.weight_kg) : ""); setEth(data.ethnicity || ""); setNat(data.nationality || ""); setDist(data.district || ""); setSlogan(data.slogan || ""); setFurl(!!data.friendly_url); setUslug(data.url_slug || ""); setWa(!!data.whatsapp); setSms(!!data.sms); setLangs(data.languages || []);
      setBio(data.bio); setVip(!!data.vip); setVerif(!!data.verified); setMore([...(data.more || []), "", "", "", "", "", ""].slice(0, data.vip ? 6 : 3)); setSpec((data.specialties || []).filter((x: string) => SL.includes(x))); setPhotos(data.photos); setVideo(data.video);
      setWero(data.pay_wero || ""); setPaypal(data.pay_paypal || ""); setRates(rateList(data).map((r) => ({ d: r.d, p: String(r.p) }))); setTshow(data.tarif_visible !== false); setT30(data.tarif_30 ? String(data.tarif_30) : ""); setT60(data.tarif_60 ? String(data.tarif_60) : ""); setH24(data.h24); setHours(data.hours || {}); setPaused(data.paused);
      setTrips([...(data.trips || []), { city: "", from: "", to: "" }, { city: "", from: "", to: "" }, { city: "", from: "", to: "" }].slice(0, Math.max(3, (data.trips || []).length)));
      if (new URLSearchParams(location.search).get("reactiver")) { await sb.from("profiles").update({ paused: false }).eq("id", user.id); setPaused(false); window.dispatchEvent(new CustomEvent("hp-pause", { detail: false })); await refreshListings(); }
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
    if (error) throw new Error(/size|exceed|payload/i.test(error.message) ? tr("fichier trop lourd (20 Mo maximum)") : error.message);
    return sb.storage.from("media").getPublicUrl(path).data.publicUrl;
  }
  /** Ajoute une photo à partir d'un lien d'image (https) hébergée ailleurs. */
  function addLink() {
    const u = plink.trim();
    if (!/^https:\/\/[^\s]{4,600}$/i.test(u)) { setPMsg({ t: tr("Colle un lien d’image complet qui commence par https://") }); return; }
    if (photos.length >= maxP) { setPMsg({ t: tr("Tu as déjà {n} photos : supprime-en une pour en ajouter.", { n: maxP }) }); return; }
    if (photos.includes(u)) { setPMsg({ t: tr("Cette photo est déjà dans ton profil.") }); return; }
    setPhotos([...photos, u]); setPlink(""); setPMsg({ ok: true, t: tr("✔ 1 photo ajoutée.") });
  }
  async function addPhotos(files: FileList | File[] | null) {
    const all = files ? Array.from(files).filter((f) => f.type.startsWith("image/")) : []; if (!all.length) { if (files && (files as any).length) setPMsg({ t: tr("Choisis des images (JPG, PNG, WebP, HEIC…).") }); return; }
    const room = maxP - photos.length; if (room <= 0) { setPMsg({ t: tr("Tu as déjà {n} photos : supprime-en une pour en ajouter.", { n: maxP }) }); return; }
    const list = all.slice(0, room); setBusy(true); setMsg(null); setProg(0);
    const next = [...photos]; let ok = 0, ko = 0;
    for (let i = 0; i < list.length; i++) {
      setPMsg({ t: tr("⏳ Envoi de la photo {i} sur {n}…", { i: i + 1, n: list.length }), ok: true }); setProg(i / list.length);
      try { next.push(await up(list[i])); ok++; setPhotos([...next]); } catch { ko++; }
    }
    setProg(1); setTimeout(() => setProg(-1), 700);
    const skipped = all.length - list.length;
    setPMsg({ t: (ok ? (ok > 1 ? tr("✔ {n} photos ajoutées.", { n: ok }) : tr("✔ 1 photo ajoutée.")) : tr("Aucune photo n’a pu être envoyée.")) + (ko ? " " + tr("{n} en échec (trop lourde ou format non pris en charge).", { n: ko }) : "") + (skipped > 0 ? " " + tr("{n} ignorée(s) : maximum {m} photos.", { n: skipped, m: maxP }) : ""), ok: ok > 0 && !ko });
    setBusy(false);
  }
  /** Les vidéos d'iPhone (HEVC / H.265) se lisent avec le son mais sans image sur beaucoup d'ordinateurs : on les repère avant l'envoi. */
  async function isHevc(file: File) {
    try {
      const n = 2 * 1024 * 1024; const parts = [file.slice(0, n), file.size > n ? file.slice(Math.max(n, file.size - n)) : null].filter(Boolean) as Blob[];
      let txt = ""; for (const b of parts) txt += new TextDecoder("latin1").decode(await b.arrayBuffer());
      return /(hvc1|hev1|dvh1|dvhe)/.test(txt) && !/avc1/.test(txt);
    } catch { return false; }
  }
  async function addVideo(file?: File) {
    if (!file) return;
    setVMsg(null);
    if (file.size > 20 * 1024 * 1024) { setVMsg({ t: tr("La vidéo fait {size} Mo : elle dépasse la limite de 20 Mo.", { size: (file.size / 1048576).toFixed(1).replace(".", ",") }) }); return; }
    if (!["video/mp4", "video/webm", "video/quicktime"].includes(file.type)) { setVMsg({ t: tr("Format non accepté : choisis un MP4, WebM ou MOV.") }); return; }
    if (await isHevc(file)) { setVMsg({ t: tr("Cette vidéo est au format HEVC (H.265) : beaucoup d’ordinateurs la lisent sans image. Sur iPhone : Réglages › Appareil photo › Formats › « Le plus compatible », puis refilme ; ou convertis-la en MP4 H.264.") }); return; }
    setBusy(true); setMsg(null); setVMsg({ t: tr("⏳ Envoi de la vidéo en cours…"), ok: true });
    try { setVideo(await upVideo(file)); setVMsg({ t: tr("✔ Vidéo ajoutée."), ok: true }); } catch (e: any) { setVMsg({ t: tr("Envoi impossible : ") + e.message }); } setBusy(false);
  }
  /** Efface les photos et vidéos du dossier de la personne, puis le compte entier (profil, commentaires, signalements…). */
  async function deleteAll() {
    setDelBusy(true); setDelMsg("");
    try {
      try { const { data: vf } = await sb.storage.from("verif").list(uid, { limit: 100 }); if (vf?.length) await sb.storage.from("verif").remove(vf.map((f) => `${uid}/${f.name}`)); } catch {}
      for (let guard = 0; guard < 20; guard++) {
        const { data: files } = await sb.storage.from("media").list(uid, { limit: 100 });
        if (!files || !files.length) break;
        const { error: re } = await sb.storage.from("media").remove(files.map((f) => `${uid}/${f.name}`));
        if (re) throw re;
      }
      const { error } = await sb.rpc("delete_my_account"); if (error) throw error;
      await sb.auth.signOut(); location.href = "/";
    } catch (e: any) { setDelMsg(tr("Suppression impossible : {e}. Écris-nous via la page Contact.", { e: e?.message || tr("réessaie") })); setDelBusy(false); }
  }
  const isLive = kind === "livecam"; const canRate = vip || isLive; const socOk = vip || isLive; const maxKm = vip ? MAX_KM_VIP : MAX_KM_STD; const maxP = vip ? 20 : 10; const maxM = vip ? 6 : 3; const maxS = vip ? 30 : 5;
  /** Blocs de Mon profil en menus déroulants : un clic (ou Entrée) sur le titre ouvre / ferme le bloc. */
  const toggleCard = (e: React.MouseEvent) => { const h = (e.target as HTMLElement).closest(".acc .dcard > h3") as HTMLElement | null; if (!h) return; const c = h.parentElement!; c.classList.toggle("open"); h.setAttribute("aria-expanded", String(c.classList.contains("open"))); };
  const keyCard = (e: React.KeyboardEvent) => { if ((e.key === "Enter" || e.key === " ") && (e.target as HTMLElement).matches(".acc .dcard > h3")) { e.preventDefault(); toggleCard(e as unknown as React.MouseEvent); } };
  const move = (i: number, d: number) => { const a = [...photos]; const j = i + d; if (j < 0 || j >= a.length) return; [a[i], a[j]] = [a[j], a[i]]; setPhotos(a); };

  async function save(e: React.FormEvent) {
    e.preventDefault(); setMsg(null);
    const genre = kind === "livecam" ? "livecam" : f.genre;
    if (!genre) { setMsg({ t: tr("Choisis ton profil (obligatoire).") }); return; }
    if (plain(bio).trim().length < 150) { setMsg({ t: tr("Ta présentation doit faire au moins 150 caractères (elle aide Google à bien référencer ton profil).") }); return; }
    if (kind === "livecam" && !/^https?:\/\//.test(vlink)) { setMsg({ t: tr("Indique le lien de ton live (https://…).") }); return; }
    if (kind !== "livecam") { const bad = (await Promise.all(more.filter(Boolean).map(async (c) => ((await tooFar(f.city, c, maxKm)) ? c : "")))).find(Boolean); if (bad) { setFarMsg(bad); setMsg({ t: tr("{c} est trop loin de ta ville principale (plus de {n} km).", { c: bad, n: maxKm }) }); return; } }
    if (f.phone.replace(/\D/g, "").length < 8) { setMsg({ t: tr("Indique ton numéro de téléphone (obligatoire).") }); return; }
    if (photos.length < 3) { setMsg({ t: tr("Ajoute au moins 3 photos.") }); return; }
    const nAge = Number(age); if (!nAge || nAge < 18 || nAge > 99) { setMsg({ t: tr("Indique ton âge (18 ans minimum) dans l’encart Description.") }); document.getElementById("descr")?.scrollIntoView({ behavior: "smooth", block: "center" }); return; }
    if (!h24 && !Object.values(hours).some((h) => h && h[0] && h[1])) { setMsg({ t: tr("Indique tes disponibilités (obligatoire) : coche « 24h/24, 7j/7 » ou au moins un jour avec ses horaires.") }); document.getElementById("dispo")?.scrollIntoView({ behavior: "smooth", block: "center" }); return; }
    setBusy(true);
    let region: string | null | undefined = isLive ? null : undefined;
    if (!isLive) try { const r = await fetch(`https://geo.api.gouv.fr/communes?${geoNom(f.city)}&fields=nom,region&boost=population&limit=1`, { signal: AbortSignal.timeout(2500) }); if (r.ok) { const j = await r.json(); region = j?.[0]?.region?.nom || null; } } catch {}
    const num = (v: string, a: number, b: number) => { const n = Math.round(Number(v)); return v && n >= a && n <= b ? n : null; };
    const cleanRates = rates.map((r) => ({ d: r.d, p: Math.max(0, Math.min(10000, Math.round(Number(r.p)))) })).filter((r) => r.p > 0 && RATE_OPTS.some((o) => o[0] === r.d)).filter((r, i, a) => a.findIndex((x) => x.d === r.d) === i).slice(0, 8);
    const row = { ...(region !== undefined ? { region } : {}), age: nAge, receives: isLive ? false : recv, travels: isLive ? false : trav, pay_wero: isLive ? wero.trim().slice(0, 80) || null : null, pay_paypal: isLive ? paypal.trim().slice(0, 80) || null : null, hair: hair || null, eyes: eyes || null, bra: bra || null, smoker: smoker || null, drinker: drinker || null, height_cm: num(hcm, 120, 230), weight_kg: num(wkg, 30, 200), ethnicity: eth.trim().slice(0, 40) || null, nationality: nat.trim().slice(0, 40) || null, district: isLive ? null : dist.trim().slice(0, 40) || null, ...(vip ? { slogan: slogan.trim().slice(0, 80) || null, friendly_url: furl } : {}), whatsapp: isLive ? true : wa, sms: isLive ? false : sms, languages: langs.slice(0, 8), name: f.name, genre, vlink: kind === "livecam" ? vlink : null, city: isLive ? LIVE_CITY : f.city, bio, more: isLive ? [] : more.map((x) => x.trim()).filter(Boolean),
      instagram: f.instagram.replace("@", "") || null, snapchat: f.snapchat.replace("@", "") || null, tiktok: f.tiktok.replace("@", "") || null, site: f.site || null,
      tarif_visible: tshow, rates: canRate ? cleanRates : [], tarif_30: canRate ? (cleanRates.find((r) => r.d === "30min")?.p ?? null) : t30 ? Math.max(0, Math.min(10000, Math.round(Number(t30)))) : null, tarif_60: canRate ? (cleanRates.find((r) => r.d === "1h")?.p ?? null) : t60 ? Math.max(0, Math.min(10000, Math.round(Number(t60)))) : null, specialties: spec.slice(0, maxS), photos, video, h24, hours, trips: isLive ? [] : trips.filter((t) => t.city && t.from), paused };
    const { error: pe } = await sb.rpc("set_my_phone", { p_phone: f.phone.trim() });
    if (pe) { setBusy(false); setMsg({ t: pe.message }); return; }
    const { error } = isNewP ? await sb.from("profiles").insert({ id: uid, ...row }) : await sb.from("profiles").update(row).eq("id", uid);
    if (!error) { await refreshListings(); if (isNewP) { try { const rc = localStorage.getItem("hp_ref"); if (rc) { await sb.rpc("claim_referral", { p_code: rc }); localStorage.removeItem("hp_ref"); } } catch {} } }
    setBusy(false);
    if (error) setMsg({ t: error.message }); else { location.href = `/profil/${uid}`; }
  }
  async function saveMember(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setMsg(null);
    if (mphone.replace(/\D/g, "").length < 8) { setBusy(false); setMsg({ t: tr("Indique ton numéro de téléphone (obligatoire).") }); return; }
    const { error } = isMember ? await sb.rpc("set_member_phone", { p_phone: mphone }) : await sb.rpc("register_member", { p_pseudo: pseudo.trim(), p_phone: mphone });
    setBusy(false); if (error) setMsg({ t: error.message }); else location.href = "/";
  }
  const set = (k: string) => (e: any) => setF({ ...f, [k]: e.target.value });
  const setTrip = (i: number, k: keyof Trip, v: string) => setTrips(trips.map((t, j) => (j === i ? { ...t, [k]: v } : t)));
  if (!loaded) return <section className="gut"><p className="note">{tr("Chargement…")}</p></section>;

  return (
    <div id="reg" className="dash gut">
      <aside className="dside nomob">
        <div className="dav">{(f.name || pseudo || "?").slice(0, 1).toUpperCase()}</div>
        <div className="dhi">{isNewP ? tr("Bienvenue 👋") : tr("Salut, {n} 👋", { n: (f.name || "").split(" ")[0] })}</div>
        <nav>
          {!isNewP && <a href="#stats">{tr("📊 Statistiques")}</a>}
          {!isNewP && <Link href="/verifier">{tr("🛡️ Vérifier un client")}</Link>}
          <a href="#profil">{tr("✏️ Mon profil")}</a>
          {!isNewP && vip && verif && <Link href="/mon-logement">{tr("🏠 Mon logement")}</Link>}
          {!isNewP && <Link href={`/profil/${uid}`}>{tr("👀 Voir ma page")}</Link>}
          <Link href="/">{tr("📖 Annuaire")}</Link>
          <Link href="/contact">{tr("✉️ Contact")}</Link>
        </nav>
        {!isNewP && !vip && <div className="dvip"><div className="crown">👑</div><b>{tr("Passe en VIP")}</b><span>{tr("Plus de visibilité dans l’annuaire.")}</span><VipPrices /><Link className="dbtn pink" href="/contact?s=vip">{tr("Devenir VIP")}</Link></div>}
      </aside>
      <main className="dmain dedit">
        <div className="pbar"><Crumbs inline items={[[tr("Accueil"), "/"], [isNewP ? tr("Créer mon profil") : tr("Mon espace"), "#"]]} /></div>
        <div className="dtop"><h1>{isNewP ? tr("Créer mon profil") : tr("Mon espace")}</h1></div>
        {!isNewP && <StatsPanel />}
        {!isNewP && <BumpCard />}
        {!isNewP && <ReferralCard />}
        {!isNewP && <LodgingFinder />}
        {!isNewP && <h2 className="dsub" id="profil">{tr("✏️ Modifier mon profil")}</h2>}
        <div className="dform0">
          {!isNewP && <div className="acts dacts">
            <button type="button" className="btn ghost" onClick={async () => { window.dispatchEvent(new CustomEvent("hp-pause", { detail: !paused })); await sb.from("profiles").update({ paused: !paused }).eq("id", uid); setPaused(!paused); await refreshListings(); }}>{paused ? tr("▶ Réactiver mon annonce") : tr("⏸ Mettre mon annonce en pause")}</button>
            <Link className="btn ghost" href={`/profil/${uid}`}>{tr("Voir mon profil")}</Link></div>}
          {isMember && !hasPhone && (<form onSubmit={saveMember}><fieldset className="fs">
            <p className="note" role="alert" style={{ color: "var(--btn)", fontWeight: 700 }}>{tr("Pour continuer à commenter, ajoute ton numéro de téléphone.")}</p>
            <label className="f">{tr("Numéro de téléphone (obligatoire)")}<input type="tel" inputMode="tel" required maxLength={20} placeholder="06 12 34 56 78" value={mphone} onChange={(e) => setMphone(e.target.value)} autoComplete="tel" /></label>
            {msg && <p className="note" role="alert" style={{ color: "var(--btn)", fontWeight: 700 }}>{msg.t}</p>}
            <button className="btn" type="submit" disabled={busy}>{tr("Enregistrer mon numéro")}</button>
          </fieldset></form>)}
          {isNewP && (<>
            <p className="note">{tr("Choisis le type de profil qui te correspond.")}</p>
            <div className="kinds" role="radiogroup" aria-label={tr("Type de profil")}>
              <label className={`kind${kind === "createur" ? " on" : ""}`}><input type="radio" name="kind" checked={kind === "createur"} onChange={() => setKind("createur")} /><b>{tr("💖 Profil escorte")}</b><span>{tr("Ton portfolio, ta vidéo, tes disponibilités et ton contact.")}</span></label>
              <label className={`kind${kind === "livecam" ? " on" : ""}`}><input type="radio" name="kind" checked={kind === "livecam"} onChange={() => setKind("livecam")} /><b>{tr("🔴 Profil livecam")}</b><span>{tr("Tu animes des lives créatifs (dessin, musique, cuisine, atelier). Catégorie à part.")}</span></label>
              <label className={`kind${kind === "association" ? " on" : ""}`}><input type="radio" name="kind" checked={kind === "association"} onChange={() => setKind("association")} /><b>{tr("🤝 Profil association")}</b><span>{tr("Tu représentes une association de soutien : fiche par ville, validée avant publication.")}</span></label>
              {!isMember && <label className={`kind${kind === "membre" ? " on" : ""}`}><input type="radio" name="kind" checked={kind === "membre"} onChange={() => setKind("membre")} /><b>{tr("💬 Profil membre")}</b><span>{tr("Pour laisser des commentaires sous les profils. Rien d’autre.")}</span></label>}
            </div>
            {!kind && <p className="note" style={{ textAlign: "center", margin: 0 }}>{tr("👆 Clique sur un profil pour afficher le formulaire correspondant.")}</p>}
          </>)}
          {kind === "association" && <AssoForm />}
          {kind === "membre" && (
            <form onSubmit={saveMember}><fieldset className="fs">
              <label className="f">{tr("Pseudo")}<input value={pseudo} onChange={(e) => setPseudo(e.target.value)} required minLength={2} maxLength={30} autoComplete="nickname" /></label>
              <label className="f">{tr("Numéro de téléphone (obligatoire)")}<input type="tel" inputMode="tel" required maxLength={20} placeholder="06 12 34 56 78" value={mphone} onChange={(e) => setMphone(e.target.value)} autoComplete="tel" /></label>
              <p className="note">{tr("Ton numéro n’est jamais affiché ni enregistré en clair. Si un profil a signalé ce numéro, tes commentaires sont marqués en rouge.")}</p>
              <label className="chk"><input type="checkbox" required /> <span>{tr("Je suis majeur·e et je m’engage à rester respectueux·se (pas de propos haineux ni à caractère sexuel).")}</span></label>
              <p className="note">{tr("Un profil membre ne peut pas publier de photos ni de vidéos : seulement des commentaires.")}</p>
              {msg && <p className="note" role="alert" style={{ color: "var(--btn)", fontWeight: 700 }}>{msg.t}</p>}
              <button className="btn" type="submit" disabled={busy}>{tr("Créer mon profil membre")}</button>
            </fieldset></form>)}
          {(kind === "createur" || kind === "livecam") && <form onSubmit={save} onInvalidCapture={(e) => (e.target as HTMLElement).closest(".dcard")?.classList.add("open")}><fieldset className="fs dform acc" onClick={toggleCard} onKeyDown={keyCard}>
            {kind === "livecam" && <p className="note">{tr("Pas de ville pour un profil livecam : ton profil apparaît uniquement dans la section Livecam.")}</p>}
            {kind === "livecam" && <p className="note">{tr("Profil livecam : tu n’as pas d’autre catégorie. Indique le lien de ton live ci-dessous et tes horaires. Les lives doivent rester professionnels et non sexuels (aucune nudité).")}</p>}
<section className="dcard open"><h3>{tr("Qui es-tu ?")}</h3><div className="row2">
              <label className="f">{tr("Pseudonyme")}<input value={f.name} onChange={set("name")} required minLength={2} maxLength={40} /></label>
            </div>
            <div className="f vipopt"><span style={L}>{tr("Adresse personnalisée et slogan")} <span className="gchip" style={{ marginLeft: 6 }}>VIP</span></span>
              {!vip ? <p className="note" style={{ margin: 0 }}>{tr("🔒 Réservé aux profils VIP : une adresse lisible (ex. sex-escorte.com/fille/bordeaux/camille) et un slogan sous ton nom. ")}{furl && uslug ? tr("Ton choix est conservé : l’adresse personnalisée revient dès que tu repasses VIP. ") : null}<Link href="/contact?s=vip">{tr("Devenir VIP")}</Link></p> : <>
                <label className="f">{tr("Slogan (optionnel, 80 caractères max.)")}<input value={slogan} onChange={(e) => setSlogan(e.target.value.slice(0, 80))} maxLength={80} placeholder={tr("ex. Douce, élégante et attentionnée")} /><small className="note">{slogan.length}/80</small></label>
                <label className="chk"><input type="checkbox" checked={furl} onChange={(e) => setFurl(e.target.checked)} /> <span><b>{tr("Utiliser une adresse personnalisée pour mon profil")}</b><br />{tr("Cochée : ton nom, ta ville et ton genre apparaissent dans l’adresse, ce qui aide ton profil à être mieux référencé partout (Google, partages, recherches). Si tu préfères rester plus discrète, décoche : ton adresse ne contient alors qu’un code, sans nom ni ville.")}</span></label>
                <p className="note" style={{ margin: 0 }}>{furl ? <>sex-escorte.com/<b>{isLive ? "livecam" : f.genre || "fille"}/{isLive ? "en-ligne" : toSlug(f.city) || "ville"}/{uslug || toSlug(f.name) || "pseudo"}</b>{uslug ? "" : tr(" (si ce pseudo est déjà pris, un chiffre est ajouté)")}</> : tr("Décoché (mode discret) : ton adresse reste sex-escorte.com/profil/… avec un simple code, sans ton nom ni ta ville. L’ancien lien continue de fonctionner.")}</p></>}
            </div>
            <div className="f"><span style={L}>{tr("Spécialités (jusqu’à {n})", { n: maxS })}{!vip && tr(" · 30 en VIP")} <span style={{ fontWeight: 600 }}>{spec.length}/{maxS}</span></span>
              <div className="bub" role="group">{specList.map((s) => { const on = spec.includes(s);
                return <button type="button" key={s} className="bubble" aria-pressed={on} onClick={() => setSpec(on ? spec.filter((x) => x !== s) : spec.length < maxS ? [...spec, s] : spec)}>{s}</button>; })}</div></div>
</section>{!isLive && <section className="dcard"><h3>{tr("Où te trouver ?")}</h3><div className="f"><span style={L}>{tr("Ville (tape les premières lettres)")}</span><CityInput value={f.city} onChange={(v) => setF({ ...f, city: v })} onPick={(v) => { if (v === f.city) return; const k = (x: string) => x.trim().toLowerCase(); if (f.city.trim()) memo.current[k(f.city)] = { more, dist }; const back = memo.current[k(v)]; setMore(back ? back.more : more.map(() => "")); setDist(back ? back.dist : ""); setFarMsg(""); }} required label={tr("Ville")} placeholder={tr("Ex. Lyon")} /></div><div className="f"><span style={L}>{tr("Arrondissement ou quartier (facultatif)")}</span>{ARR[f.city.trim().toLowerCase()] ? <select value={dist} onChange={(e) => setDist(e.target.value)}><option value="">{tr("Non précisé")}</option>{ARR[f.city.trim().toLowerCase()].map((x) => <option key={x} value={x}>{x}</option>)}</select> : <input maxLength={40} value={dist} onChange={(e) => setDist(e.target.value)} placeholder={tr("Ex. Chartrons")} />}</div>
            <div className="f"><span style={L}>{tr("Villes supplémentaires (jusqu’à {n}, optionnel)", { n: maxM })}{!vip && tr(" · 6 en VIP")}</span>
              <div className="row3">{more.slice(0, maxM).map((m, i) => <CityInput key={i} value={m} placeholder={tr("Ville {n}", { n: i + 2 })} label={tr("Ville supplémentaire {n}", { n: i + 1 })} onChange={(v) => setMore(more.map((x, j) => (j === i ? v : x)))} onPick={async (v) => { if (await tooFar(f.city, v, maxKm)) { setMore((cur) => cur.map((x, j) => (j === i ? "" : x))); setFarMsg(v); } else setFarMsg(""); }} />)}</div><NearbySuggest city={f.city} maxKm={maxKm} picked={more} full={more.slice(0, maxM).every((x) => x.trim())} onAdd={(c) => setMore((cur) => { const i = cur.slice(0, maxM).findIndex((x) => !x.trim()); return i < 0 ? cur : cur.map((x, j) => (j === i ? c : x)); })} />{farMsg && <p className="note" role="alert" style={{ color: "var(--btn)", fontWeight: 700, margin: "6px 0 0" }}>{tr("{c} est à plus de {n} km de ta ville principale : ce n’est pas possible. Si tu te déplaces partout en France ou travailles à distance, tu es probablement un profil livecam : choisis la section « Profil livecam ».", { c: farMsg, n: maxKm })}</p>}</div>
            <div className="f"><span style={L}>{tr("Prochains déplacements (calendrier, optionnel)")}</span>
              {trips.map((t, i) => <div className="trow" key={i}>
                <CityInput placeholder={tr("Ville visitée")} value={t.city} onChange={(v) => setTrip(i, "city", v)} label={tr("Ville du déplacement {n}", { n: i + 1 })} />
                <label className="tdate"><small>{tr("Du")}</small><input type="date" value={t.from} onChange={(e) => setTrip(i, "from", e.target.value)} aria-label={tr("Du (déplacement {n})", { n: i + 1 })} /></label>
                <label className="tdate"><small>{tr("Au")}</small><input type="date" value={t.to} min={t.from || undefined} onChange={(e) => setTrip(i, "to", e.target.value)} aria-label={tr("Au (déplacement {n})", { n: i + 1 })} /></label></div>)}
              <span className="note">{tr("Indique la ville, la date d’arrivée et celle de départ. Rien d’obligatoire.")}</span></div>
</section>}<section className="dcard" id="descr"><h3>{tr("Description")}</h3>
            <div className="row2"><label className="f">{tr("Âge (obligatoire, 18 ans minimum)")}<input type="number" inputMode="numeric" min={18} max={99} required value={age} onChange={(e) => setAge(e.target.value)} /></label>
              <label className="f">{tr("Taille (cm)")}<input type="number" inputMode="numeric" min={120} max={230} placeholder={tr("ex. 170")} value={hcm} onChange={(e) => setHcm(e.target.value)} /></label></div>
            <div className="row2"><label className="f">{tr("Poids (kg)")}<input type="number" inputMode="numeric" min={30} max={200} placeholder={tr("ex. 58")} value={wkg} onChange={(e) => setWkg(e.target.value)} /></label>
              <label className="f">{tr("Ethnie (facultatif)")}<input list="ethnies" maxLength={40} value={eth} onChange={(e) => setEth(e.target.value)} placeholder={tr("Choisis ou écris")} /><datalist id="ethnies">{ETHNIES.map((x) => <option key={x} value={tr(x)} />)}</datalist></label></div>
            <label className="f">{tr("Nationalité (facultatif)")}<input list="nationalites" maxLength={40} value={nat} onChange={(e) => setNat(e.target.value)} placeholder={tr("Choisis ou écris")} /><datalist id="nationalites">{NATIONALITES.map((x) => <option key={x} value={x} />)}</datalist></label>
            <div className="row2"><label className="f">{tr("Couleur des cheveux")}<select value={hair} onChange={(e) => setHair(e.target.value)}><option value="">{tr("Non précisé")}</option>{HAIRS.map((x) => <option key={x} value={x}>{tr(x)}</option>)}</select></label><label className="f">{tr("Couleur des yeux")}<select value={eyes} onChange={(e) => setEyes(e.target.value)}><option value="">{tr("Non précisé")}</option>{EYES.map((x) => <option key={x} value={x}>{tr(x)}</option>)}</select></label></div>
            <div className="row2"><label className="f">{tr("Taille de bonnet")}<select value={bra} onChange={(e) => setBra(e.target.value)}><option value="">{tr("Non précisé")}</option>{BRAS.map((x) => <option key={x} value={x}>{x}</option>)}</select></label>{kind === "createur" && <label className="f">{tr("Profil (obligatoire)")}<select value={f.genre} onChange={set("genre")} required><option value="" disabled>{tr("Choisir…")}</option><option value="fille">{tr("Fille")}</option><option value="homme">{tr("Homme")}</option><option value="trans">{tr("Trans")}</option></select></label>}</div>
            <div className="row2"><label className="f">{tr("Fumeuse / fumeur")}<select value={smoker} onChange={(e) => setSmoker(e.target.value)}>{HABIT.map(([v, l]) => <option key={v} value={v}>{tr(l)}</option>)}</select></label><label className="f">{tr("Buveuse / buveur")}<select value={drinker} onChange={(e) => setDrinker(e.target.value)}>{HABIT.map(([v, l]) => <option key={v} value={v}>{tr(l)}</option>)}</select></label></div>
            {!isLive && <fieldset className="fs"><legend className="note">{tr("Rencontres")}</legend>
              <label className="ck"><input type="checkbox" checked={recv} onChange={(e) => setRecv(e.target.checked)} /> {tr("Je reçois")}</label>
              <label className="ck"><input type="checkbox" checked={trav} onChange={(e) => setTrav(e.target.checked)} /> {tr("Je me déplace")}</label></fieldset>}
            <fieldset className="fs"><legend className="note">{tr("Langues parlées (8 maximum)")}</legend>
              <div className="tags">{LANGS.map((l) => <button type="button" key={l} className="chip" aria-pressed={langs.includes(l)} onClick={() => setLangs(langs.includes(l) ? langs.filter((x) => x !== l) : langs.length < 8 ? [...langs, l] : langs)}>{tr(l)}</button>)}</div></fieldset>
            <p className="note" style={{ margin: 0 }}>{tr("Ces informations sont affichées sur ton profil. Tout est facultatif sauf l’âge ; n’écris que ce que tu veux montrer.")}</p>
</section><section className="dcard"><h3>{tr("Présentation et contact")}</h3><div className="f"><span style={L}>{tr("Présentation")}</span><RichEditor label={tr("Présentation")} value={bio} onChange={setBio} /><small className="note" style={{ color: plain(bio).trim().length < 150 ? "var(--btn)" : undefined }}>{plain(bio).trim().length}/150 {tr("caractères minimum")}</small></div>
            <div className="row2"><label className="f">{tr("Site ou réseau (optionnel)")}<input type="url" placeholder="https://" value={f.site} onChange={set("site")} /></label></div>
            <div className="f"><span style={L}>{tr("Tarifs 🌹 (optionnel, nombres uniquement)")}</span>{!canRate && <p className="note" style={{ margin: 0 }}>{tr("🔒 Les tarifs sont réservés aux profils VIP : ils ne s’affichent pas sur ton profil. ")}<Link href="/contact?s=vip">{tr("Devenir VIP")}</Link></p>}<div className="rlist">{rates.map((r, i) => <div className="rrow" key={i}>
                <select aria-label={tr("Durée")} value={r.d} disabled={!canRate} onChange={(e) => setRates(rates.map((x, j) => (j === i ? { ...x, d: e.target.value } : x)))}>{RATE_OPTS.map(([v, l]) => <option key={v} value={v}>{tr(l)}</option>)}</select>
                <input type="number" inputMode="numeric" min={0} max={10000} placeholder="ex. 80" aria-label={tr("Prix")} value={r.p} disabled={!canRate} onChange={(e) => setRates(rates.map((x, j) => (j === i ? { ...x, p: e.target.value } : x)))} />
                <button type="button" className="rrm" disabled={!canRate} aria-label={tr("Retirer ce tarif")} title={tr("Retirer ce tarif")} onClick={() => setRates(rates.filter((_, j) => j !== i))}>✕</button></div>)}
                {canRate && rates.length < 8 && <button type="button" className="btn ghost" onClick={() => setRates([...rates, { d: RATE_OPTS.find((o) => !rates.some((r) => r.d === o[0]))?.[0] || "1h", p: "" }])}>{tr("+ Ajouter un tarif")}</button>}</div>{canRate && <label className="chk"><input type="checkbox" checked={tshow} onChange={(e) => setTshow(e.target.checked)} /> <span>{tr("Afficher mes tarifs sur mon profil et sur ma carte")}</span></label>}</div>
            <label className="f">{isLive ? tr("Numéro WhatsApp (obligatoire)") : tr("Numéro de téléphone (obligatoire)")}<input type="tel" required inputMode="tel" maxLength={20} placeholder="06 12 34 56 78" value={f.phone} onChange={set("phone")} /></label>
            {!isLive && <label className="chk"><input type="checkbox" checked={wa} onChange={(e) => setWa(e.target.checked)} /> <span>{tr("Je suis aussi joignable sur WhatsApp avec ce numéro (un bouton WhatsApp s’affichera avec le numéro).")}</span></label>}
            {!isLive && <label className="chk"><input type="checkbox" checked={sms} onChange={(e) => setSms(e.target.checked)} /> <span>{tr("Je réponds aussi aux SMS sur ce numéro (un bouton SMS s’affichera avec le numéro).")}</span></label>}
            {isLive && <div className="f"><span style={L}>{tr("Paiement (optionnel)")}</span><div className="row2">
              <input maxLength={80} placeholder={tr("Wero : numéro ou e-mail")} aria-label={tr("Wero : numéro ou e-mail")} value={wero} onChange={(e) => setWero(e.target.value)} />
              <input maxLength={80} placeholder={tr("PayPal : lien paypal.me ou e-mail")} aria-label={tr("PayPal : lien paypal.me ou e-mail")} value={paypal} onChange={(e) => setPaypal(e.target.value)} /></div></div>}
            <div className="f"><span style={L}>{tr("Réseaux sociaux (optionnel, ton pseudo sans @)")}</span>
              {!socOk && <p className="note" style={{ margin: 0 }}>{tr("🔒 Les réseaux sociaux sont réservés aux profils VIP : ils ne s’affichent pas sur ton profil. ")}<Link href="/contact?s=vip">{tr("Devenir VIP")}</Link></p>}
              <div className="row3">{!isLive && <input maxLength={31} disabled={!socOk} placeholder="Instagram" aria-label={tr("Pseudo Instagram")} value={f.instagram} onChange={set("instagram")} />}
                <input maxLength={31} disabled={!socOk} placeholder="Snapchat" aria-label={tr("Pseudo Snapchat")} value={f.snapchat} onChange={set("snapchat")} />
                {!isLive && <input maxLength={31} disabled={!socOk} placeholder="TikTok" aria-label={tr("Pseudo TikTok")} value={f.tiktok} onChange={set("tiktok")} />}</div></div>
            <p className="note">{tr("Le numéro et les pseudos seront visibles par tous sur ton profil. Ne mets que ce que tu veux partager publiquement.")}</p>

</section><section className="dcard"><h3>{tr("Photos, vidéo et vérification")}</h3><div>
              <p className="note" style={{ margin: "0 0 6px" }}><b>{tr("Mes photos")} ({photos.length}/{maxP})</b>{tr(" · la première sert de couverture. ◀ ▶ pour déplacer, ✕ pour supprimer.")}{photos.length < 3 && <span style={{ color: "var(--btn)", fontWeight: 700 }}>{tr(" Il en faut au moins 3.")}</span>}</p>
              <div className="edph">{photos.map((src, i) => (
                <div key={src} className={`eph${i === 0 ? " first" : ""}`}><img src={src} referrerPolicy="no-referrer" alt={tr("Photo {n}", { n: i + 1 })} />
                  {i === 0 && <span className="fst">{tr("En avant")}</span>}
                  <button type="button" className="rm" aria-label={tr("Supprimer la photo {n}", { n: i + 1 })} title={tr("Supprimer")} onClick={() => setPhotos(photos.filter((_, j) => j !== i))}>✕</button>
                  <span className="mv">{i > 0 ? <button type="button" aria-label={tr("Déplacer vers la gauche")} onClick={() => move(i, -1)}>◀</button> : <i />}{i < photos.length - 1 ? <button type="button" aria-label={tr("Déplacer vers la droite")} onClick={() => move(i, 1)}>▶</button> : <i />}</span>
                </div>))}</div>
            </div>
            {photos.length < maxP && <label className={`dz${drag ? " drag" : ""}`} onDragOver={(e) => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)} onDrop={(e) => { e.preventDefault(); setDrag(false); if (!busy) addPhotos(e.dataTransfer.files); }}>
              <input type="file" accept="image/*" multiple disabled={busy} onChange={(e) => { addPhotos(e.target.files); e.target.value = ""; }} />
              <b>📷 {busy ? tr("Envoi en cours…") : tr("Choisir des photos")}</b>
              <span>{tr("Sélectionne")} <u>{tr("plusieurs photos d’un coup")}</u> {tr("dans ta galerie")}{"\u00A0"}{tr("— ou glisse-les ici sur ordinateur. Minimum 3, maximum {n}", { n: maxP })}{vip ? "" : tr(" (20 en VIP)")}{tr(". Le filigrane est ajouté automatiquement.")}</span>
              {prog >= 0 && <i className="dzp"><u style={{ width: Math.round(prog * 100) + "%" }} /></i>}
            </label>}
            {photos.length < maxP && <div className="f"><span style={L}>{tr("Ou ajoute une photo par lien (image hébergée ailleurs)")}</span><div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}><input type="url" inputMode="url" placeholder="https://…/photo.jpg" aria-label={tr("Lien de la photo")} value={plink} onChange={(e) => setPlink(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addLink(); } }} style={{ flex: "1 1 220px", minWidth: 0 }} /><button type="button" className="btn ghost" onClick={addLink}>{tr("Ajouter le lien")}</button></div><small className="note">{tr("Le filigrane n’est pas ajouté sur les photos par lien, et la photo disparaît si l’autre site la retire.")}</small></div>}
            {pMsg && <p className="note" role="alert" aria-live="polite" style={{ margin: 0, fontWeight: 700, color: pMsg.ok ? "inherit" : "var(--btn)" }}>{pMsg.t}</p>}
<h4 className="subh">{tr("Vidéo")}</h4>{kind === "livecam" && <label className="f">{tr("Lien de ton live (obligatoire pour un profil livecam)")}<input type="url" placeholder="https://" value={vlink} onChange={(e) => setVlink(e.target.value)} required /></label>}
            <p className="note" style={{ margin: "0 0 6px" }}><b>{tr("Ma vidéo")} ({video ? 1 : 0}/1)</b>{tr(" · une seule vidéo de présentation, 20 Mo maximum. ✕ pour la supprimer.")}</p>
            {video && <div className="edph"><div className="eph vid"><video src={video + "#t=0.1"} muted playsInline preload="metadata" aria-label={tr("Aperçu de ma vidéo")} />
              <span className="fst">{tr("Vidéo")}</span>
              <button type="button" className="rm" aria-label={tr("Supprimer la vidéo")} title={tr("Supprimer")} onClick={() => { setVideo(null); setVMsg(null); }}>✕</button></div></div>}
            {!video && <label className={`dz${vdrag ? " drag" : ""}`} onDragOver={(e) => { e.preventDefault(); setVdrag(true); }} onDragLeave={() => setVdrag(false)} onDrop={(e) => { e.preventDefault(); setVdrag(false); if (!busy) addVideo(e.dataTransfer.files?.[0]); }}>
              <input type="file" accept="video/mp4,video/webm,video/quicktime" disabled={busy} onChange={(e) => { addVideo(e.target.files?.[0]); e.target.value = ""; }} />
              <b>🎬 {busy ? tr("Envoi en cours…") : tr("Choisir une vidéo")}</b>
              <span>{tr("Sélectionne ta vidéo dans ta galerie")}{"\u00A0"}{tr("— ou glisse-la ici sur ordinateur. MP4, WebM ou MOV, 20 Mo maximum.")}</span>
            </label>}
            {vMsg && <p className="note" role="alert" aria-live="polite" style={{ margin: 0, fontWeight: 700, color: vMsg.ok ? "inherit" : "var(--btn)" }}>{vMsg.t}</p>}

{!isNewP && <VerifRequest uid={uid} verified={verif} embedded />}</section><section className="dcard"><h3 id="dispo">{tr("Disponibilités")}</h3><div className={`hf${h24 ? " is24" : ""}`}><strong>{tr("Mes heures de disponibilité (obligatoire)")}</strong>
              <p className="note">{tr("Coche les jours où tu es joignable. Ton profil affichera « Dispo » pendant ces heures et sera grisé en dehors.")}</p>
              <label className="h24"><input type="checkbox" checked={h24} onChange={(e) => setH24(e.target.checked)} /> <b>{tr("Disponible 24h/24, 7j/7")}</b></label>
              {DAYL.map((d, i) => { const h = hours[String(i)];
                return <div className="d" key={d}><label><input type="checkbox" disabled={h24} checked={!!h} onChange={(e) => setHours({ ...hours, [String(i)]: e.target.checked ? (["09:00", "19:00"] as [string, string]) : null })} />{tr(d)}</label>
                  <input type="time" disabled={h24 || !h} value={h ? h[0] : "09:00"} onChange={(e) => h && setHours({ ...hours, [String(i)]: [e.target.value, h[1]] as [string, string] })} />
                  <input type="time" disabled={h24 || !h} value={h ? h[1] : "19:00"} onChange={(e) => h && setHours({ ...hours, [String(i)]: [h[0], e.target.value] as [string, string] })} /></div>; })}
            </div>
</section><section className="dcard"><label className="chk"><input type="checkbox" required checked={ok18} onChange={(e) => setOk18(e.target.checked)} /> <span>{tr("Je suis majeur·e, je détiens les droits sur ces contenus et ils sont professionnels (aucun contenu à caractère sexuel).")}</span></label>
            {msg && <p className="note" role="alert" style={{ color: msg.ok ? "inherit" : "var(--btn)", fontWeight: 700 }}>{msg.t}</p>}
            <button className="dbtn" type="submit" disabled={busy}>{busy ? tr("Patiente…") : isNewP ? tr("Publier mon profil") : tr("Enregistrer")}</button></section>
          </fieldset></form>}
          {!isNewP && <section className="dcard dzone" id="supprimer"><h3>{tr("🗑 Supprimer mon profil et mes données")}</h3>
            <p className="note" style={{ margin: "0 0 10px" }}>{tr("Efface définitivement ton profil, tes photos et ta vidéo, tes commentaires, tes signalements de numéros et ton compte de connexion. C’est irréversible.")}</p>
            {!delAsk ? <button type="button" className="btn ghost" onClick={() => setDelAsk(true)}>{tr("Supprimer mon compte…")}</button> : <div style={{ display: "grid", gap: 8 }}>
              <label className="f">{tr("Pour confirmer, écris")} <b>SUPPRIMER</b><input value={delTxt} onChange={(e) => setDelTxt(e.target.value)} autoComplete="off" /></label>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button type="button" className="btn" disabled={delBusy || delTxt.trim().toUpperCase() !== "SUPPRIMER"} onClick={deleteAll}>{delBusy ? tr("Suppression…") : tr("Oui, tout supprimer")}</button>
                <button type="button" className="btn ghost" disabled={delBusy} onClick={() => { setDelAsk(false); setDelTxt(""); }}>{tr("Annuler")}</button></div>
              {delMsg && <p className="note" role="alert" style={{ color: "var(--btn)", fontWeight: 700, margin: 0 }}>{delMsg}</p>}</div>}
          </section>}
        </div>
      </main>
    </div>
  );
}
