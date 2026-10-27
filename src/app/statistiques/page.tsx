"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase/client";

type Row = { day: string; views: number; calls: number; copies: number; socials: number };
const iso = (d: Date) => new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Paris" }).format(d);
const sum = (r: Row[], k: keyof Row) => r.reduce((a, x) => a + (x[k] as number), 0);

export default function Stats() {
  const sb = supabaseBrowser();
  const [rows, setRows] = useState<Row[]>([]); const [name, setName] = useState(""); const [coms, setComs] = useState(0);
  const [range, setRange] = useState<7 | 30>(30); const [ready, setReady] = useState(false); const [noProfile, setNoProfile] = useState(false);
  useEffect(() => { (async () => {
    const { data: { user } } = await sb.auth.getUser();
    if (!user) { location.href = "/connexion"; return; }
    const { data: p } = await sb.from("profiles").select("name").eq("id", user.id).maybeSingle();
    if (!p) { setNoProfile(true); setReady(true); return; }
    setName(p.name);
    const from = iso(new Date(Date.now() - 59 * 864e5));
    const { data } = await sb.from("profile_stats").select("*").eq("profile_id", user.id).gte("day", from).order("day");
    setRows((data || []) as Row[]);
    const { count } = await sb.from("comments").select("id", { count: "exact", head: true }).eq("profile_id", user.id); setComs(count || 0);
    setReady(true);
  })(); }, []);
  if (!ready) return <section className="gut"><p className="note">Chargement…</p></section>;
  if (noProfile) return <section className="gut"><div className="pfc" style={{ maxWidth: 560 }}><div className="panel regp"><h1 className="regh">Mes statistiques</h1><p className="note">Crée d’abord ton profil pour voir tes statistiques.</p><Link className="btn" href="/mon-profil">Créer mon profil</Link></div></div></section>;

  const days: string[] = Array.from({ length: range }, (_, i) => iso(new Date(Date.now() - (range - 1 - i) * 864e5)));
  const by = new Map(rows.map((r) => [r.day, r]));
  const cur = days.map((d) => by.get(d) || { day: d, views: 0, calls: 0, copies: 0, socials: 0 });
  const prevDays = Array.from({ length: range }, (_, i) => iso(new Date(Date.now() - (2 * range - 1 - i) * 864e5)));
  const prev = prevDays.map((d) => by.get(d) || { day: d, views: 0, calls: 0, copies: 0, socials: 0 });
  const v = sum(cur, "views"), pv = sum(prev, "views"), contacts = sum(cur, "calls") + sum(cur, "copies") + sum(cur, "socials");
  const max = Math.max(1, ...cur.map((r) => r.views));
  const trend = pv ? Math.round(((v - pv) / pv) * 100) : null;
  const Card = ({ t, n, s }: { t: string; n: number | string; s?: string }) => <div className="panel" style={{ padding: "14px 16px" }}><div className="note" style={{ margin: 0 }}>{t}</div><div style={{ font: "700 32px var(--fd)", color: "var(--btn)" }}>{n}</div>{s && <div className="note" style={{ margin: 0 }}>{s}</div>}</div>;

  return (
    <section className="gut">
      <div className="pbar"><Link className="btn ghost" href="/mon-profil">← Mon profil</Link><strong className="pbn">Statistiques · {name}</strong></div>
      <div className="pfc">
        <div className="mchips" style={{ display: "flex", margin: "0 0 14px" }}>
          <button className="chip" aria-pressed={range === 7} onClick={() => setRange(7)}>7 jours</button>
          <button className="chip" aria-pressed={range === 30} onClick={() => setRange(30)}>30 jours</button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(170px,1fr))", gap: 12, marginBottom: 16 }}>
          <Card t="👁 Vues du profil" n={v} s={trend === null ? "Pas encore de période de comparaison" : `${trend >= 0 ? "+" : ""}${trend} % vs période précédente`} />
          <Card t="📞 Clics sur ton numéro" n={sum(cur, "calls")} />
          <Card t="📋 Numéro copié" n={sum(cur, "copies")} />
          <Card t="🔗 Clics réseaux sociaux" n={sum(cur, "socials")} />
          <Card t="📬 Taux de contact" n={v ? Math.round((contacts / v) * 100) + " %" : "–"} s="contacts ÷ vues" />
          <Card t="💬 Commentaires reçus" n={coms} s="au total" />
        </div>
        <div className="panel">
          <h2 style={{ font: "600 20px var(--fd)", margin: "0 0 10px" }}>Vues par jour</h2>
          {v === 0 ? <p className="note">Aucune vue sur cette période. Partage le lien de ton profil pour faire démarrer les statistiques.</p> : (
            <div role="img" aria-label={`Graphique des vues sur ${range} jours, total ${v}`} style={{ display: "flex", alignItems: "flex-end", gap: range === 30 ? 3 : 8, height: 160 }}>
              {cur.map((r) => <div key={r.day} title={`${r.day} : ${r.views} vue${r.views > 1 ? "s" : ""}`} style={{ flex: 1, minWidth: 0, height: Math.max(3, (r.views / max) * 100) + "%", background: r.views ? "linear-gradient(180deg,var(--pink),var(--btn))" : "var(--line)", borderRadius: 6 }} />)}
            </div>)}
          <div className="note" style={{ display: "flex", justifyContent: "space-between", margin: "6px 0 0" }}><span>{cur[0].day}</span><span>aujourd’hui</span></div>
        </div>
        <p className="note">Les statistiques comptent une visite par personne et par jour d’appareil. Tes propres visites ne sont pas comptées. Les cœurs (favoris) restent enregistrés sur l’appareil de chaque visiteur et ne sont donc pas comptabilisés ici.</p>
      </div>
    </section>
  );
}
