"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { GPATH, slug } from "@/lib/site";
import { profilePath } from "@/lib/profilUrl";
import GlobalSearch from "@/components/GlobalSearch";
import { CATS } from "@/lib/types";
import { nearestCity, coordsOf, km } from "@/lib/geo";
import { thumbUrl } from "@/lib/img";
import Ic from "./Ic";
import Heart from "./Heart";
import NearbyCities from "./NearbyCities";
import SearchBox from "./SearchBox";
import { useT, Tr } from "@/lib/i18n";
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

function Tile({ u, alt = "" }: { u: string; alt?: string }) {
  return <div>{u && <img src={thumbUrl(u)} referrerPolicy="no-referrer" alt={alt} width={640} height={550} loading="lazy" decoding="async" onError={(e) => { const el = e.currentTarget; if (!el.dataset.fb) { el.dataset.fb = "1"; el.src = u; } }} />}</div>;
}
function VipAd() {
  const { tr } = useT();
  return (
    <aside className="vipad" aria-label={tr("Passer en VIP")}>
      <span className="vipad-c" aria-hidden="true"><Ic n="crown" s={26} /></span>
      <b>{tr("Passe en VIP")}</b>
      <p>{tr("Plus de photos, tarifs et réseaux visibles, adresse personnalisée et une meilleure place dans les listes.")}</p>
      <Link className="btn" href="/contact?s=vip">{tr("Devenir VIP")} <span aria-hidden="true">→</span></Link>
    </aside>
  );
}
function UneBanner({ p, onOpen }: { p: Profile; onOpen: () => void }) {
  const { tr } = useT();
  return (
    <button type="button" className="une" onClick={onOpen} aria-label={tr("Voir le profil de {n}", { n: p.name })}>
      <i>{p.photos[0] && <img src={thumbUrl(p.photos[0])} referrerPolicy="no-referrer" alt="" decoding="async" onError={(e) => { const el = e.currentTarget; if (!el.dataset.fb) { el.dataset.fb = "1"; el.src = p.photos[0]; } }} />}</i>
      <span><small><Ic n="crown" s={14} /> {tr("À la une aujourd’hui")}</small><b>{p.name}</b><em>{p.city}</em></span>
      <u aria-hidden="true">→</u>
    </button>
  );
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
        <div className="mos">{pics.map((u, i) => <Tile key={i} u={u} alt={i === 0 ? `${p.name}${live ? "" : ", " + p.city}` : ""} />)}</div>
        {a && a.on && <span className={`avb${live ? " live" : ""}`}><i /><Ic n="clock" s={13} />{live ? tr("En direct") : tr("Dispo")}</span>}
        {lab(p) && <span className={`badge${live ? " live" : ""}`}>{lab(p)}</span>}
        {p.video && <span className="vid-ic"><Ic n="video" s={14} />{tr("vidéo")}</span>}
      </div>
      <div className="in">
        <div className="bdgs">{p.vip && <span className="vipb"><Ic n="crown" s={14} />VIP</span>}{isNew(p) && <span className="nwb"><Ic n="spark" s={14} />{tr("New")}</span>}{lab(p) && <span className={`badge${live ? " live" : ""}`}>{lab(p)}</span>}{a && a.on && <span className={`avb${live ? " live" : ""}`}><i /><Ic n="clock" s={13} />{live ? tr("En direct") : tr("Dispo")}</span>}{p.video && <span className="vid-ic"><Ic n="video" s={14} />{tr("vidéo")}</span>}</div>
        <div className="ln"><h2>{p.name}</h2>
          {p.verified && <span className="vf" role="img" aria-label={tr("Profil vérifié")} title={tr("Profil vérifié")}><Ic n="check" s={12} /></span>}
          <Heart id={p.id} /></div>
        <div className="meta"><Ic n="pin" s={15} />{live ? tr("En ligne") : p.city}{p.more?.length ? " " + tr("+ {n} ville(s)", { n: p.more.length }) : ""}</div>
        {a && (a.on
          ? <div className="meta avl on"><Ic n="clock" s={15} />{a.h24 ? tr("Disponible 24h/24, 7j/7") : tr("Disponible jusqu’à {u}", { u: a.until || "" })}</div>
          : <div className="meta"><Ic n="clock" s={15} />{tr("Indisponible")}{a.next ? tr(" · reprend {n}", { n: a.next }) : ""}</div>)}
        {p.street && <div className="meta"><Ic n="pin" s={15} />{p.zone ? tr("Rue · {z}", { z: p.zone }) : tr("Escorte de rue")}</div>}
        <div className="meta"><Ic n={CIC[p.genre] || "camera"} s={15} />{lab(p) ? lab(p) + " · " : ""}{p.photos.length} photos</div>
        {showTarif(p) ? <div className="meta"><Ic n="rose" s={15} />{p.tarif_30 ? <>30 min <b>{p.tarif_30}</b></> : null}{p.tarif_30 && p.tarif_60 ? " · " : ""}{p.tarif_60 ? <>1 h <b>{p.tarif_60}</b></> : null}</div> : null}
        {trip ? <div className="meta avl on"><Ic n="pin" s={15} />{trip.to !== trip.from ? tr("Passe du {a} au {b}", { a: dShort(trip.from), b: dShort(trip.to) }) : tr("Passe le {a}", { a: dShort(trip.from) })}</div> : null}
        <div className="tags">{p.specialties.slice(0, 2).map((t) => <span className="tag" key={t}>{cap(t)}</span>)}</div>
      </div>
    </article>
  );
}

/** Ville sans aucun profil : profils basés à moins de 20 km, et invitation à s'inscrire. */
function EmptyCityNearby({ profiles, city, onOpen }: { profiles: Profile[]; city: string; onOpen: (id: string) => void }) {
  const { tr } = useT(); const [out, setOut] = useState<Profile[] | null>(null);
  useEffect(() => {
    let dead = false; setOut(null);
    (async () => {
      const me = await coordsOf(city); if (!me) { if (!dead) setOut([]); return; }
      const cnt: Record<string, number> = {};
      profiles.forEach((p) => { if (p.genre !== "livecam") cnt[p.city] = (cnt[p.city] || 0) + 1; });
      const cand = Object.entries(cnt).sort((a, b) => b[1] - a[1]).slice(0, 120).map(([c]) => c);
      const dist: Record<string, number> = {};
      await Promise.all(cand.map(async (c) => { const k = await coordsOf(c); if (k) { const d = km(me, k); if (d <= 20) dist[c] = d; } }));
      const res = profiles.filter((p) => p.genre !== "livecam" && dist[p.city] !== undefined).sort((a, b) => dist[a.city] - dist[b.city] || Number(b.vip) - Number(a.vip)).slice(0, 12);
      if (!dead) setOut(res);
    })();
    return () => { dead = true; };
  }, [profiles, city]);
  return (
    <section className="emptynear" aria-label={tr("Profils à moins de 20 km")}>
      <div className="ejoin">
        <span className="ejico" aria-hidden="true"><Ic n="pin" s={30} /></span>
        <div className="ejtx">
          <h2>{tr("Tu es escort à {c} ?", { c: city })}</h2>
          <p>{tr("Inscris-toi gratuitement : ton profil sera le premier de la ville.")}</p>
        </div>
        <Link className="btn ejbtn" href="/rejoindre">{tr("Créer mon profil gratuit")} <span aria-hidden="true">→</span></Link>
      </div>
      {out && out.length > 0 && <>
        <h2 style={{ font: "600 20px var(--fd)", margin: "0 0 10px" }}>{tr("Profils à moins de 20 km de {c}", { c: city })}</h2>
        <div className="grid">{out.map((p, i) => <Card key={p.id} p={p} onOpen={() => onOpen(p.id)} delay={(i % 12) * 45} />)}</div>
      </>}
    </section>
  );
}

/** Recherche sans résultat : encart d'aide (retirer les filtres, ou s'inscrire). */
function NoResult({ onClear }: { onClear: () => void }) {
  const { tr } = useT();
  return (
    <div className="ejoin nores">
      <span className="ejico" aria-hidden="true"><Ic n="search" s={30} /></span>
      <div className="ejtx">
        <h2>{tr("Aucun profil ne correspond à ta recherche")}</h2>
        <p>{tr("Essaie d’autres mots, une autre ville, ou retire quelques filtres. Tu es escort ? Ton profil peut être le premier.")}</p>
      </div>
      <div className="ejbtns">
        <button type="button" className="btn ghost" onClick={onClear}>{tr("Tout effacer")}</button>
        <Link className="btn ejbtn" href="/rejoindre">{tr("Créer mon profil gratuit")} <span aria-hidden="true">→</span></Link>
      </div>
    </div>
  );
}

export default function Home({ profiles, initialType = "tous", initialCity = "", initialTag = "", h1 = "Tous les profils", intro = "", region = "", regions = {}, searchMode = false }: { searchMode?: boolean; profiles: Profile[]; initialType?: string; initialCity?: string; initialTag?: string; h1?: string; intro?: React.ReactNode; region?: string; regions?: Record<string, string> }) {
  const { tr } = useT(); const r = useRouter(); const sp = useSearchParams(); const { favs } = useFavs();
  const [type, setType] = useState(initialType); const [tag, setTag] = useState(sp.get("tag") || initialTag); const [q, setQ] = useState(sp.get("q") || "");
  const [sort, setSort] = useState("rec"); const [vid, setVid] = useState(false); const [ver, setVer] = useState(false); const [now, setNow] = useState(false); const [rue, setRue] = useState(false); const [visit, setVisit] = useState(0); const [tar, setTar] = useState(0); const [dur, setDur] = useState<30 | 60>(60);
  const [df, setDf] = useState(DF0); const upd = (k: keyof typeof DF0, v: string | boolean) => setDf((d) => ({ ...d, [k]: v }));
  const [view, setView] = useState<"cards" | "list" | "map">("cards"); const [shown, setShown] = useState(PAGE);
  const [near, setNear] = useState(""); const [geoBusy, setGeoBusy] = useState(false); const [geoMsg, setGeoMsg] = useState(""); const [geoHelp, setGeoHelp] = useState(false);
  const canNear = !initialCity && !sp.get("ville") && !sp.get("fav");
  const spCities = sp.getAll("ville").filter(Boolean).slice(0, 5); // plusieurs villes : ?ville=Lyon&ville=Paris
  const city = initialCity || spCities[0] || (canNear ? near : "");
  const cities = useMemo(() => (initialCity ? [initialCity] : spCities.length ? spCities : city ? [city] : []), [initialCity, spCities.join("|"), city]); // eslint-disable-line react-hooks/exhaustive-deps
  const inCities = (p: Profile) => cities.some((c) => cityList(p).includes(c));
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
    const h = () => { setType(initialType); setTag(initialTag); setQ(""); setSort("rec"); setVid(false); setVer(false); setNow(false); setRue(false); setTar(0); setVisit(0); setDur(60); setNear(""); setGeoMsg(""); setGeoHelp(false); setShown(PAGE); window.scrollTo({ top: 0, behavior: "smooth" }); };
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
  useEffect(() => { setShown(PAGE); }, [type, tag, q, sort, vid, ver, now, rue, tar, dur, visit, city, fav, df]);
  const chView = (v: "cards" | "list" | "map") => { setView(v); if (v !== "map") { try { localStorage.setItem("objectif_vue", v); } catch {} } };

  const list = useMemo(() => {
    const l = profiles.filter((p) => (type === "tous" ? p.genre !== "livecam" || fav : p.genre === type) && (!city || (visit ? !!visitOf(p, city, visit) : inCities(p))) && (!tag || p.specialties.some((t) => t.toLowerCase() === tag))
      && (!fav || favs.includes(p.id)) && inRange(p.age, df.amin, df.amax) && inRange(p.height_cm, df.hmin, df.hmax) && inRange(p.weight_kg, df.wmin, df.wmax)
      && (!df.eth || p.ethnicity === df.eth) && (!df.lang || (p.languages || []).includes(df.lang)) && (!df.hair || p.hair === df.hair) && (!df.eyes || p.eyes === df.eyes) && (!df.bra || p.bra === df.bra)
      && (!df.smk || p.smoker === df.smk) && (!df.drk || p.drinker === df.drk) && (!df.recv || p.receives) && (!df.trav || p.travels)
      && (!vid || p.video) && (!ver || p.verified) && (!rue || p.street) && (!now || avail(p)?.on) && (!tar || (showTarif(p) && (dur === 30 ? p.tarif_30 : p.tarif_60) ? (tar === 999 ? (dur === 30 ? p.tarif_30 : p.tarif_60)! > (dur === 30 ? 150 : 300) : (dur === 30 ? p.tarif_30 : p.tarif_60)! <= tar) : false))
      && (!q || (p.name + " " + cityList(p).join(" ") + " " + p.specialties.join(" ") + " " + p.bio.replace(/[*#]/g, "") + " " + lab(p)).toLowerCase().includes(q.toLowerCase())));
    l.sort((a, b) => sort === "az" ? a.name.localeCompare(b.name) : sort === "media" ? b.photos.length - a.photos.length : sort === "tarif" ? ((showTarif(a) && (dur === 30 ? a.tarif_30 : a.tarif_60)) || 1e9) - ((showTarif(b) && (dur === 30 ? b.tarif_30 : b.tarif_60)) || 1e9) : sort === "vus" ? (b.views || 0) - (a.views || 0) : +new Date(b.bumped_at || b.created_at) - +new Date(a.bumped_at || a.created_at));
    l.sort((a, b) => +b.vip - +a.vip);
    return l;
  }, [profiles, type, tag, q, sort, vid, ver, now, rue, tar, dur, visit, city, cities, fav, favs, df]); // eslint-disable-line react-hooks/exhaustive-deps
  const [une, setUne] = useState<Profile | null>(null); // « À la une » : un VIP du contexte (ville / genre / spécialité), change chaque jour
  useEffect(() => {
    const pool = profiles.filter((x) => x.vip && (type === "tous" ? x.genre !== "livecam" : x.genre === type) && (!tag || x.specialties.some((t) => t.toLowerCase() === tag)) && (!city || inCities(x))).sort((a, b) => a.id < b.id ? -1 : 1);
    if (!pool.length || searchMode || fav) { setUne(null); return; }
    const day = Math.floor((Date.now() + 3600000) / 86400000); let h = 0; for (const c of `${type}|${tag}|${cities.join(",")}`) h = (h * 31 + c.charCodeAt(0)) >>> 0;
    setUne(pool[(day + h) % pool.length]);
  }, [profiles, type, tag, cities, searchMode, fav]); // eslint-disable-line react-hooks/exhaustive-deps
  const [adAt, setAdAt] = useState(-1); // pub VIP : place aleatoire parmi les profils standard (choisie apres le rendu serveur)
  useEffect(() => {
    const ids = list.slice(0, 12).map((x, i) => (x.vip ? -1 : i)).filter((i) => i >= 0);
    setAdAt(ids.length > 1 ? ids[1 + Math.floor(Math.random() * (ids.length - 1))] : -1);
  }, [list.length, view]); // eslint-disable-line react-hooks/exhaustive-deps

  const mapCities = useMemo(() => { const by: Record<string, { city: string; n: number; p: { id: string; name: string; sub: string; g: string; img: string }[] }> = {}; list.filter((p) => p.genre !== "livecam").forEach((p) => { const c = (by[p.city] ||= { city: p.city, n: 0, p: [] }); c.n++; if (c.p.length < 14) c.p.push({ id: p.id, name: p.name, sub: lab(p), g: p.genre, img: p.photos[0] || "" }); }); return Object.values(by).sort((a, b) => b.n - a.n); }, [list]);
  const inCity = useMemo(() => (city ? profiles.filter((p) => inCities(p)) : profiles), [profiles, cities]); // eslint-disable-line react-hooks/exhaustive-deps
  const cnt = (t: string) => (t === "tous" ? inCity.length : inCity.filter((p) => p.genre === t).length);
  const tags = useMemo(() => { const tc: Record<string, number> = {}; inCity.filter((p) => type === "tous" || p.genre === type).forEach((p) => p.specialties.forEach((t) => { t = t.toLowerCase(); tc[t] = (tc[t] || 0) + 1; })); return Object.entries(tc).sort((x, y) => y[1] - x[1] || x[0].localeCompare(y[0])).slice(0, 8); }, [inCity, type]);
  useEffect(() => { if (tag && !tags.some(([t]) => t === tag)) setTag(""); }, [tags, tag]);
  const nNow = useMemo(() => inCity.filter((p) => (type === "tous" ? p.genre !== "livecam" : p.genre === type) && avail(p)?.on).length, [inCity, type]);
  const sidx = useMemo(() => { // index de la recherche du panneau de droite (mêmes suggestions que le menu du haut)
    const cc: Record<string, number> = {}, tc: Record<string, number> = {};
    profiles.forEach((p) => { if (p.genre !== "livecam") cc[p.city] = (cc[p.city] || 0) + 1; (p.specialties || []).forEach((x) => { const k = x.toLowerCase(); tc[k] = (tc[k] || 0) + 1; }); });
    return { c: Object.entries(cc).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "fr")) as [string, number][], t: Object.entries(tc).sort((a, b) => b[1] - a[1]) as [string, number][], p: profiles.map((p) => ({ id: p.id, name: p.name, sub: [lab(p), p.city].filter(Boolean).join(" · ") })) };
  }, [profiles]);
  const isHome = usePathname() === "/"; const [topAll, setTopAll] = useState(false); const [sheet, setSheet] = useState<"" | "open" | "closing">("");
  const msRef = useRef<HTMLButtonElement>(null); const [stick, setStick] = useState(false); const [navH, setNavH] = useState(60); // bouton Rechercher flottant sous le menu (mobile) quand le vrai bouton est sorti de l'écran
  useEffect(() => {
    const el = msRef.current; if (!el || searchMode || !("IntersectionObserver" in window)) { setStick(false); return; }
    const io = new IntersectionObserver((es) => { const e = es[0]; setStick(!e.isIntersecting && e.boundingClientRect.top < 0); setNavH(Math.round(document.querySelector(".nav")?.getBoundingClientRect().height || 60)); });
    io.observe(el); return () => io.disconnect();
  }, [searchMode]);
  const [pend, setPend] = useState<string[]>([]); // ville choisie dans la fenêtre de recherche, appliquée au clic sur « Voir les résultats »
  const closeSheet = () => { setPend([]); setSheet("closing"); setTimeout(() => setSheet(""), 260); };
  const applySheet = () => { const l = pend; setPend([]); setSheet("closing"); setTimeout(() => setSheet(""), 260); if (l.length) setCities(l); };
  useEffect(() => { // la fenêtre suit la partie visible de l'écran (le clavier du téléphone la réduit au lieu de la faire sortir du cadre)
    if (!sheet) return; const vv = window.visualViewport; let raf = 0, last = ""; const fit = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(() => { if (!vv) return; const h = Math.round(vv.height), t = Math.round(vv.offsetTop), k = h + "/" + t; if (k === last) return; last = k; const el = document.documentElement; el.style.setProperty("--vvh", h + "px"); el.style.setProperty("--vvt", t + "px"); }); }; fit(); vv?.addEventListener("resize", fit); vv?.addEventListener("scroll", fit);
    return () => { vv?.removeEventListener("resize", fit); vv?.removeEventListener("scroll", fit); document.documentElement.style.removeProperty("--vvh"); document.documentElement.style.removeProperty("--vvt"); };
  }, [sheet === "" ? "" : "on"]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (!sheet) return; document.body.style.overflow = "hidden"; const k = (e: KeyboardEvent) => { if (e.key === "Escape") closeSheet(); }; window.addEventListener("keydown", k); return () => { document.body.style.overflow = ""; window.removeEventListener("keydown", k); }; }, [sheet === "" ? "" : "on"]); // eslint-disable-line react-hooks/exhaustive-deps
  const top = useMemo(() => { const cc: Record<string, number> = {}; profiles.filter((p) => (type === "tous" ? p.genre !== "livecam" : p.genre === type)).forEach((p) => cityList(p).forEach((c) => { if (!region || regions[c] === region) cc[c] = (cc[c] || 0) + 1; })); return Object.entries(cc).sort((x, y) => y[1] - x[1] || x[0].localeCompare(y[0], "fr")).slice(0, isHome ? 1000 : 9); }, [profiles, type, region, regions, isHome]);
  const hl = useMemo(() => profiles.filter((p) => (type === "tous" ? p.genre !== "livecam" : p.genre === type) && (!tag || p.specialties.some((x) => x.toLowerCase() === tag)) && (!city || inCities(p))).sort((a, b) => +b.vip - +a.vip || (b.views || 0) + 5 * (b.favs || 0) - (a.views || 0) - 5 * (a.favs || 0) || +new Date(b.created_at) - +new Date(a.created_at)).slice(0, 10), [profiles, type, tag, cities]); // eslint-disable-line react-hooks/exhaustive-deps

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
  const open = (id: string) => { const pp = profiles.find((x) => x.id === id); r.push(pp ? profilePath(pp) : `/profil/${id}`); };
  const setCities = (l: string[]) => r.push(l.length ? `/${searchMode ? "recherche" : ""}?${l.map((c) => "ville=" + encodeURIComponent(c)).join("&")}` : searchMode ? "/recherche" : "/");
  const setCity = (c: string) => r.push(c ? `/${searchMode ? "recherche" : ""}?ville=${encodeURIComponent(c)}` : searchMode ? "/recherche" : "/");
  const clear = () => { setType("tous"); setTag(""); setQ(""); setSort("rec"); setVid(false); setVer(false); setNow(false); setRue(false); setTar(0); setVisit(0); setDur(60); setDf(DF0); r.push(searchMode ? "/recherche" : "/"); };

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
            <i className={p.vip ? "vip" : ""}>{p.photos[0] && <img src={thumbUrl(p.photos[0])} referrerPolicy="no-referrer" alt={p.genre === "livecam" ? p.name : `${p.name}, ${CATS[p.genre] || "profil"} à ${p.city}`} decoding="async" onError={(e) => { const el = e.currentTarget; if (!el.dataset.fb) { el.dataset.fb = "1"; el.src = p.photos[0]; } }} />}{p.vip && <em><Ic n="crown" s={14} /></em>}</i>
            <b>{p.name}</b><small>{lab(p) ? lab(p) + " · " : ""}{p.city}</small></button>)}</div>
        </section>}
        {!searchMode && <section className={`panel top${isHome ? " topx" : ""}${topAll ? " all" : ""}`} aria-labelledby="topH"><h2 id="topH"><Ic n="star" s={20} />Top <span className="t10">{isHome ? 18 : 9}</span><span className="t6">{isHome ? 12 : 6}</span><span className="t3">3</span> {region || "France"}</h2>
          <ol>{top.map(([c, n], i) => <li key={c}><Link className={city === c ? "on" : ""} href={city === c ? (type === "tous" ? "/" : `/genre/${GPATH[type]}`) : type === "tous" ? `/ville/${slug(c)}` : `/genre/${GPATH[type]}/${slug(c)}`}><span className="rk">{i + 1}</span>{c}<span className="n">{n} profil{n > 1 ? "s" : ""}</span></Link></li>)}</ol>{(isHome && (canNear || top.length > 6)) && <div className="topbtns">{isHome && top.length > 6 && <button type="button" className="btn ghost topmore" aria-expanded={topAll} onClick={() => setTopAll(!topAll)}>{topAll ? tr("Voir moins de villes") : tr("Voir toutes les villes ({n})", { n: top.length })}</button>}{isHome && canNear && <button type="button" className="btn topnear" onClick={() => { locate(); document.getElementById("topH")?.scrollIntoView({ block: "nearest" }); }} disabled={geoBusy}>📍 {geoBusy ? tr("Localisation…") : tr("Villes près de moi")}</button>}</div>}<button type="button" ref={msRef} className="btn msbtn" onClick={() => setSheet("open")}><Ic n="search" s={22} />{tr("Rechercher")}</button></section>}
        {stick && !sheet && <button type="button" className="msfloat" style={{ top: `calc(env(safe-area-inset-top, 0px) + ${navH + 8}px)` }} onClick={() => setSheet("open")} aria-label={tr("Rechercher")}><Ic n="search" s={20} />{tr("Rechercher")}</button>}
        {sheet && <div className={`sheetbg${sheet === "closing" ? " out" : ""}`} onClick={closeSheet} />}
        <div className={`panel msearch${searchMode ? " on" : ""}${sheet ? ` sheet ${sheet}` : ""}`} id="recherche" role={sheet ? "dialog" : undefined} aria-modal={sheet ? true : undefined} aria-label={sheet ? tr("Rechercher") : undefined}>{sheet && <div className="sheethd"><i aria-hidden="true" /><b>{tr("Rechercher")}</b><button type="button" className="x" aria-label={tr("Fermer")} onClick={closeSheet}>✕</button></div>}<div className={sheet ? "sheetbody" : "sbc"}>{(searchMode || !!sheet) && <div className="dsearch"><h2><Ic n="search" s={20} />{tr("Rechercher")}</h2><SearchBox profiles={profiles} q={q} setQ={setQ} onCity={(c) => { if (sheet) { setPend((cur) => (cur.includes(c) || cur.length >= 5 ? cur : [...cur, c])); (document.activeElement as HTMLElement | null)?.blur(); } else setCity(c); }} onProfile={(id) => { if (sheet) { setPend([]); setSheet(""); } open(id); }} onTag={(t) => setTag(t)} /></div>}{sheet && pend.length > 0 && <div className="pendl">{pend.map((c) => <p key={c} className="pendc"><span>📍 {c}</span><button type="button" aria-label={tr("Retirer")} onClick={() => setPend((cur) => cur.filter((x) => x !== c))}>✕</button></p>)}</div>}{(searchMode || !!sheet) && <><h2 className="fh"><Ic n="sliders" s={20} />{tr("Filtres")}<button className="clear" onClick={clear}>{tr("Tout effacer")}</button></h2>
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
</>}
          </div>
          {sheet && <div className="sheetft"><button type="button" className="btn" onClick={applySheet}>{tr("Voir les résultats")}</button></div>}
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
        {cities.length > 1 && <p className="note multic">📍 {cities.join(" · ")} <Link href={searchMode ? "/recherche" : "/"}>{tr("Tout effacer")}</Link></p>}
        {view !== "map" && <div className="nowbar">{(nNow > 0 || now) && <button type="button" className={`nowchip${now ? " on" : ""}`} aria-pressed={now} onClick={() => setNow(!now)}><i aria-hidden="true" />{now ? tr("Disponibles maintenant · afficher tous les profils") : tr("Disponibles maintenant")}<b>{nNow}</b></button>}<button type="button" className={`nowchip qf${vid ? " on" : ""}`} aria-pressed={vid} onClick={() => setVid(!vid)}><Ic n="video" s={16} />{tr("Avec vidéo de présentation")}</button>{(rue || profiles.some((x) => x.street)) && <button type="button" className={`nowchip qf${rue ? " on" : ""}`} aria-pressed={rue} onClick={() => setRue(!rue)}><Ic n="pin" s={16} />{tr("Escorte de rue")}</button>}<button type="button" className={`nowchip qf${ver ? " on" : ""}`} aria-pressed={ver} onClick={() => setVer(!ver)}><Ic n="check" s={16} />{tr("Profils vérifiés uniquement")}</button></div>}
        {une && view !== "map" && <UneBanner p={une} onOpen={() => open(une.id)} />}
        <div className={`grid${view === "list" ? " lst" : ""}`} hidden={view === "map"}>
          {list.length ? list.slice(0, shown).flatMap((p, i) => { const c = <Card key={p.id} p={p} onOpen={() => open(p.id)} delay={(i % PAGE) * 45} trip={visit && city ? visitOf(p, city, visit) : undefined} />; return i === adAt ? [c, <VipAd key="vipad" />] : [c]; })
            : <div className="empty">{fav ? tr("Aucun favori pour le moment. Touchez le cœur d’un profil pour le garder ici.") : profiles.length ? (city && !profiles.some((p) => cityList(p).includes(city)) ? tr("Aucun profil à {c} pour le moment. Sois le premier : crée ton profil !", { c: city }) : <NoResult onClear={clear} />) : tr("Aucun profil pour le moment. Sois le premier : clique sur « Créer mon profil ».")}</div>}
        </div>
        {view !== "map" && !!city && cities.length < 2 && !fav && profiles.length > 0 && !profiles.some((p) => cityList(p).includes(city)) && <EmptyCityNearby profiles={profiles} city={city} onOpen={open} />}
        {view !== "map" && shown < list.length && <div className="more" ref={sentinel}><i /><i /><i /><span>{tr("{n} profils à venir", { n: list.length - shown })}</span><button className="btn ghost" type="button" onClick={() => setShown((s) => s + PAGE)}>{tr("Voir plus")}</button></div>}
      </main>

      <aside className="aside" aria-label="Filtres">
        {!searchMode && <div className="panel hlp"><h2><Ic n="star" s={20} />Mis en avant{type !== "tous" ? " · " + tr(ITEMS.find((i) => i[0] === type)?.[1] || "") : ""}{tag ? " · " + cap(tag) : ""}{city ? " · " + city : ""}</h2>
          <div>{hl.slice(0, 3).map((p) => <button key={p.id} className="hl" onClick={() => open(p.id)}><i style={p.photos[0] ? { backgroundImage: `url('${p.photos[0]}')` } : undefined} /><span><b>{p.name}</b><small>{lab(p) ? lab(p) + " · " : ""}{p.city}</small></span></button>)}</div></div>}
        <div className="panel dpanel"><div className="dsearch"><h2><Ic n="search" s={20} />{tr("Rechercher")}</h2><GlobalSearch index={sidx} onGo={(u) => r.push(u)} /></div>
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
