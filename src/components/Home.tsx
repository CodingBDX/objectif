"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Ic from "./Ic";
import Heart from "./Heart";
import { useFavs } from "@/lib/favs";
import { avail, tripsOf } from "@/lib/avail";
import { CIC, cap, cityList, isNew, lab, Profile } from "@/lib/types";

const PAGE = 10;
const ITEMS: [string, string, string][] = [["tous", "Tous les profils", "grid"], ["fille", "Filles", "fille"], ["homme", "Hommes", "homme"], ["trans", "Trans", "trans"], ["livecam", "Livecam", "live"]];

function Card({ p, onOpen, delay }: { p: Profile; onOpen: () => void; delay?: number }) {
  const a = avail(p); const live = p.genre === "livecam"; const pics = p.photos.slice(0, 3);
  while (pics.length < 3) pics.push(p.photos[0] || "");
  return (
    <article className={`card${p.vip ? " isvip" : ""}${live ? " live" : ""}${a && !a.on ? " off" : ""}${delay !== undefined ? " pop" : ""}`} style={delay !== undefined ? { animationDelay: delay + "ms" } : undefined}
      tabIndex={0} aria-label={`Voir le profil de ${p.name}`} onClick={onOpen} onKeyDown={(e) => e.key === "Enter" && onOpen()}>
      <div className="cover">
        <div className="tr"><span className="phb" title="Nombre de photos"><Ic n="camera" s={14} />{p.photos.length}</span>{p.vip && <span className="vipb"><Ic n="crown" s={14} />VIP</span>}</div>
        {isNew(p) && <span className="nwb" title="Profil créé il y a moins d’un mois"><Ic n="spark" s={14} />New</span>}
        <div className="mos">{pics.map((u, i) => <div key={i} style={u ? { backgroundImage: `url('${u}')` } : undefined} />)}</div>
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
        <div className="tags">{p.specialties.slice(0, 2).map((t) => <span className="tag" key={t}>{cap(t)}</span>)}</div>
      </div>
    </article>
  );
}

export default function Home({ profiles }: { profiles: Profile[] }) {
  const r = useRouter(); const sp = useSearchParams(); const { favs } = useFavs();
  const [type, setType] = useState("tous"); const [tag, setTag] = useState(""); const [q, setQ] = useState("");
  const [sort, setSort] = useState("rec"); const [vid, setVid] = useState(false); const [ver, setVer] = useState(false);
  const [view, setView] = useState<"cards" | "list">("cards"); const [shown, setShown] = useState(PAGE);
  const city = sp.get("ville") || ""; const fav = !!sp.get("fav");
  useEffect(() => { try { if (localStorage.getItem("objectif_vue") === "list") setView("list"); } catch {} }, []);
  useEffect(() => { setShown(PAGE); }, [type, tag, q, sort, vid, ver, city, fav]);
  const chView = (v: "cards" | "list") => { setView(v); try { localStorage.setItem("objectif_vue", v); } catch {} };

  const list = useMemo(() => {
    const l = profiles.filter((p) => (type === "tous" || p.genre === type) && (!city || cityList(p).includes(city)) && (!tag || p.specialties.some((t) => t.toLowerCase() === tag))
      && (!fav || favs.includes(p.id)) && (!vid || p.video) && (!ver || p.verified)
      && (!q || (p.name + " " + cityList(p).join(" ") + " " + p.specialties.join(" ") + " " + p.bio + " " + lab(p)).toLowerCase().includes(q.toLowerCase())));
    l.sort((a, b) => sort === "az" ? a.name.localeCompare(b.name) : sort === "media" ? b.photos.length - a.photos.length : +new Date(b.created_at) - +new Date(a.created_at));
    l.sort((a, b) => +b.vip - +a.vip);
    return l;
  }, [profiles, type, tag, q, sort, vid, ver, city, fav, favs]);

  const cnt = (t: string) => (t === "tous" ? profiles.length : profiles.filter((p) => p.genre === t).length);
  const tags = useMemo(() => { const tc: Record<string, number> = {}; profiles.forEach((p) => p.specialties.forEach((t) => { t = t.toLowerCase(); tc[t] = (tc[t] || 0) + 1; })); return Object.entries(tc).sort((x, y) => y[1] - x[1] || x[0].localeCompare(y[0])).slice(0, 8); }, [profiles]);
  const top = useMemo(() => { const cc: Record<string, number> = {}; profiles.forEach((p) => cityList(p).forEach((c) => (cc[c] = (cc[c] || 0) + 1))); return Object.entries(cc).sort((x, y) => y[1] - x[1] || x[0].localeCompare(y[0], "fr")).slice(0, 10); }, [profiles]);
  const hl = useMemo(() => profiles.filter((p) => (!tag || p.specialties.some((x) => x.toLowerCase() === tag)) && (!city || cityList(p).includes(city))).sort((a, b) => +b.vip - +a.vip || +new Date(b.created_at) - +new Date(a.created_at)).slice(0, 3), [profiles, tag, city]);

  const sentinel = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = sentinel.current; if (!el || shown >= list.length) return;
    const io = new IntersectionObserver((es) => { if (es[0].isIntersecting) setShown((s) => Math.min(s + PAGE, list.length)); }, { rootMargin: "600px" });
    io.observe(el); return () => io.disconnect();
  }, [shown, list.length]);
  const open = (id: string) => r.push(`/profil/${id}`);
  const setCity = (c: string) => r.push(c ? `/?ville=${encodeURIComponent(c)}` : "/");
  const clear = () => { setType("tous"); setTag(""); setQ(""); setSort("rec"); setVid(false); setVer(false); r.push("/"); };

  return (
    <div className="shell gut" id="shell">
      <aside className="side" aria-label="Catégories">
        <div className="panel tip"><svg className="ic" viewBox="0 0 24 24" width="40" height="40" aria-hidden="true"><path d="M12 3l7.500 2.800v5.700c0 4.500-3 8.200-7.500 9.500-4.500-1.300-7.500-5-7.500-9.500V5.800z" /><path d="M8.800 12.200l2.300 2.300 4.200-4.600" /></svg><span>Site fait par et pour les pros, <b>50 % reversés aux associations</b></span></div>
        <div className="panel">
          <div>{ITEMS.map(([k, v, i]) => <button key={k} className={`si${type === k && !fav ? " on" : ""}`} onClick={() => { setType(k); if (fav) r.push("/"); }}><Ic n={i} />{v}<span className="n">{cnt(k)}</span></button>)}</div>
          <hr className="sep" />
          <h2><Ic n="tag" s={20} />Spécialités</h2>
          <div>{tags.map(([t, n]) => <button key={t} className={`si${tag === t ? " on" : ""}`} onClick={() => setTag(tag === t ? "" : t)}>{cap(t)}<span className="n">{n}</span></button>)}</div>
        </div>
      </aside>

      <main style={{ minWidth: 0 }}>
        <section className="panel top" aria-labelledby="topH"><h2 id="topH"><Ic n="star" s={20} />Top 10 des villes</h2>
          <ol>{top.map(([c, n], i) => <li key={c}><button className={city === c ? "on" : ""} onClick={() => setCity(city === c ? "" : c)}><span className="rk">{i + 1}</span>{c}<span className="n">{n} profil{n > 1 ? "s" : ""}</span></button></li>)}</ol></section>
        <div className="mchips">{ITEMS.map(([k, v]) => <button key={k} className="chip" aria-pressed={type === k} onClick={() => setType(k)}>{v}</button>)}</div>
        <div className="sh"><h2><Ic n="star" s={22} />Tous les profils</h2><span className="cnt0" aria-live="polite">{list.length} profil{list.length > 1 ? "s" : ""}</span>
          <div className="vsw" role="group" aria-label="Affichage">
            <button type="button" aria-pressed={view === "cards"} title="Affichage en cartes" aria-label="Cartes" onClick={() => chView("cards")}><Ic n="grid" /></button>
            <button type="button" aria-pressed={view === "list"} title="Affichage en liste" aria-label="Liste" onClick={() => chView("list")}>
              <svg className="ic" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><rect x="3" y="4" width="18" height="6" rx="2" /><rect x="3" y="14" width="18" height="6" rx="2" /></svg></button>
          </div>
        </div>
        <div className={`grid${view === "list" ? " lst" : ""}`}>
          {list.length ? list.slice(0, shown).map((p, i) => <Card key={p.id} p={p} onOpen={() => open(p.id)} delay={i >= PAGE ? ((i - PAGE) % PAGE) * 45 : undefined} />)
            : <div className="empty">{fav ? "Aucun favori pour le moment. Touchez le cœur d’un profil pour le garder ici." : profiles.length ? "Aucun profil ne correspond à votre recherche." : "Aucun profil pour le moment. Sois le premier : clique sur « Créer mon profil »."}</div>}
        </div>
        {shown < list.length && <div className="more" ref={sentinel}><i /><i /><i /><span>{list.length - shown} profils à venir</span><button className="btn ghost" type="button" onClick={() => setShown((s) => s + PAGE)}>Voir plus</button></div>}
      </main>

      <aside className="aside" aria-label="Filtres">
        <div className="panel"><h2><Ic n="star" s={20} />Mis en avant{tag ? " · " + cap(tag) : ""}{city ? " · " + city : ""}</h2>
          <div>{hl.map((p) => <button key={p.id} className="hl" onClick={() => open(p.id)}><i style={p.photos[0] ? { backgroundImage: `url('${p.photos[0]}')` } : undefined} /><span><b>{p.name}</b><small>{lab(p) ? lab(p) + " · " : ""}{p.city}</small></span></button>)}</div></div>
        <div className="panel"><h2><Ic n="search" s={20} />Rechercher</h2>
          <div className="sp" style={{ maxWidth: "none", margin: 0 }}><input type="search" placeholder="Nom, style, ville…" aria-label="Rechercher" value={q} onChange={(e) => setQ(e.target.value)} /><Ic n="search" /></div>
          <h2 style={{ marginTop: 18 }}><Ic n="sliders" s={20} />Filtres<button className="clear" onClick={clear}>Tout effacer</button></h2>
          <div className="row"><span>Profil</span><select aria-label="Profil" value={type} onChange={(e) => setType(e.target.value)}><option value="tous">Tous les profils</option><option value="fille">Filles</option><option value="homme">Hommes</option><option value="trans">Trans</option><option value="livecam">Livecam</option></select></div>
          <div className="row"><span>Trier par</span><select aria-label="Tri" value={sort} onChange={(e) => setSort(e.target.value)}><option value="rec">Plus récents</option><option value="az">Nom (A à Z)</option><option value="media">Plus de contenus</option></select></div>
          <label className="ck"><input type="checkbox" checked={vid} onChange={(e) => setVid(e.target.checked)} /> Avec vidéo de présentation</label>
          <label className="ck"><input type="checkbox" checked={ver} onChange={(e) => setVer(e.target.checked)} /> Profils vérifiés uniquement</label>
        </div>
      </aside>
    </div>
  );
}
