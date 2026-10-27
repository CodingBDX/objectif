"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import CountUp from "@/components/CountUp";
import { supabaseBrowser } from "@/lib/supabase/client";

type Row = { day: string; views: number; calls: number; copies: number; socials: number };
type Me = { name: string; vip: boolean; photos: string[] | null; video: string | null; bio: string | null; phone: string | null; instagram: string | null; snapchat: string | null; tiktok: string | null; site: string | null; specialties: string[] | null; h24: boolean | null; hours: unknown };
const iso = (d: Date) => new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Paris" }).format(d);
const sum = (r: Row[], k: keyof Row) => r.reduce((a, x) => a + (x[k] as number), 0);
const JOURS = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
const BAR = ["#ff9ac8", "#ffc27a", "#ffe08a", "#b5e3a8", "#a8d0f7", "#d9b8f5", "#ff7fb5"];
const empty = (d: string): Row => ({ day: d, views: 0, calls: 0, copies: 0, socials: 0 });

export default function StatsPanel() {
  const sb = supabaseBrowser();
  const [rows, setRows] = useState<Row[]>([]); const [me, setMe] = useState<Me | null>(null); const [coms, setComs] = useState(0); const [uid, setUid] = useState("");
  const [range, setRange] = useState<7 | 30>(7); const [ready, setReady] = useState(false); const [noProfile, setNoProfile] = useState(false);
  useEffect(() => { (async () => {
    const { data: { user } } = await sb.auth.getUser();
    if (!user) { location.href = "/connexion"; return; }
    const { data: p } = await sb.from("profiles").select("name,vip,photos,video,bio,phone,instagram,snapchat,tiktok,site,specialties,h24,hours").eq("id", user.id).maybeSingle();
    if (!p) { setNoProfile(true); setReady(true); return; }
    setMe(p as Me); setUid(user.id);
    const from = iso(new Date(Date.now() - 59 * 864e5));
    const { data } = await sb.from("profile_stats").select("*").eq("profile_id", user.id).gte("day", from).order("day");
    setRows((data || []) as Row[]);
    const { count } = await sb.from("comments").select("id", { count: "exact", head: true }).eq("profile_id", user.id); setComs(count || 0);
    setReady(true);
  })(); }, []);

  if (!ready) return <section className="gut"><p className="note">Chargement…</p></section>;
  if (noProfile || !me) return <section className="gut"><div className="pfc" style={{ maxWidth: 560 }}><div className="panel regp"><h1 className="regh">Mes statistiques</h1><p className="note">Crée d’abord ton profil pour voir tes statistiques.</p><Link className="btn" href="/mon-profil">Créer mon profil</Link></div></div></section>;

  const by = new Map(rows.map((r) => [r.day, r]));
  const span = (n: number, off: number) => Array.from({ length: n }, (_, i) => { const d = iso(new Date(Date.now() - (off + n - 1 - i) * 864e5)); return by.get(d) || empty(d); });
  const cur = span(range, 0), prev = span(range, range);
  const v = sum(cur, "views"), pv = sum(prev, "views");
  const calls = sum(cur, "calls"), copies = sum(cur, "copies"), socials = sum(cur, "socials"), contacts = calls + copies + socials;
  const trend = pv ? Math.round(((v - pv) / pv) * 100) : null;
  const max = Math.max(1, ...cur.map((r) => r.views));
  const best = cur.reduce((a, b) => (b.views > a.views ? b : a), cur[0]);
  const hour = new Date().getHours();
  const hello = hour < 6 || hour >= 18 ? "Bonsoir" : "Bonjour";
  const first = me.name.split(" ")[0];
  const lbl = (d: string) => { const x = new Date(d + "T12:00:00"); return range === 7 ? JOURS[x.getDay()] : String(x.getDate()); };

  const parts = [{ n: "Appels", v: calls, c: "#ff9ac8" }, { n: "Numéro copié", v: copies, c: "#ffc27a" }, { n: "Réseaux", v: socials, c: "#ffe08a" }];
  let acc = 0; const stops = contacts ? parts.map((p) => { const a = (acc / contacts) * 360; acc += p.v; return `${p.c} ${a}deg ${(acc / contacts) * 360}deg`; }).join(",") : "#ffe1ef 0deg 360deg";

  const tips: [boolean, string][] = [
    [(me.photos?.length || 0) >= 4, "Ajoute au moins 4 photos"],
    [!!me.video, "Ajoute une vidéo de présentation"],
    [(me.bio || "").length >= 60, "Rédige une description d’au moins 60 caractères"],
    [(me.specialties?.length || 0) >= 3, "Choisis 3 spécialités ou plus"],
    [!!(me.instagram || me.snapchat || me.tiktok || me.site), "Renseigne un réseau social ou un site"],
    [!!me.phone, "Indique un numéro de téléphone"],
  ];
  const done = tips.filter((t) => t[0]).length;

  return (
    <>
        <div className="dtop" id="stats"><h2 className="dsub">📊 Mes statistiques</h2>
          <div className="dtopr">
            <div className="drange" role="group" aria-label="Période"><button aria-pressed={range === 7} onClick={() => setRange(7)}>7 jours</button><button aria-pressed={range === 30} onClick={() => setRange(30)}>30 jours</button></div>
          </div></div>

        <div className="dchips">
          <div className="dch" title={trend === null ? "Vues du profil" : `Vues du profil (${trend >= 0 ? "+" : ""}${trend} % vs période précédente)`}><i aria-hidden="true">👁</i><b><CountUp to={v} /></b><span>Vues</span>{trend !== null && <small className={trend < 0 ? "neg" : ""}>{trend >= 0 ? "▲" : "▼"} {Math.abs(trend)} %</small>}</div>
          <div className="dch" title="Appels : clics sur ton numéro"><i aria-hidden="true">📞</i><b><CountUp to={calls} /></b><span>Appels</span></div>
          <div className="dch" title="Réseaux : clics sur tes liens"><i aria-hidden="true">🔗</i><b><CountUp to={socials} /></b><span>Réseaux</span></div>
          <div className="dch" title="Commentaires au total"><i aria-hidden="true">💬</i><b><CountUp to={coms} /></b><span>Com.</span></div>
          <div className="dch" title={best.views ? `Meilleur jour : ${best.views} vue${best.views > 1 ? "s" : ""}` : "Meilleur jour"}><i aria-hidden="true">🏆</i><b>{best.views ? new Date(best.day + "T12:00:00").toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" }) : "–"}</b><span>Meilleur jour</span></div>
          <div className="dch" title="Numéro copié"><i aria-hidden="true">📋</i><b><CountUp to={copies} /></b><span>Copié</span></div>
          <div className="dch" title="Moyenne de vues par jour"><i aria-hidden="true">📅</i><b>{(v / range).toFixed(1).replace(".", ",")}</b><span>vue/jour</span></div>
        </div>

        <div className="dgrid">
          <section className="dcard">
            <h3>Vues par jour</h3>
            {v === 0 ? <p className="note">Aucune vue sur cette période.</p> : (
              <div className="bars" role="img" aria-label={`Graphique des vues sur ${range} jours, total ${v}`} style={{ gap: range === 30 ? 3 : 10 }}>
                {cur.map((r, i) => <div key={r.day} className="bcol" title={`${r.day} : ${r.views} vue${r.views > 1 ? "s" : ""}`}>
                  <div className="bar" style={{ height: Math.max(r.views ? 6 : 3, (r.views / max) * 100) + "%", background: r.views ? BAR[i % 7] : "#ffe1ef" }} />
                  {(range === 7 || i % 5 === 0) && <span>{lbl(r.day)}</span>}</div>)}
              </div>)}
          </section>
          <section className="dcard">
            <h3>Comment on te contacte</h3>
            <div className="dn"><div className="donut" style={{ background: `conic-gradient(${stops})` }} role="img" aria-label={`Contacts : ${calls} appels, ${copies} copies, ${socials} réseaux`}><b>{contacts}</b></div>
              <ul>{parts.map((p) => <li key={p.n}><i style={{ background: p.c }} />{p.n}<b>{contacts ? Math.round((p.v / contacts) * 100) : 0} %</b></li>)}</ul></div>
            <p className="note" style={{ margin: "8px 0 0" }}>Taux de contact : <b>{v ? Math.round((contacts / v) * 100) + " %" : "–"}</b> (contacts ÷ vues)</p>
          </section>
          <section className="dcard">
            <h3>Profil complet : {done}/{tips.length}</h3>
            <div className="prog"><i style={{ width: (done / tips.length) * 100 + "%" }} /></div>
            <ul className="dl tips">{tips.map(([ok, t]) => <li key={t} className={ok ? "ok" : ""}><span>{ok ? "✅" : "⬜"} {t}</span></li>)}</ul>
          </section>
        </div>

        <p className="note">Une visite par personne et par jour d’appareil. Tes propres visites ne sont pas comptées. Les favoris (cœurs) sont stockés sur l’appareil du visiteur et ne sont pas comptabilisés.</p>
    </>
  );
}
