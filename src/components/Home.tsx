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
import { useFavs } from "@/lib/favs";
import { avail, tripsOf } from "@/lib/avail";
import { CIC, cap, cityList, isNew, lab, Profile } from "@/lib/types";

const PAGE = 10;
const ITEMS: [string, string, string][] = [["tous", "Tous les profils", "grid"], ["fille", "Filles", "fille"], ["homme", "Hommes", "homme"], ["trans", "Trans", "trans"], ["livecam", "Livecam", "live"]];

function Tile({ u }: { u: string }) {
  return <div>{u && <img src={thumbUrl(u)} alt="" loading="lazy" decoding="async" onError={(e) => { const el = e.currentTarget; if (!el.dataset.fb) { el.dataset.fb = "1"; el.src = u; } }} />}</div>;
}
function Card({ p, onOpen, delay }: { p: Profile; onOpen: () => void; delay?: number }) {
  const a = avail(p); const live = p.genre === "livecam"; const pics = p.photos.slice(0, 3);
  while (pics.length < 3) pics.push(p.photos[0] || "");
  return (
    <article className={`card${p.vip ? " isvip" : ""}${live ? " live" : ""}${a && !a.on ? " off" : ""}${delay !== undefined ? " pop" : ""}`} style={delay !== undefined ? { animationDelay: delay + "ms" } : undefined}
      tabIndex={0} aria-label={`Voir le profil de ${p.name}`} onClick={onOpen} onKeyDown={(e) => e.key === "Enter" && onOpen()}>
      <div className="cover">
        <div className="tr"><span className="phb" title="Nombre de photos"><Ic n="camera" s={14} />{p.photos.length}</span>{p.vip && <span className="vipb"><Ic n="crown" s={14} />VIP</span>}</div>
        {isNew(p) && <span className="nwb" title="Profil créé il y a moins d’un mois"><Ic n="spark" s={14} />New</span>}
        <div className="mos">{pics.map((u, i) => <Tile key={i} u={u} />)}</div>
        {a && a.on && <span className={`avb${live ? " live" : ""}`}><i /><Ic n="clock" s={13} />{live ? "En direct" : "Dispo"}</span>}
        {lab(p) && <span className={`badge${live ? " live" : ""}`}>{lab(p)}</span>}
        {p.video && <span className="vid-ic"><Ic n="video" s={14} />vidéo</span>}
      </div>
      <div className="in">
        <div className="ln"><h3>{p.name}</h3>
          {p.verified && <span className="vf" role="img" aria-label="Profil vérifié" title="Profil vérifié"><Ic n="check" s={12} /></span>}
          <Heart id={p.id} /></div>
        <div className="meta"><Ic n="pin" s={15} />{p.city}{p.more?.length ? ` + ${p.more.length} ville${p.more.length > 1 ? "s" : ""}` : ""}</div>
        {a && (a.on
          ? <div className="meta avl on"><Ic n="clock" s={15} />{a.h24 ? "Disponible 24h/24, 7j/7" : "Disponible jusqu’à " + a.until}</div>
          : <div className="meta"><Ic n="clock" s={15} />Indisponible{a.next ? " · reprend " + a.next : ""}</div>)}
        <div className="meta"><Ic n={CIC[p.genre] || "camera"} s={15} />{lab(p) ? lab(p) + " · " : ""}{p.photos.length} photos</div>
        {(p.tarif_30 || p.tarif_60) ? <div className="meta"><Ic n="rose" s={15} />{p.tarif_30 ? <>30 min <b>{p.tarif_30}</b></> : null}{p.tarif_30 && p.tarif_60 ? " · " : ""}{p.tarif_60 ? <>1 h <b>{p.tarif_60}</b></> : null}</div> : null}
        <div className="tags">{p.specialties.slice(0, 2).map((t) => <span className="tag" key={t}>{cap(t)}</span>)}</div>
      </div>
    </article>
  );
}

export default function Home({ profiles, initialType = "tous", initialCity = "", h1 = "Tous les profils", intro = "" }: { profiles: Profile[]; initialType?: string; initialCity?: string; h1?: string; intro?: string }) {
  const r = useRouter(); const sp = useSearchParams(); const { favs } = useFavs();
  const [type, setType] = useState(initialType); const [tag, setTag] = useState(""); const [q, setQ] = useState("");
  const [sort, setSort] = useState("rec"); const [vid, setVid] = useState(false); const [ver, setVer] = useState(false); const [now, setNow] = useState(false); const [tar, setTar] = useState(0); const [dur, setDur] = useState<30 | 60>(60);
  const [view, setView] = useState<"cards" | "list">("cards"); const [shown, setShown] = useState(PAGE);
  const [near, setNear] = useState(""); const [geoBusy, setGeoBusy] = useState(false); const [geoMsg, setGeoMsg] = useState(""); const [geoHelp, setGeoHelp] = useState(false);
  const canNear = !initialCity && !sp.get("ville") && !sp.get("fav");
  const city = initialCity || sp.get("ville") || (canNear ? near : "");
  const allCities = useMemo(() => Array.from(new Set(profiles.flatMap(cityList))), [profiles]);
  const locate = (auto = false) => {
    if (!navigator.geolocation) { setGeoMsg("La localisation n’est pas disponible sur cet appareil."); return; }
    setGeoBusy(true); setGeoMsg(""); setGeoHelp(false);
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const c = await nearestCity(pos.coords.latitude, pos.coords.longitude, allCities);
      setGeoBusy(false);
      if (c) { setNear(c); try { localStorage.setItem("objectif_pm", JSON.stringify({ city: c, t: Date.now() })); } catch {} }
      else if (!auto) setGeoMsg("Aucun créateur près de toi pour le moment. Essaie une autre ville dans le Top 10.");
    }, (err) => {
      setGeoBusy(false); if (auto) return;
      if (err.code === 1) { setGeoMsg("La localisation est bloquée pour ce site. Autorise-la dans les réglages de ton appareil, puis réessaie."); setGeoHelp(true); }
      else if (err.code === 3) setGeoMsg("La localisation a pris trop de temps. Réessaie, ou choisis ta ville dans le Top 10.");
      else setGeoMsg("Position introuvable. Choisis ta ville dans le Top 10.");
    }, { timeout: 10000, maximumAge: 600000 });
  };
  const pm = sp.get("pm");
  useEffect(() => { if (pm && canNear) { try { localStorage.removeItem("objectif_pm"); } catch {} locate(); } }, [pm]);
  const stopNear = () => { setNear(""); try { localStorage.setItem("objectif_pm", JSON.stringify({ off: true })); } catch {} };
  useEffect(() => { // précharge la dernière ville connue, puis la rafraîchit si la localisation est déjà autorisée
    if (!canNear) return;
    let saved: any = null; try { saved = JSON.parse(localStorage.getItem("objectif_pm") || "null"); } catch {}
    if (saved?.off) return;
    if (saved?.city && allCities.includes(saved.city)) setNear(saved.city);
    (async () => { try { const st = await (navigator as any).permissions?.query({ name: "geolocation" }); if (st?.state === "granted") locate(true); } catch {} })();
  }, [canNear, allCities.length]); const fav = !!sp.get("fav");
  useEffect(() => { try { if (localStorage.getItem("objectif_vue") === "list") setView("list"); } catch {} }, []);
  useEffect(() => { setShown(PAGE); }, [type, tag, q, sort, vid, ver, now, tar, dur, city, fav]);
  const chView = (v: "cards" | "list") => { setView(v); try { localStorage.setItem("objectif_vue", v); } catch {} };

  const list = useMemo(() => {
    const l = profiles.filter((p) => (type === "tous" || p.genre === type) && (!city || cityList(p).includes(city)) && (!tag || p.specialties.some((t) => t.toLowerCase() === tag))
      && (!fav || favs.includes(p.id)) && (!vid || p.video) && (!ver || p.verified) && (!now || avail(p)?.on) && (!tar || ((dur === 30 ? p.tarif_30 : p.tarif_60) ? (tar === 999 ? (dur === 30 ? p.tarif_30 : p.tarif_60)! > (dur === 30 ? 150 : 300) : (dur === 30 ? p.tarif_30 : p.tarif_60)! <= tar) : false))
      && (!q || (p.name + " " + cityList(p).join(" ") + " " + p.specialties.join(" ") + " " + p.bio + " " + lab(p)).toLowerCase().includes(q.toLowerCase())));
    l.sort((a, b) => sort === "az" ? a.name.localeCompare(b.name) : sort === "media" ? b.photos.length - a.photos.length : sort === "tarif" ? ((dur === 30 ? a.tarif_30 : a.tarif_60) || 1e9) - ((dur === 30 ? b.tarif_30 : b.tarif_60) || 1e9) : sort === "vus" ? (b.views || 0) - (a.views || 0) : +new Date(b.created_at) - +new Date(a.created_at));
    l.sort((a, b) => +b.vip - +a.vip);
    return l;
  }, [profiles, type, tag, q, sort, vid, ver, now, tar, dur, city, fav, favs]);

  const inCity = useMemo(() => (city ? profiles.filter((p) => cityList(p).includes(city)) : profiles), [profiles, city]);
  const cnt = (t: string) => (t === "tous" ? inCity.length : inCity.filter((p) => p.genre === t).length);
  const tags = useMemo(() => { const tc: Record<string, number> = {}; inCity.filter((p) => type === "tous" || p.genre === type).forEach((p) => p.specialties.forEach((t) => { t = t.toLowerCase(); tc[t] = (tc[t] || 0) + 1; })); return Object.entries(tc).sort((x, y) => y[1] - x[1] || x[0].localeCompare(y[0])).slice(0, 8); }, [inCity, type]);
  useEffect(() => { if (tag && !tags.some(([t]) => t === tag)) setTag(""); }, [tags, tag]);
  const top = useMemo(() => { const cc: Record<string, number> = {}; profiles.forEach((p) => cityList(p).forEach((c) => (cc[c] = (cc[c] || 0) + 1))); return Object.entries(cc).sort((x, y) => y[1] - x[1] || x[0].localeCompare(y[0], "fr")).slice(0, 10); }, [profiles]);
  const hl = useMemo(() => profiles.filter((p) => (type === "tous" || p.genre === type) && (!tag || p.specialties.some((x) => x.toLowerCase() === tag)) && (!city || cityList(p).includes(city))).sort((a, b) => +b.vip - +a.vip || +new Date(b.created_at) - +new Date(a.created_at)).slice(0, 3), [profiles, type, tag, city]);

  const sentinel = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = sentinel.current; if (!el || shown >= list.length) return;
    const io = new IntersectionObserver((es) => { if (es[0].isIntersecting) setShown((s) => Math.min(s + PAGE, list.length)); }, { rootMargin: "600px" });
    io.observe(el); return () => io.disconnect();
  }, [shown, list.length]);
  const open = (id: string) => r.push(`/profil/${id}`);
  const setCity = (c: string) => r.push(c ? `/?ville=${encodeURIComponent(c)}` : "/");
  const clear = () => { setType("tous"); setTag(""); setQ(""); setSort("rec"); setVid(false); setVer(false); setNow(false); setTar(0); setDur(60); r.push("/"); };

  return (
    <div className="shell gut" id="shell">
      <aside className="side" aria-label="Catégories">
        <div className="panel tip"><svg className="ic" viewBox="0 0 24 24" width="40" height="40" aria-hidden="true"><path d="M12 3l7.500 2.800v5.700c0 4.500-3 8.200-7.500 9.500-4.500-1.300-7.500-5-7.500-9.500V5.800z" /><path d="M8.800 12.200l2.300 2.300 4.200-4.600" /></svg><span>Site fait par et pour les pros, <b>50 % reversés aux associations</b></span></div>
        <div className="panel">
          <div>{ITEMS.map(([k, v, i]) => <Link key={k} className={`si${type === k && !fav ? " on" : ""}`} href={k === "tous" ? (city ? `/ville/${slug(city)}` : "/") : city ? `/genre/${GPATH[k]}/${slug(city)}` : `/genre/${GPATH[k]}`}><Ic n={i} />{v}<span className="n">{cnt(k)}</span></Link>)}</div>
          <hr className="sep" />
          <h2><Ic n="tag" s={20} />Spécialités</h2>
          <div>{tags.map(([t, n]) => <button key={t} className={`si${tag === t ? " on" : ""}`} onClick={() => setTag(tag === t ? "" : t)}>{cap(t)}<span className="n">{n}</span></button>)}</div>
        </div>
      </aside>

      <main style={{ minWidth: 0 }}>
        <section className="panel top" aria-labelledby="topH"><h2 id="topH"><Ic n="star" s={20} />Top <span className="t10">10</span><span className="t3">3</span> des villes</h2>
          <ol>{top.map(([c, n], i) => <li key={c}><Link className={city === c ? "on" : ""} href={city === c ? "/" : `/ville/${slug(c)}`}><span className="rk">{i + 1}</span>{c}<span className="n">{n} profil{n > 1 ? "s" : ""}</span></Link></li>)}</ol></section>
        <div className="panel msearch"><h2><Ic n="search" s={20} />Rechercher</h2>
          <div className="sp" style={{ maxWidth: "none", margin: 0 }}><input type="search" placeholder="Nom, style, ville…" aria-label="Rechercher" value={q} onChange={(e) => setQ(e.target.value)} /><Ic n="search" /></div>
          <h2 style={{ marginTop: 18 }}><Ic n="sliders" s={20} />Filtres<button className="clear" onClick={clear}>Tout effacer</button></h2>
          <div className="row"><span>Profil</span><select aria-label="Profil" value={type} onChange={(e) => setType(e.target.value)}><option value="tous">Tous les profils</option><option value="fille">Filles</option><option value="homme">Hommes</option><option value="trans">Trans</option><option value="livecam">Livecam</option></select></div>
          <div className="row"><span>Trier par</span><select aria-label="Tri" value={sort} onChange={(e) => setSort(e.target.value)}><option value="rec">Plus récents</option><option value="az">Nom (A à Z)</option><option value="tarif">Tarif croissant (selon la durée)</option><option value="vus">Plus vus (30 jours)</option><option value="media">Plus de contenus</option></select></div>
          <div className="row"><span>Durée</span><select aria-label="Durée" value={dur} onChange={(e) => { setDur(Number(e.target.value) as 30 | 60); setTar(0); }}><option value={60}>1 heure</option><option value={30}>30 minutes</option></select></div>
          <div className="row"><span>Tarif maximum 🌹</span><select aria-label="Tarif maximum" value={tar} onChange={(e) => setTar(Number(e.target.value))}><option value={0}>Tous les tarifs</option>{(dur === 30 ? [50, 80, 100, 150] : [100, 150, 200, 300]).map((v) => <option key={v} value={v}>{v} maximum</option>)}<option value={999}>Plus de {dur === 30 ? 150 : 300}</option></select></div>
          <label className="ck"><input type="checkbox" checked={vid} onChange={(e) => setVid(e.target.checked)} /> Avec vidéo de présentation</label>
          <label className="ck"><input type="checkbox" checked={ver} onChange={(e) => setVer(e.target.checked)} /> Profils vérifiés uniquement</label>
          <label className="ck"><input type="checkbox" checked={now} onChange={(e) => setNow(e.target.checked)} /> Disponibles maintenant</label>
        </div>
        <div className="mchips">{ITEMS.map(([k, v]) => <button key={k} className="chip" aria-pressed={type === k} onClick={() => setType(k)}>{v}</button>)}</div>
        <div className="sh"><h1><Ic n="star" s={22} />{h1}</h1><span className="cnt0" aria-live="polite">{list.length} profil{list.length > 1 ? "s" : ""}</span>
          <button type="button" className="btn ghost" onClick={() => locate()} disabled={geoBusy} style={{ marginLeft: "auto" }}>📍 {geoBusy ? "Localisation…" : "Près de moi"}</button>
          <div className="vsw" role="group" aria-label="Affichage">
            <button type="button" aria-pressed={view === "cards"} title="Affichage en cartes" aria-label="Cartes" onClick={() => chView("cards")}><Ic n="grid" /></button>
            <button type="button" aria-pressed={view === "list"} title="Affichage en liste" aria-label="Liste" onClick={() => chView("list")}>
              <svg className="ic" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><rect x="3" y="4" width="18" height="6" rx="2" /><rect x="3" y="14" width="18" height="6" rx="2" /></svg></button>
          </div>
        </div>
        {geoMsg && <p className="note" role="alert" style={{ margin: "0 0 12px", color: "var(--btn)", fontWeight: 700 }}>{geoMsg}</p>}
        {geoHelp && <div className="panel" style={{ margin: "0 0 12px", padding: "12px 16px" }}>
          <b>Comment autoriser la localisation</b>
          <ul style={{ margin: "6px 0 8px", paddingLeft: 18 }}>
            <li><b>iPhone (Safari) :</b> Réglages → Confidentialité et sécurité → Service de localisation → Safari (sites web) → « Lorsque l’app est active ». Ou dans Safari : bouton « aA » à gauche de l’adresse → Réglages du site web → Localisation → Autoriser.</li>
            <li><b>Android (Chrome) :</b> icône à gauche de l’adresse → Autorisations → Localisation → Autoriser. Vérifie aussi que la localisation du téléphone est activée.</li>
            <li><b>Ordinateur :</b> clique sur le cadenas à gauche de l’adresse → Localisation → Autoriser, puis recharge la page.</li>
          </ul>
          <button type="button" className="btn" onClick={() => locate()}>Réessayer</button>
        </div>}
        {canNear && near && <div className="panel" style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap", margin: "0 0 12px", padding: "10px 16px" }}>
          <span>📍 Profils près de toi : <b>{near}</b></span><button type="button" className="btn ghost" onClick={stopNear}>Voir tous les profils</button></div>}
        {city && <NearbyCities profiles={profiles} city={city} type={type} />}
        {intro && <p className="note" style={{ margin: "0 0 12px" }}>{intro}</p>}
        <div className={`grid${view === "list" ? " lst" : ""}`}>
          {list.length ? list.slice(0, shown).map((p, i) => <Card key={p.id} p={p} onOpen={() => open(p.id)} delay={i >= PAGE ? ((i - PAGE) % PAGE) * 45 : undefined} />)
            : <div className="empty">{fav ? "Aucun favori pour le moment. Touchez le cœur d’un profil pour le garder ici." : profiles.length ? (city && !profiles.some((p) => cityList(p).includes(city)) ? `Aucun profil à ${city} pour le moment. Sois le premier : crée ton profil !` : "Aucun profil ne correspond à votre recherche.") : "Aucun profil pour le moment. Sois le premier : clique sur « Créer mon profil »."}</div>}
        </div>
        {shown < list.length && <div className="more" ref={sentinel}><i /><i /><i /><span>{list.length - shown} profils à venir</span><button className="btn ghost" type="button" onClick={() => setShown((s) => s + PAGE)}>Voir plus</button></div>}
      </main>

      <aside className="aside" aria-label="Filtres">
        <div className="panel"><h2><Ic n="star" s={20} />Mis en avant{type !== "tous" ? " · " + (ITEMS.find((i) => i[0] === type)?.[1] || "") : ""}{tag ? " · " + cap(tag) : ""}{city ? " · " + city : ""}</h2>
          <div>{hl.map((p) => <button key={p.id} className="hl" onClick={() => open(p.id)}><i style={p.photos[0] ? { backgroundImage: `url('${p.photos[0]}')` } : undefined} /><span><b>{p.name}</b><small>{lab(p) ? lab(p) + " · " : ""}{p.city}</small></span></button>)}</div></div>
        <div className="panel dpanel"><div className="dsearch"><h2><Ic n="search" s={20} />Rechercher</h2>
          <div className="sp" style={{ maxWidth: "none", margin: 0 }}><input type="search" placeholder="Nom, style, ville…" aria-label="Rechercher" value={q} onChange={(e) => setQ(e.target.value)} /><Ic n="search" /></div></div>
          <h2 className="fh"><Ic n="sliders" s={20} />Filtres<button className="clear" onClick={clear}>Tout effacer</button></h2>
          <div className="row"><span>Profil</span><select aria-label="Profil" value={type} onChange={(e) => setType(e.target.value)}><option value="tous">Tous les profils</option><option value="fille">Filles</option><option value="homme">Hommes</option><option value="trans">Trans</option><option value="livecam">Livecam</option></select></div>
          <div className="row"><span>Trier par</span><select aria-label="Tri" value={sort} onChange={(e) => setSort(e.target.value)}><option value="rec">Plus récents</option><option value="az">Nom (A à Z)</option><option value="tarif">Tarif croissant (selon la durée)</option><option value="vus">Plus vus (30 jours)</option><option value="media">Plus de contenus</option></select></div>
          <div className="row"><span>Durée</span><select aria-label="Durée" value={dur} onChange={(e) => { setDur(Number(e.target.value) as 30 | 60); setTar(0); }}><option value={60}>1 heure</option><option value={30}>30 minutes</option></select></div>
          <div className="row"><span>Tarif maximum 🌹</span><select aria-label="Tarif maximum" value={tar} onChange={(e) => setTar(Number(e.target.value))}><option value={0}>Tous les tarifs</option>{(dur === 30 ? [50, 80, 100, 150] : [100, 150, 200, 300]).map((v) => <option key={v} value={v}>{v} maximum</option>)}<option value={999}>Plus de {dur === 30 ? 150 : 300}</option></select></div>
          <label className="ck"><input type="checkbox" checked={vid} onChange={(e) => setVid(e.target.checked)} /> Avec vidéo de présentation</label>
          <label className="ck"><input type="checkbox" checked={ver} onChange={(e) => setVer(e.target.checked)} /> Profils vérifiés uniquement</label>
          <label className="ck"><input type="checkbox" checked={now} onChange={(e) => setNow(e.target.checked)} /> Disponibles maintenant</label>
        </div>
      </aside>
    </div>
  );
}
