"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase/client";

type Row = { day: string; views: number; calls: number; copies: number; socials: number };
type Me = { name: string; vip: boolean; photos: string[] | null; video: string | null; bio: string | null; phone: string | null; instagram: string | null; snapchat: string | null; tiktok: string | null; site: string | null; specialties: string[] | null; h24: boolean | null; hours: unknown };
const iso = (d: Date) => new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Paris" }).format(d);
const sum = (r: Row[], k: keyof Row) => r.reduce((a, x) => a + (x[k] as number), 0);
const JOURS = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
const BAR = ["#b7a4f0", "#ffb3cf", "#ffc27a", "#ffe08a", "#b5e3a8", "#a8d0f7", "#cdb8f5"];
const empty = (d: string): Row => ({ day: d, views: 0, calls: 0, copies: 0, socials: 0 });

export default function Stats() {
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

  const parts = [{ n: "Appels", v: calls, c: "#b7a4f0" }, { n: "Numéro copié", v: copies, c: "#ffb3cf" }, { n: "Réseaux", v: socials, c: "#ffe08a" }];
  let acc = 0; const stops = contacts ? parts.map((p) => { const a = (acc / contacts) * 360; acc += p.v; return `${p.c} ${a}deg ${(acc / contacts) * 360}deg`; }).join(",") : "#ece5fb 0deg 360deg";

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
    <div className="dash gut">
      <aside className="dside">
        <div className="dav">{first.slice(0, 1).toUpperCase()}</div>
        <div className="dhi">Salut, {first} 👋</div>
        <nav>
          <Link className="on" href="/statistiques">📊 Statistiques</Link>
          <Link href="/mon-profil">✏️ Mon profil</Link>
          <Link href={`/profil/${uid}`}>👀 Voir ma page</Link>
          <Link href="/">🏠 Annuaire</Link>
          <Link href="/contact">✉️ Contact</Link>
        </nav>
        {!me.vip && <div className="dvip"><div className="crown">👑</div><b>Passe en VIP</b><span>Plus de visibilité dans l’annuaire.</span><Link className="dbtn pink" href="/contact?s=vip">Devenir VIP</Link></div>}
      </aside>

      <main className="dmain">
        <div className="dtop"><h1>Tableau de bord</h1>
          <div className="drange" role="group" aria-label="Période"><button aria-pressed={range === 7} onClick={() => setRange(7)}>7 jours</button><button aria-pressed={range === 30} onClick={() => setRange(30)}>30 jours</button></div></div>

        <section className="dhero">
          <div><h2>{hello}, {first} ! ☀️</h2>
            <p>{v ? <>Ton profil a été vu <b>{v} fois</b> sur les {range} derniers jours{trend !== null && <> ({trend >= 0 ? "+" : ""}{trend} %)</>}.</> : "Pas encore de visite sur cette période. Partage ton lien pour démarrer !"}</p>
            <Link className="dbtn" href="/mon-profil">✏️ Améliorer mon profil</Link></div>
          <div className="dsun" aria-hidden="true">📈</div>
        </section>

        <div className="dtiles">
          <div className="dt t1"><i>👁</i><span>Vues du profil</span><b>{v}</b><small className={trend !== null && trend < 0 ? "neg" : ""}>{trend === null ? "pas de comparaison" : `${trend >= 0 ? "+" : ""}${trend} % vs période préc.`}</small></div>
          <div className="dt t2"><i>📞</i><span>Appels</span><b>{calls}</b><small>clics sur ton numéro</small></div>
          <div className="dt t3"><i>🔗</i><span>Réseaux</span><b>{socials}</b><small>clics sur tes liens</small></div>
          <div className="dt t4"><i>💬</i><span>Commentaires</span><b>{coms}</b><small>au total</small></div>
        </div>

        <div className="dgrid">
          <section className="dcard">
            <h3>Vues par jour</h3>
            {v === 0 ? <p className="note">Aucune vue sur cette période.</p> : (
              <div className="bars" role="img" aria-label={`Graphique des vues sur ${range} jours, total ${v}`} style={{ gap: range === 30 ? 3 : 10 }}>
                {cur.map((r, i) => <div key={r.day} className="bcol" title={`${r.day} : ${r.views} vue${r.views > 1 ? "s" : ""}`}>
                  <div className="bar" style={{ height: Math.max(r.views ? 6 : 3, (r.views / max) * 100) + "%", background: r.views ? BAR[i % 7] : "#ece5fb" }} />
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
            <h3>À retenir</h3>
            <ul className="dl">
              <li><span>🏆 Meilleur jour</span><b>{best.views ? `${new Date(best.day + "T12:00:00").toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "short" })} · ${best.views}` : "–"}</b></li>
              <li><span>📋 Numéro copié</span><b>{copies}</b></li>
              <li><span>📅 Moyenne</span><b>{(v / range).toFixed(1).replace(".", ",")} vue/jour</b></li>
            </ul>
          </section>
          <section className="dcard">
            <h3>Profil complet : {done}/{tips.length}</h3>
            <div className="prog"><i style={{ width: (done / tips.length) * 100 + "%" }} /></div>
            <ul className="dl tips">{tips.map(([ok, t]) => <li key={t} className={ok ? "ok" : ""}><span>{ok ? "✅" : "⬜"} {t}</span></li>)}</ul>
          </section>
        </div>

        <section className="dcta"><div><b>Plus de visites ?</b><span>Un profil complet avec photos et vidéo est consulté bien plus souvent.</span></div><Link className="dbtn" href="/mon-profil">Compléter</Link></section>
        <p className="note">Une visite par personne et par jour d’appareil. Tes propres visites ne sont pas comptées. Les favoris (cœurs) sont stockés sur l’appareil du visiteur et ne sont pas comptabilisés.</p>
      </main>
    </div>
  );
}
