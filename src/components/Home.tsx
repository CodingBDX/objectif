"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { GPATH, slug } from "@/lib/site";
import { nearestCity } from "@/lib/geo";
import { thumbUrl } from "@/lib/img";
import Ic from "./Ic";
import Heart from "./Heart";
import NearbyCities from "./NearbyCities";
import SearchBox from "./SearchBox";
import { useT, Tr } from "@/lib/i18n";
const SearchLink = ({ cls = "" }: { cls?: string }) => { const { tr } = useT(); return <Link href="/recherche" className={`sp sbox slink ${cls}`} aria-label={tr("Ouvrir la recherche")}><Ic n="search" /><span>{tr("Ville, profil, spécialité…")}</span></Link>; };
import dynamic from "next/dynamic";
const MapView = dynamic(() => import("./MapView"), { ssr: false, loading: () => <p className="note"><Tr k="Chargement de la carte…" /></p> });
import { useFavs } from "@/lib/favs";
import { avail, tripsOf, todayP, dShort } from "@/lib/avail";
import { CIC, cap, cityList, isNew, lab, Profile, showTarif, LANGS, ETHNIES, HAIRS, EYES, BRAS } from "@/lib/types";
const DF0 = { amin: "", amax: "", hmin: "", hmax: "", wmin: "", wmax: "", eth: "", lang: "", hair: "", eyes: "", bra: "", smk: "", drk: "", recv: false, trav: false };

const PAGE = 10;
const inRange = (v: number | null | undefined, a: string, b: string) => { if (!a && !b) return true; if (!v) return false; return (!a || v >= Number(a)) && (!b || v <= Number(b)); };
const isoIn = (n: number) => new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Paris" }).format(new Date(Date.now() + n * 864e5));
/** Déplacement du profil vers cette ville qui tombe dans les n prochains jours. */
const visitOf = (p: Profile, city: string, n: number) => { const t = todayP(), lim = isoIn(n); return tripsOf(p).find((x) => slug(x.city) === slug(city) && x.from <= lim && x.to >= t); };
const ITEMS: [string, string, string][] = [["tous", "Tous les profils", "grid"], ["fille", "Filles", "fille"], ["homme", "Hommes", "homme"], ["trans", "Trans", "trans"], ["livecam", "Livecam", "live"]];

function Tile({ u }: { u: string }) {
  return <div>{u && <img src={thumbUrl(u)} alt="" loading="lazy" decoding="async" onError={(e) => { const el = e.currentTarget; if (!el.dataset.fb) { el.dataset.fb = "1"; el.src = u; } }} />}</div>;
}
function Card({ p, onOpen, delay, trip }: { p: Profile; onOpen: () => void; delay?: number; trip?: { from: string; to: string } }) {
  const { tr } = useT();
  const a = avail(p); const live = p.genre === "livecam"; const pics = p.photos.slice(0, 3);
  while (pics.length < 3) pics.push(p.photos[0] || "");
  return (
    <article className={`card${p.vip ? " isvip" : ""}${live ? " live" : ""}${a && !a.on ? " off" : ""}${delay !== undefined ? " pop" : ""}`} style={delay !== undefined ? { animationDelay: delay + "ms" } : undefined}
      tabIndex={0} aria-label={tr("Voir le profil de {n}", { n: p.name })} onClick={onOpen} onKeyDown={(e) => e.key === "Enter" && onOpen()}>
      <div className="cover">
        <div className="tr"><span className="phb" title={tr("Nombre de photos")}><Ic n="camera" s={14} />{p.photos.length}</span>{p.vip && <span className="vipb"><Ic n="crown" s={14} />VIP</span>}</div>
        {isNew(p) && <span className="nwb" title={tr("Profil créé il y a moins d’un mois")}><Ic n="spark" s={14} />{tr("New")}</span>}
        <div className="mos">{pics.map((u, i) => <Tile key={i} u={u} />)}</div>
        {a && a.on && <span className={`avb${live ? " live" : ""}`}><i /><Ic n="clock" s={13} />{live ? tr("En direct") : tr("Dispo")}</span>}
        {lab(p) && <span className={`badge${live ? " live" : ""}`}>{lab(p)}</span>}
        {p.video && <span className="vid-ic"><Ic n="video" s={14} />{tr("vidéo")}</span>}
      </div>
      <div className="in">
        <div className="ln"><h3>{p.name}</h3>
          {p.verified && <span className="vf" role="img" aria-label={tr("Profil vérifié")} title={tr("Profil vérifié")}><Ic n="check" s={12} /></span>}
          <Heart id={p.id} /></div>
        <div className="meta"><Ic n="pin" s={15} />{live ? tr("En ligne") : p.city}{p.more?.length ? " " + tr("+ {n} ville(s)", { n: p.more.length }) : ""}</div>
        {a && (a.on
          ? <div className="meta avl on"><Ic n="clock" s={15} />{a.h24 ? tr("Disponible 24h/24, 7j/7") : tr("Disponible jusqu’à {u}", { u: a.until || "" })}</div>
          : <div className="meta"><Ic n="clock" s={15} />{tr("Indisponible")}{a.next ? tr(" · reprend {n}", { n: a.next }) : ""}</div>)}
        <div className="meta"><Ic n={CIC[p.genre] || "camera"} s={15} />{lab(p) ? lab(p) + " · " : ""}{p.photos.length} photos</div>
        {showTarif(p) ? <div className="meta"><Ic n="rose" s={15} />{p.tarif_30 ? <>30 min <b>{p.tarif_30}</b></> : null}{p.tarif_30 && p.tarif_60 ? " · " : ""}{p.tarif_60 ? <>1 h <b>{p.tarif_60}</b></> : null}</div> : null}
        {trip ? <div className="meta avl on"><Ic n="pin" s={15} />{trip.to !== trip.from ? tr("Passe du {a} au {b}", { a: dShort(trip.from), b: dShort(trip.to) }) : tr("Passe le {a}", { a: dShort(trip.from) })}</div> : null}
        <div className="tags">{p.specialties.slice(0, 2).map((t) => <span className="tag" key={t}>{cap(t)}</span>)}</div>
      </div>
    </article>
  );
}

export default function Home({ profiles, initialType = "tous", initialCity = "", h1 = "Tous les profils", intro = "", region = "", regions = {}, searchMode = false }: { searchMode?: boolean; profiles: Profile[]; initialType?: string; initialCity?: string; h1?: string; intro?: React.ReactNode; region?: string; regions?: Record<string, string> }) {
  const { tr } = useT(); const r = useRouter(); const sp = useSearchParams(); const { favs } = useFavs();
  const [type, setType] = useState(initialType); const [tag, setTag] = useState(sp.get("tag") || ""); const [q, setQ] = useState(sp.get("q") || "");
  const [sort, setSort] = useState("rec"); const [vid, setVid] = useState(false); const [ver, setVer] = useState(false); const [now, setNow] = useState(false); const [visit, setVisit] = useState(0); const [tar, setTar] = useState(0); const [dur, setDur] = useState<30 | 60>(60);
  const [df, setDf] = useState(DF0); const upd = (k: keyof typeof DF0, v: string | boolean) => setDf((d) => ({ ...d, [k]: v }));
  const [view, setView] = useState<"cards" | "list" | "map">("cards"); const [shown, setShown] = useState(PAGE);
  const [near, setNear] = useState(""); const [geoBusy, setGeoBusy] = useState(false); const [geoMsg, setGeoMsg] = useState(""); const [geoHelp, setGeoHelp] = useState(false);
  const canNear = !initialCity && !sp.get("ville") && !sp.get("fav");
  const city = initialCity || sp.get("ville") || (canNear ? near : "");
  const allCities = useMemo(() => Array.from(new Set(profiles.flatMap(cityList))), [profiles]);
  const locate = (auto = false) => {
    if (!navigator.geolocation) { setGeoMsg(tr("La localisation n’est pas disponible sur cet appareil.")); return; }
    setGeoBusy(true); setGeoMsg(""); setGeoHelp(false);
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const c = await nearestCity(pos.coords.latitude, pos.coords.longitude, allCities);
      setGeoBusy(false);
      if (c) { setNear(c); try { localStorage.setItem("objectif_pm", JSON.stringify({ city: c, t: Date.now() })); } catch {} }
      else if (!auto) setGeoMsg(tr("Aucun créateur près de toi pour le moment. Essaie une autre ville dans le Top 10."));
    }, (err) => {
      setGeoBusy(false); if (auto) return;
      if (err.code === 1) { setGeoMsg(tr("La localisation est bloquée pour ce site. Autorise-la dans les réglages de ton appareil, puis réessaie.")); setGeoHelp(true); }
      else if (err.code === 3) setGeoMsg(tr("La localisation a pris trop de temps. Réessaie, ou choisis ta ville dans le Top 10."));
      else setGeoMsg(tr("Position introuvable. Choisis ta ville dans le Top 10."));
    }, { timeout: 10000, maximumAge: 600000 });
  };
  const pm = sp.get("pm");
  useEffect(() => { if (pm && canNear) { try { localStorage.removeItem("objectif_pm"); } catch {} locate(); } }, [pm]);
  useEffect(() => { // clic sur le logo : on repart de zéro (recherche, filtres, ville, « près de moi »)
    const h = () => { setType(initialType); setTag(""); setQ(""); setSort("rec"); setVid(false); setVer(false); setNow(false); setTar(0); setVisit(0); setDur(60); setNear(""); setGeoMsg(""); setGeoHelp(false); setShown(PAGE); window.scrollTo({ top: 0, behavior: "smooth" }); };
    window.addEventListener("hp-home", h); return () => window.removeEventListener("hp-home", h);
  }, [initialType]);
  const stopNear = () => { setNear(""); try { localStorage.setItem("objectif_pm", JSON.stringify({ off: true })); } catch {} };
  useEffect(() => { // précharge la dernière ville connue, puis la rafraîchit si la localisation est déjà autorisée
    if (!canNear) return;
    let saved: any = null; try { saved = JSON.parse(localStorage.getItem("objectif_pm") || "null"); } catch {}
    if (saved?.off) return;
    if (saved?.city && allCities.includes(saved.city)) setNear(saved.city);
    (async () => { try { const st = await (navigator as any).permissions?.query({ name: "geolocation" }); if (st?.state === "granted") locate(true); } catch {} })();
  }, [canNear, allCities.length]); const fav = !!sp.get("fav");
  useEffect(() => { try { if (localStorage.getItem("objectif_vue") === "list") setView("list"); } catch {} }, []);
  useEffect(() => { setShown(PAGE); }, [type, tag, q, sort, vid, ver, now, tar, dur, visit, city, fav, df]);
  const chView = (v: "cards" | "list" | "map") => { setView(v); if (v !== "map") { try { localStorage.setItem("objectif_vue", v); } catch {} } };

  const list = useMemo(() => {
    const l = profiles.filter((p) => (type === "tous" ? p.genre !== "livecam" || fav : p.genre === type) && (!city || (visit ? !!visitOf(p, city, visit) : cityList(p).includes(city))) && (!tag || p.specialties.some((t) => t.toLowerCase() === tag))
      && (!fav || favs.includes(p.id)) && inRange(p.age, df.amin, df.amax) && inRange(p.height_cm, df.hmin, df.hmax) && inRange(p.weight_kg, df.wmin, df.wmax)
      && (!df.eth || p.ethnicity === df.eth) && (!df.lang || (p.languages || []).includes(df.lang)) && (!df.hair || p.hair === df.hair) && (!df.eyes || p.eyes === df.eyes) && (!df.bra || p.bra === df.bra)
      && (!df.smk || p.smoker === df.smk) && (!df.drk || p.drinker === df.drk) && (!df.recv || p.receives) && (!df.trav || p.travels)
      && (!vid || p.video) && (!ver || p.verified) && (!now || avail(p)?.on) && (!tar || (showTarif(p) && (dur === 30 ? p.tarif_30 : p.tarif_60) ? (tar === 999 ? (dur === 30 ? p.tarif_30 : p.tarif_60)! > (dur === 30 ? 150 : 300) : (dur === 30 ? p.tarif_30 : p.tarif_60)! <= tar) : false))
      && (!q || (p.name + " " + cityList(p).join(" ") + " " + p.specialties.join(" ") + " " + p.bio.replace(/[*#]/g, "") + " " + lab(p)).toLowerCase().includes(q.toLowerCase())));
    l.sort((a, b) => sort === "az" ? a.name.localeCompare(b.name) : sort === "media" ? b.photos.length - a.photos.length : sort === "tarif" ? ((showTarif(a) && (dur === 30 ? a.tarif_30 : a.tarif_60)) || 1e9) - ((showTarif(b) && (dur === 30 ? b.tarif_30 : b.tarif_60)) || 1e9) : sort === "vus" ? (b.views || 0) - (a.views || 0) : +new Date(b.created_at) - +new Date(a.created_at));
    l.sort((a, b) => +b.vip - +a.vip);
    return l;
  }, [profiles, type, tag, q, sort, vid, ver, now, tar, dur, visit, city, fav, favs, df]);

  const mapCities = useMemo(() => { const by: Record<string, { city: string; n: number; p: { id: string; name: string; sub: string; g: string; img: string }[] }> = {}; list.filter((p) => p.genre !== "livecam").forEach((p) => { const c = (by[p.city] ||= { city: p.city, n: 0, p: [] }); c.n++; if (c.p.length < 14) c.p.push({ id: p.id, name: p.name, sub: lab(p), g: p.genre, img: p.photos[0] || "" }); }); return Object.values(by).sort((a, b) => b.n - a.n); }, [list]);
  const inCity = useMemo(() => (city ? profiles.filter((p) => cityList(p).includes(city)) : profiles), [profiles, city]);
  const cnt = (t: string) => (t === "tous" ? inCity.length : inCity.filter((p) => p.genre === t).length);
  const tags = useMemo(() => { const tc: Record<string, number> = {}; inCity.filter((p) => type === "tous" || p.genre === type).forEach((p) => p.specialties.forEach((t) => { t = t.toLowerCase(); tc[t] = (tc[t] || 0) + 1; })); return Object.entries(tc).sort((x, y) => y[1] - x[1] || x[0].localeCompare(y[0])).slice(0, 8); }, [inCity, type]);
  useEffect(() => { if (tag && !tags.some(([t]) => t === tag)) setTag(""); }, [tags, tag]);
  const top = useMemo(() => { const cc: Record<string, number> = {}; profiles.filter((p) => (type === "tous" ? p.genre !== "livecam" : p.genre === type)).forEach((p) => cityList(p).forEach((c) => { if (!region || regions[c] === region) cc[c] = (cc[c] || 0) + 1; })); return Object.entries(cc).sort((x, y) => y[1] - x[1] || x[0].localeCompare(y[0], "fr")).slice(0, 9); }, [profiles, type, region, regions]);
  const hl = useMemo(() => profiles.filter((p) => (type === "tous" ? p.genre !== "livecam" : p.genre === type) && (!tag || p.specialties.some((x) => x.toLowerCase() === tag)) && (!city || cityList(p).includes(city))).sort((a, b) => +b.vip - +a.vip || (b.views || 0) + 5 * (b.favs || 0) - (a.views || 0) - 5 * (a.favs || 0) || +new Date(b.created_at) - +new Date(a.created_at)).slice(0, 10), [profiles, type, tag, city]);

  const sentinel = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = sentinel.current; if (!el || shown >= list.length) return;
    const io = new IntersectionObserver((es) => { if (es[0].isIntersecting) setShown((s) => Math.min(s + PAGE, list.length)); }, { rootMargin: "600px" });
    io.observe(el); return () => io.disconnect();
  }, [shown, list.length]);
  const slides = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = slides.current; if (!el || hl.length < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let stop = false; const halt = () => { stop = true; };
    el.addEventListener("touchstart", halt, { passive: true }); el.addEventListener("pointerdown", halt);
    const t = setInterval(() => { if (stop) return; const w = el.clientWidth * 0.5; el.scrollTo({ left: el.scrollLeft + w >= el.scrollWidth - 4 ? 0 : el.scrollLeft + w, behavior: "smooth" }); }, 3500);
    return () => clearInterval(t);
  }, [hl]);
  useEffect(() => { setQ(sp.get("q") || ""); setTag(sp.get("tag") || ""); }, [sp]); // recherche venant du menu du haut
  const open = (id: string) => r.push(`/profil/${id}`);
  const setCity = (c: string) => r.push(c ? `/${searchMode ? "recherche" : ""}?ville=${encodeURIComponent(c)}` : searchMode ? "/recherche" : "/");
  const clear = () => { setType("tous"); setTag(""); setQ(""); setSort("rec"); setVid(false); setVer(false); setNow(false); setTar(0); setVisit(0); setDur(60); setDf(DF0); r.push(searchMode ? "/recherche" : "/"); };

  return (
    <div className={`shell gut${searchMode ? " srch" : ""}`} id="shell">
      <aside className="side" aria-label={tr("Catégories")}>
        <div className="panel tip"><svg className="ic" viewBox="0 0 24 24" width="40" height="40" aria-hidden="true"><path d="M12 3l7.500 2.800v5.700c0 4.500-3 8.200-7.500 9.500-4.500-1.300-7.500-5-7.500-9.500V5.800z" /><path d="M8.800 12.200l2.300 2.300 4.200-4.600" /></svg><span>{tr("Site fait par et pour les pros, ")}<b>{tr("50 % reversés aux associations")}</b></span></div>
        <div className="panel">
          <div>{ITEMS.map(([k, v, i]) => <Link key={k} className={`si${type === k && !fav ? " on" : ""}`} href={k === "tous" ? (city ? `/ville/${slug(city)}` : "/") : city ? `/genre/${GPATH[k]}/${slug(city)}` : `/genre/${GPATH[k]}`}><Ic n={i} />{tr(v)}<span className="n">{cnt(k)}</span></Link>)}</div>
          <hr className="sep" />
          <h2><Ic n="tag" s={20} />Spécialités</h2>
          <div>{tags.map(([t, n]) => <button key={t} className={`si${tag === t ? " on" : ""}`} onClick={() => setTag(tag === t ? "" : t)}>{cap(t)}<span className="n">{n}</span></button>)}</div>
        </div>
      </aside>

      <main style={{ minWidth: 0 }}>
        {!searchMode && hl.length > 0 && <section className="mhl" aria-label={tr("Mis en avant")}>
          <h2><Ic n="star" s={20} />{tr("Mis en avant")}</h2>
          <div className="mhs" ref={slides}>{hl.map((p) => <button key={p.id} className="mslide" onClick={() => open(p.id)} aria-label={tr("Voir le profil de {n}", { n: p.name })}>
            <i className={p.vip ? "vip" : ""}>{p.photos[0] && <img src={thumbUrl(p.photos[0])} alt="" decoding="async" onError={(e) => { const el = e.currentTarget; if (!el.dataset.fb) { el.dataset.fb = "1"; el.src = p.photos[0]; } }} />}{p.vip && <em><Ic n="crown" s={14} /></em>}</i>
            <b>{p.name}</b><small>{lab(p) ? lab(p) + " · " : ""}{p.city}</small></button>)}</div>
        </section>}
        {!searchMode && <section className="panel top" aria-labelledby="topH"><h2 id="topH"><Ic n="star" s={20} />Top <span className="t10">9</span><span className="t6">6</span><span className="t3">3</span> {region || "France"}</h2>
          <ol>{top.map(([c, n], i) => <li key={c}><Link className={city === c ? "on" : ""} href={city === c ? (type === "tous" ? "/" : `/genre/${GPATH[type]}`) : type === "tous" ? `/ville/${slug(c)}` : `/genre/${GPATH[type]}/${slug(c)}`}><span className="rk">{i + 1}</span>{c}<span className="n">{n} profil{n > 1 ? "s" : ""}</span></Link></li>)}</ol></section>}
        <div className={`panel msearch${searchMode ? " on" : ""}`} id="recherche">{searchMode && <div className="dsearch"><h2><Ic n="search" s={20} />{tr("Rechercher")}</h2><SearchBox profiles={profiles} q={q} setQ={setQ} onCity={setCity} onProfile={open} onTag={(t) => setTag(t)} /></div>}<h2 className="fh"><Ic n="sliders" s={20} />{tr("Filtres")}<button className="clear" onClick={clear}>{tr("Tout effacer")}</button></h2>
          <div className="row"><span>{tr("Profil")}</span><select aria-label={tr("Profil")} value={type} onChange={(e) => setType(e.target.value)}><option value="tous">{tr("Tous les profils")}</option><option value="fille">{tr("Filles")}</option><option value="homme">{tr("Hommes")}</option><option value="trans">{tr("Trans")}</option><option value="livecam">{tr("Livecam")}</option></select></div>
          <div className="row"><span>{tr("Trier par")}</span><select aria-label={tr("Tri")} value={sort} onChange={(e) => setSort(e.target.value)}><option value="rec">{tr("Plus récents")}</option><option value="az">{tr("Nom (A à Z)")}</option><option value="tarif">{tr("Tarif croissant (selon la durée)")}</option><option value="vus">{tr("Plus vus (30 jours)")}</option><option value="media">{tr("Plus de contenus")}</option></select></div>
          {city && <div className="row"><span>{tr("Passages dans {c}", { c: city })}</span><select aria-label={tr("Passages dans la ville")} value={visit} onChange={(e) => setVisit(Number(e.target.value))}><option value={0}>{tr("Profils de la ville")}</option><option value={7}>{tr("De passage cette semaine")}</option><option value={30}>{tr("De passage ce mois-ci")}</option></select></div>}
          <div className="row"><span>{tr("Durée")}</span><select aria-label={tr("Durée")} value={dur} onChange={(e) => { setDur(Number(e.target.value) as 30 | 60); setTar(0); }}><option value={60}>{tr("1 heure")}</option><option value={30}>{tr("30 minutes")}</option></select></div>
          <div className="row"><span>{tr("Tarif maximum 🌹")}</span><select aria-label={tr("Tarif maximum")} value={tar} onChange={(e) => setTar(Number(e.target.value))}><option value={0}>{tr("Tous les tarifs")}</option>{(dur === 30 ? [50, 80, 100, 150] : [100, 150, 200, 300]).map((v) => <option key={v} value={v}>{v} maximum</option>)}<option value={999}>Plus de {dur === 30 ? 150 : 300}</option></select></div>
          <label className="ck"><input type="checkbox" checked={vid} onChange={(e) => setVid(e.target.checked)} /> {tr("Avec vidéo de présentation")}</label>
          <label className="ck"><input type="checkbox" checked={ver} onChange={(e) => setVer(e.target.checked)} /> {tr("Profils vérifiés uniquement")}</label>
          <label className="ck"><input type="checkbox" checked={now} onChange={(e) => setNow(e.target.checked)} /> {tr("Disponibles maintenant")}</label>
          <div className="row"><span>{tr("Âge")}</span><span className="rng"><input type="number" inputMode="numeric" aria-label={tr("Âge minimum")} placeholder="min" value={df.amin} onChange={(e) => upd("amin", e.target.value)} /><input type="number" inputMode="numeric" aria-label={tr("Âge maximum")} placeholder="max" value={df.amax} onChange={(e) => upd("amax", e.target.value)} /></span></div>
          <div className="row"><span>{tr("Taille (cm)")}</span><span className="rng"><input type="number" inputMode="numeric" aria-label={tr("Taille (cm) minimum")} placeholder="min" value={df.hmin} onChange={(e) => upd("hmin", e.target.value)} /><input type="number" inputMode="numeric" aria-label={tr("Taille (cm) maximum")} placeholder="max" value={df.hmax} onChange={(e) => upd("hmax", e.target.value)} /></span></div>
          <div className="row"><span>{tr("Poids (kg)")}</span><span className="rng"><input type="number" inputMode="numeric" aria-label={tr("Poids (kg) minimum")} placeholder="min" value={df.wmin} onChange={(e) => upd("wmin", e.target.value)} /><input type="number" inputMode="numeric" aria-label={tr("Poids (kg) maximum")} placeholder="max" value={df.wmax} onChange={(e) => upd("wmax", e.target.value)} /></span></div>
          <div className="row"><span>{tr("Ethnie")}</span><select aria-label="Ethnie" value={df.eth} onChange={(e) => upd("eth", e.target.value)}><option value="">{tr("Peu importe")}</option>{ETHNIES.map((x) => <option key={x} value={x}>{tr(x)}</option>)}</select></div>
          <div className="row"><span>{tr("Langue parlée")}</span><select aria-label={tr("Langue parlée")} value={df.lang} onChange={(e) => upd("lang", e.target.value)}><option value="">{tr("Peu importe")}</option>{LANGS.map((x) => <option key={x} value={x}>{tr(x)}</option>)}</select></div>
          <div className="row"><span>{tr("Cheveux")}</span><select aria-label="Cheveux" value={df.hair} onChange={(e) => upd("hair", e.target.value)}><option value="">{tr("Peu importe")}</option>{HAIRS.map((x) => <option key={x} value={x}>{tr(x)}</option>)}</select></div>
          <div className="row"><span>{tr("Yeux")}</span><select aria-label="Yeux" value={df.eyes} onChange={(e) => upd("eyes", e.target.value)}><option value="">{tr("Peu importe")}</option>{EYES.map((x) => <option key={x} value={x}>{tr(x)}</option>)}</select></div>
          <div className="row"><span>{tr("Bonnet")}</span><select aria-label="Bonnet" value={df.bra} onChange={(e) => upd("bra", e.target.value)}><option value="">{tr("Peu importe")}</option>{BRAS.map((x) => <option key={x} value={x}>{tr(x)}</option>)}</select></div>
          <div className="row"><span>{tr("Fume")}</span><select aria-label="Fume" value={df.smk} onChange={(e) => upd("smk", e.target.value)}><option value="">{tr("Peu importe")}</option><option value="non">{tr("Non")}</option><option value="parfois">{tr("Parfois")}</option><option value="oui">{tr("Oui")}</option></select></div>
          <div className="row"><span>{tr("Boit")}</span><select aria-label="Boit" value={df.drk} onChange={(e) => upd("drk", e.target.value)}><option value="">{tr("Peu importe")}</option><option value="non">{tr("Non")}</option><option value="parfois">{tr("Parfois")}</option><option value="oui">{tr("Oui")}</option></select></div>
          <label className="ck"><input type="checkbox" checked={df.recv} onChange={(e) => upd("recv", e.target.checked)} /> {tr("Reçoit")}</label>
          <label className="ck"><input type="checkbox" checked={df.trav} onChange={(e) => upd("trav", e.target.checked)} /> {tr("Se déplace")}</label>
        </div>
        <div className="mchips">{ITEMS.map(([k, v]) => <button key={k} className="chip" aria-pressed={type === k} onClick={() => setType(k)}>{tr(v)}</button>)}</div>
        <div className="sh"><h1><Ic n="star" s={22} />{h1.startsWith("Escortes à ") ? tr("Escortes à {c}", { c: h1.slice(11) }) : tr(h1)}</h1><span className="cnt0" aria-live="polite">{list.length} {tr(list.length > 1 ? "profils" : "profil")}</span>
          <button type="button" className="btn ghost" onClick={() => locate()} disabled={geoBusy} style={{ marginLeft: "auto" }}>📍 {geoBusy ? tr("Localisation…") : tr("Près de moi")}</button>
          <div className="vsw" role="group" aria-label={tr("Affichage")}>
            <button type="button" aria-pressed={view === "cards"} title={tr("Affichage en cartes")} aria-label={tr("Cartes")} onClick={() => chView("cards")}><Ic n="grid" /></button>
            <button type="button" aria-pressed={view === "list"} title={tr("Affichage en liste")} aria-label={tr("Liste")} onClick={() => chView("list")}>
              <svg className="ic" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><rect x="3" y="4" width="18" height="6" rx="2" /><rect x="3" y="14" width="18" height="6" rx="2" /></svg></button>
            <button type="button" aria-pressed={view === "map"} title={tr("Affichage sur la carte")} aria-label={tr("Carte")} onClick={() => chView("map")}><Ic n="pin" /></button>
          </div>
        </div>
        {geoMsg && <p className="note" role="alert" style={{ margin: "0 0 12px", color: "var(--btn)", fontWeight: 700 }}>{geoMsg}</p>}
        {geoHelp && <div className="panel" style={{ margin: "0 0 12px", padding: "12px 16px" }}>
          <b>{tr("Comment autoriser la localisation")}</b>
          <ul style={{ margin: "6px 0 8px", paddingLeft: 18 }}>
            <li><b>{tr("iPhone (Safari) :")}</b> {tr("Réglages → Confidentialité et sécurité → Service de localisation → Safari (sites web) → « Lorsque l’app est active ». Ou dans Safari : bouton « aA » à gauche de l’adresse → Réglages du site web → Localisation → Autoriser.")}</li>
            <li><b>{tr("Android (Chrome) :")}</b> {tr("icône à gauche de l’adresse → Autorisations → Localisation → Autoriser. Vérifie aussi que la localisation du téléphone est activée.")}</li>
            <li><b>{tr("Ordinateur :")}</b> {tr("clique sur le cadenas à gauche de l’adresse → Localisation → Autoriser, puis recharge la page.")}</li>
          </ul>
          <button type="button" className="btn" onClick={() => locate()}>{tr("Réessayer")}</button>
        </div>}
        {canNear && near && <div className="panel" style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap", margin: "0 0 12px", padding: "10px 16px" }}>
          <span>{tr("📍 Profils près de toi : ")}<b>{near}</b></span><button type="button" className="btn ghost" onClick={stopNear}>{tr("Voir tous les profils")}</button></div>}
        {city && <NearbyCities profiles={profiles} city={city} type={type} />}
        {typeof intro === "string" ? (intro ? <p className="note" style={{ margin: "0 0 12px" }}>{tr(intro)}</p> : null) : intro}
        {view === "map" && (mapCities.length ? <MapView cities={mapCities} /> : <div className="empty">{tr("Aucun profil à afficher sur la carte.")}</div>)}
        <div className={`grid${view === "list" ? " lst" : ""}`} hidden={view === "map"}>
          {list.length ? list.slice(0, shown).map((p, i) => <Card key={p.id} p={p} onOpen={() => open(p.id)} delay={(i % PAGE) * 45} trip={visit && city ? visitOf(p, city, visit) : undefined} />)
            : <div className="empty">{fav ? tr("Aucun favori pour le moment. Touchez le cœur d’un profil pour le garder ici.") : profiles.length ? (city && !profiles.some((p) => cityList(p).includes(city)) ? tr("Aucun profil à {c} pour le moment. Sois le premier : crée ton profil !", { c: city }) : tr("Aucun profil ne correspond à votre recherche.")) : tr("Aucun profil pour le moment. Sois le premier : clique sur « Créer mon profil ».")}</div>}
        </div>
        {view !== "map" && shown < list.length && <div className="more" ref={sentinel}><i /><i /><i /><span>{tr("{n} profils à venir", { n: list.length - shown })}</span><button className="btn ghost" type="button" onClick={() => setShown((s) => s + PAGE)}>{tr("Voir plus")}</button></div>}
      </main>

      <aside className="aside" aria-label="Filtres">
        {!searchMode && <div className="panel hlp"><h2><Ic n="star" s={20} />Mis en avant{type !== "tous" ? " · " + tr(ITEMS.find((i) => i[0] === type)?.[1] || "") : ""}{tag ? " · " + cap(tag) : ""}{city ? " · " + city : ""}</h2>
          <div>{hl.slice(0, 3).map((p) => <button key={p.id} className="hl" onClick={() => open(p.id)}><i style={p.photos[0] ? { backgroundImage: `url('${p.photos[0]}')` } : undefined} /><span><b>{p.name}</b><small>{lab(p) ? lab(p) + " · " : ""}{p.city}</small></span></button>)}</div></div>}
        <div className="panel dpanel"><div className="dsearch"><h2><Ic n="search" s={20} />{tr("Rechercher")}</h2><SearchLink /></div>
          <h2 className="fh"><Ic n="sliders" s={20} />{tr("Filtres")}<button className="clear" onClick={clear}>{tr("Tout effacer")}</button></h2>
          <div className="row"><span>{tr("Profil")}</span><select aria-label={tr("Profil")} value={type} onChange={(e) => setType(e.target.value)}><option value="tous">{tr("Tous les profils")}</option><option value="fille">{tr("Filles")}</option><option value="homme">{tr("Hommes")}</option><option value="trans">{tr("Trans")}</option><option value="livecam">{tr("Livecam")}</option></select></div>
          <div className="row"><span>{tr("Trier par")}</span><select aria-label={tr("Tri")} value={sort} onChange={(e) => setSort(e.target.value)}><option value="rec">{tr("Plus récents")}</option><option value="az">{tr("Nom (A à Z)")}</option><option value="tarif">{tr("Tarif croissant (selon la durée)")}</option><option value="vus">{tr("Plus vus (30 jours)")}</option><option value="media">{tr("Plus de contenus")}</option></select></div>
          {city && <div className="row"><span>{tr("Passages dans {c}", { c: city })}</span><select aria-label={tr("Passages dans la ville")} value={visit} onChange={(e) => setVisit(Number(e.target.value))}><option value={0}>{tr("Profils de la ville")}</option><option value={7}>{tr("De passage cette semaine")}</option><option value={30}>{tr("De passage ce mois-ci")}</option></select></div>}
          <div className="row"><span>{tr("Durée")}</span><select aria-label={tr("Durée")} value={dur} onChange={(e) => { setDur(Number(e.target.value) as 30 | 60); setTar(0); }}><option value={60}>{tr("1 heure")}</option><option value={30}>{tr("30 minutes")}</option></select></div>
          <div className="row"><span>{tr("Tarif maximum 🌹")}</span><select aria-label={tr("Tarif maximum")} value={tar} onChange={(e) => setTar(Number(e.target.value))}><option value={0}>{tr("Tous les tarifs")}</option>{(dur === 30 ? [50, 80, 100, 150] : [100, 150, 200, 300]).map((v) => <option key={v} value={v}>{v} maximum</option>)}<option value={999}>Plus de {dur === 30 ? 150 : 300}</option></select></div>
          <label className="ck"><input type="checkbox" checked={vid} onChange={(e) => setVid(e.target.checked)} /> {tr("Avec vidéo de présentation")}</label>
          <label className="ck"><input type="checkbox" checked={ver} onChange={(e) => setVer(e.target.checked)} /> {tr("Profils vérifiés uniquement")}</label>
          <label className="ck"><input type="checkbox" checked={now} onChange={(e) => setNow(e.target.checked)} /> {tr("Disponibles maintenant")}</label>
          <div className="row"><span>{tr("Âge")}</span><span className="rng"><input type="number" inputMode="numeric" aria-label={tr("Âge minimum")} placeholder="min" value={df.amin} onChange={(e) => upd("amin", e.target.value)} /><input type="number" inputMode="numeric" aria-label={tr("Âge maximum")} placeholder="max" value={df.amax} onChange={(e) => upd("amax", e.target.value)} /></span></div>
          <div className="row"><span>{tr("Taille (cm)")}</span><span className="rng"><input type="number" inputMode="numeric" aria-label={tr("Taille (cm) minimum")} placeholder="min" value={df.hmin} onChange={(e) => upd("hmin", e.target.value)} /><input type="number" inputMode="numeric" aria-label={tr("Taille (cm) maximum")} placeholder="max" value={df.hmax} onChange={(e) => upd("hmax", e.target.value)} /></span></div>
          <div className="row"><span>{tr("Poids (kg)")}</span><span className="rng"><input type="number" inputMode="numeric" aria-label={tr("Poids (kg) minimum")} placeholder="min" value={df.wmin} onChange={(e) => upd("wmin", e.target.value)} /><input type="number" inputMode="numeric" aria-label={tr("Poids (kg) maximum")} placeholder="max" value={df.wmax} onChange={(e) => upd("wmax", e.target.value)} /></span></div>
          <div className="row"><span>{tr("Ethnie")}</span><select aria-label="Ethnie" value={df.eth} onChange={(e) => upd("eth", e.target.value)}><option value="">{tr("Peu importe")}</option>{ETHNIES.map((x) => <option key={x} value={x}>{tr(x)}</option>)}</select></div>
          <div className="row"><span>{tr("Langue parlée")}</span><select aria-label={tr("Langue parlée")} value={df.lang} onChange={(e) => upd("lang", e.target.value)}><option value="">{tr("Peu importe")}</option>{LANGS.map((x) => <option key={x} value={x}>{tr(x)}</option>)}</select></div>
          <div className="row"><span>{tr("Cheveux")}</span><select aria-label="Cheveux" value={df.hair} onChange={(e) => upd("hair", e.target.value)}><option value="">{tr("Peu importe")}</option>{HAIRS.map((x) => <option key={x} value={x}>{tr(x)}</option>)}</select></div>
          <div className="row"><span>{tr("Yeux")}</span><select aria-label="Yeux" value={df.eyes} onChange={(e) => upd("eyes", e.target.value)}><option value="">{tr("Peu importe")}</option>{EYES.map((x) => <option key={x} value={x}>{tr(x)}</option>)}</select></div>
          <div className="row"><span>{tr("Bonnet")}</span><select aria-label="Bonnet" value={df.bra} onChange={(e) => upd("bra", e.target.value)}><option value="">{tr("Peu importe")}</option>{BRAS.map((x) => <option key={x} value={x}>{tr(x)}</option>)}</select></div>
          <div className="row"><span>{tr("Fume")}</span><select aria-label="Fume" value={df.smk} onChange={(e) => upd("smk", e.target.value)}><option value="">{tr("Peu importe")}</option><option value="non">{tr("Non")}</option><option value="parfois">{tr("Parfois")}</option><option value="oui">{tr("Oui")}</option></select></div>
          <div className="row"><span>{tr("Boit")}</span><select aria-label="Boit" value={df.drk} onChange={(e) => upd("drk", e.target.value)}><option value="">{tr("Peu importe")}</option><option value="non">{tr("Non")}</option><option value="parfois">{tr("Parfois")}</option><option value="oui">{tr("Oui")}</option></select></div>
          <label className="ck"><input type="checkbox" checked={df.recv} onChange={(e) => upd("recv", e.target.checked)} /> {tr("Reçoit")}</label>
          <label className="ck"><input type="checkbox" checked={df.trav} onChange={(e) => upd("trav", e.target.checked)} /> {tr("Se déplace")}</label>
        </div>
      </aside>
    </div>
  );
}
