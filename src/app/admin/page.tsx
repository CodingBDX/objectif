"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import CountUp from "@/components/CountUp";
import { supabaseBrowser } from "@/lib/supabase/client";
import { CATS } from "@/lib/types";

type Tab = "dash" | "profiles" | "reports" | "messages" | "clients" | "assos" | "journal";
const fmt = (t: string) => new Date(t).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
const ago = (t: string) => { const m = Math.max(1, Math.round((Date.now() - new Date(t).getTime()) / 60000)); return m < 60 ? `il y a ${m} min` : m < 1440 ? `il y a ${Math.round(m / 60)} h` : `il y a ${Math.round(m / 1440)} j`; };
const iso = (d: Date) => new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Paris" }).format(d);
const MOTIFS: Record<string, string> = { harcelement: "Harcèlement", menaces: "Menaces", impaye: "Impayé / arnaque", faux_rdv: "Faux rendez-vous", non_respect: "Non-respect des règles", autre: "Autre" };
const GCOL: Record<string, string> = { fille: "#ee4f97", homme: "#9a5cc8", trans: "#ffb3d3", livecam: "#6f8cf0" };
const BAR = ["#ff9ac8", "#ffc27a", "#ffe08a", "#b5e3a8", "#a8d0f7", "#d9b8f5", "#ff7fb5"];

export default function Admin() {
  const sb = supabaseBrowser();
  const [state, setState] = useState<"load" | "no" | "ok">("load");
  const [tab, setTab] = useState<Tab>("dash");
  const [reports, setReports] = useState<any[]>([]); const [profiles, setProfiles] = useState<any[]>([]); const [messages, setMessages] = useState<any[]>([]);
  const [assos, setAssos] = useState<any[]>([]); const [clients, setClients] = useState<any[]>([]); const [journal, setJournal] = useState<any[]>([]);
  const [daily, setDaily] = useState<{ day: string; views: number; calls: number }[]>([]); const [dailyErr, setDailyErr] = useState(false);
  const [cnt, setCnt] = useState<{ total: number; vip: number; paused: number; month: number; g: Record<string, number> }>({ total: 0, vip: 0, paused: 0, month: 0, g: {} });
  const [rej, setRej] = useState<Record<string, string>>({}); const [q, setQ] = useState(""); const [onlyNew, setOnlyNew] = useState(true); const [sure, setSure] = useState(""); const [err, setErr] = useState("");

  const loadReports = useCallback(async () => {
    const { data } = await sb.from("reports").select("*, profiles(id,name,city,paused,vip,verified)").order("created_at", { ascending: false }).limit(300); setReports(data || []);
  }, []);
  const loadProfiles = useCallback(async () => {
    let qq = sb.from("profiles").select("id,name,city,genre,vip,verified,paused,created_at").order("created_at", { ascending: false }).limit(200);
    if (q.trim()) qq = qq.ilike("name", `%${q.trim()}%`);
    const { data } = await qq; setProfiles(data || []);
  }, [q]);
  const loadMessages = useCallback(async () => {
    const { data } = await sb.from("messages").select("*").order("created_at", { ascending: false }).limit(300); setMessages(data || []);
  }, []);
  const loadCounts = useCallback(async () => {
    const c = (f: (x: any) => any) => f(sb.from("profiles").select("id", { count: "exact", head: true })).then((r: any) => r.count || 0);
    const since = new Date(Date.now() - 30 * 864e5).toISOString();
    const gs = ["fille", "homme", "trans", "livecam"];
    const [total, vip, paused, month, ...g] = await Promise.all([c((x) => x), c((x) => x.eq("vip", true)), c((x) => x.eq("paused", true)), c((x) => x.gte("created_at", since)), ...gs.map((k) => c((x) => x.eq("genre", k)))]);
    setCnt({ total, vip, paused, month, g: Object.fromEntries(gs.map((k, i) => [k, g[i]])) });
  }, []);
  const loadDaily = useCallback(async () => {
    const { data, error } = await sb.rpc("admin_daily_stats", { p_days: 30 });
    if (error) { setDailyErr(true); return; } setDailyErr(false); setDaily((data || []).map((r: any) => ({ day: r.day, views: Number(r.views), calls: Number(r.calls) })));
  }, []);
  const loadExtra = useCallback(async () => {
    const a = await sb.from("client_reports").select("id,category,note,created_at,profiles(name)").order("created_at", { ascending: false }).limit(200); setClients(a.error ? [] : a.data || []);
    const j = await sb.from("audit_log").select("*").order("id", { ascending: false }).limit(100); setJournal(j.error ? [] : j.data || []);
  }, []);

  useEffect(() => { (async () => {
    const { data: { user } } = await sb.auth.getUser();
    if (!user) { location.href = "/connexion"; return; }
    const { data } = await sb.from("admins").select("id").eq("id", user.id).maybeSingle();
    if (!data) { setState("no"); return; }
    setState("ok"); loadReports(); loadMessages(); loadCounts(); loadDaily(); loadExtra();
  })(); }, []);
  useEffect(() => { if (state === "ok") loadProfiles(); }, [state, loadProfiles]);

  async function setProfile(p: any, patch: Partial<{ vip: boolean; verified: boolean; paused: boolean }>) {
    setErr(""); const n = { vip: p.vip, verified: p.verified, paused: p.paused, ...patch };
    const { error } = await sb.rpc("admin_set_profile", { p_id: p.id, p_vip: n.vip, p_verified: n.verified, p_paused: n.paused });
    if (error) setErr(error.message); else { loadProfiles(); loadReports(); loadCounts(); loadExtra(); }
  }
  async function del(id: string) {
    setErr(""); const { error } = await sb.rpc("admin_delete_profile", { p_id: id }); setSure("");
    if (error) setErr(error.message); else { loadProfiles(); loadReports(); loadCounts(); loadExtra(); }
  }
  async function mark(table: "reports" | "messages", id: number, v: any) { await sb.from(table).update(v).eq("id", id); table === "reports" ? loadReports() : loadMessages(); }
  async function loadAssos() { const { data } = await sb.from("associations").select("*").order("created_at", { ascending: false }).limit(300); setAssos(data || []); }
  useEffect(() => { if (state === "ok") loadAssos(); }, [state]);
  async function setAsso(a: any, status: "approved" | "rejected" | "pending") {
    const { error } = await sb.from("associations").update({ status, admin_note: status === "rejected" ? (rej[a.id] || null) : null }).eq("id", a.id);
    if (error) setErr(error.message); else loadAssos();
  }
  async function delClient(id: number) { await sb.from("client_reports").delete().eq("id", id); loadExtra(); }

  if (state === "load") return <section className="gut"><p className="note">Chargement…</p></section>;
  if (state === "no") return (
    <section className="gut"><div className="pfc" style={{ maxWidth: 560 }}><div className="panel regp"><h1 className="regh">Accès réservé</h1>
      <p className="note">Ce compte n’est pas administrateur. Pour te donner l’accès, ajoute ton compte dans la table « admins » (voir le fichier migration-admin.sql).</p>
      <Link className="btn ghost" href="/">← Retour à l’annuaire</Link></div></div></section>);

  const nNew = reports.filter((r) => r.status === "nouveau").length, nMsg = messages.filter((m) => !m.done).length;
  const shownReports = reports.filter((r) => !onlyNew || r.status === "nouveau");

  // courbe des 30 derniers jours
  const by = new Map(daily.map((r) => [r.day, r]));
  const days = Array.from({ length: 30 }, (_, i) => { const d = iso(new Date(Date.now() - (29 - i) * 864e5)); return by.get(d) || { day: d, views: 0, calls: 0 }; });
  const maxV = Math.max(1, ...days.map((d) => d.views)); const sumV = days.reduce((a, d) => a + d.views, 0), sumC = days.reduce((a, d) => a + d.calls, 0);
  // anneau des genres
  const gTot = Object.values(cnt.g).reduce((a, b) => a + b, 0); let acc = 0;
  const stops = gTot ? Object.entries(cnt.g).map(([k, v]) => { const a = (acc / gTot) * 360; acc += v; return `${GCOL[k]} ${a}deg ${(acc / gTot) * 360}deg`; }).join(",") : "#ffe1ef 0deg 360deg";
  // activité récente (signalements, messages, nouveaux profils)
  const activity = [
    ...reports.slice(0, 8).map((r) => ({ t: r.created_at, i: "🚩", title: "Signalement reçu", sub: `${r.reason}${r.profiles ? " · " + r.profiles.name : ""}` })),
    ...messages.slice(0, 8).map((m) => ({ t: m.created_at, i: "✉️", title: "Message de contact", sub: m.subject })),
    ...profiles.slice(0, 8).map((p) => ({ t: p.created_at, i: "👤", title: "Nouveau profil", sub: `${p.name} · ${p.city}` })),
  ].sort((a, b) => +new Date(b.t) - +new Date(a.t)).slice(0, 8);
  const nav = (t: Tab, label: string, badge = 0) => <a href={`#${t}`} className={tab === t ? "on" : ""} aria-current={tab === t ? "page" : undefined} onClick={(e) => { e.preventDefault(); setTab(t); }}>{label}{badge > 0 && <b style={{ marginLeft: "auto", background: "var(--pink)", color: "#fff", borderRadius: 999, padding: "1px 8px", fontSize: 12 }}>{badge}</b>}</a>;
  const title: Record<Tab, string> = { dash: "Tableau de bord", profiles: "Profils", reports: "Signalements", messages: "Messages", clients: "Clients signalés", assos: "Associations", journal: "Journal des actions" };

  return (
    <div className="dash gut">
      <aside className="dside">
        <div className="dav">A</div>
        <div className="dhi">Administration</div>
        <nav>
          {nav("dash", "📊 Tableau de bord")}{nav("profiles", "👤 Profils")}{nav("reports", "🚩 Signalements", nNew)}{nav("messages", "✉️ Messages", nMsg)}
          {nav("assos", "🤝 Associations", assos.filter((a) => a.status === "pending").length)}{nav("clients", "🛡️ Clients signalés")}{nav("journal", "📜 Journal")}
          <Link href="/">🏠 Annuaire</Link>
        </nav>
        <div className="dvip"><div className="crown">🔔</div><b>À traiter</b>
          <span>{nNew} signalement{nNew > 1 ? "s" : ""} · {nMsg} message{nMsg > 1 ? "s" : ""}</span>
          <button type="button" className="dbtn pink" onClick={() => setTab(nNew ? "reports" : "messages")}>Voir</button></div>
        <div className="dvip"><div className="crown">💾</div><b>Sauvegarde</b><span>Garde la clé secrète des numéros signalés dans un endroit sûr.</span></div>
      </aside>

      <main className="dmain">
        <div className="dtop"><h1>{title[tab]}</h1><Link className="btn ghost" href="/">← Retour à l’annuaire</Link></div>
        {err && <p className="note" role="alert" style={{ color: "var(--btn)", fontWeight: 700, margin: 0 }}>{err}</p>}

        {tab === "dash" && (<>
          <div className="dtiles">
            <div className="dt t1"><i>👤</i><span>Profils</span><b><CountUp to={cnt.total} /></b><small>+{cnt.month} ces 30 jours</small></div>
            <div className="dt t2"><i>👑</i><span>Profils VIP</span><b><CountUp to={cnt.vip} /></b><small>{cnt.total ? Math.round((cnt.vip / cnt.total) * 100) : 0} % du total</small></div>
            <div className="dt t3"><i>🚩</i><span>Signalements</span><b><CountUp to={nNew} /></b><small>à traiter</small></div>
            <div className="dt t4"><i>✉️</i><span>Messages</span><b><CountUp to={nMsg} /></b><small>non traités · {cnt.paused} profil{cnt.paused > 1 ? "s" : ""} masqué{cnt.paused > 1 ? "s" : ""}</small></div>
          </div>
          <div className="dgrid">
            <section className="dcard">
              <h3>Vues par jour (30 jours)</h3>
              {dailyErr ? <p className="note">Statistiques indisponibles : lance <code>migration-admin-tableau.sql</code> dans Supabase.</p> : sumV === 0 ? <p className="note">Aucune vue sur cette période.</p> : (<>
                <div className="bars" role="img" aria-label={`Vues par jour sur 30 jours, total ${sumV}`} style={{ gap: 3 }}>
                  {days.map((r, i) => <div key={r.day} className="bcol" title={`${r.day} : ${r.views} vue${r.views > 1 ? "s" : ""}, ${r.calls} appel${r.calls > 1 ? "s" : ""}`}>
                    <div className="bar" style={{ height: Math.max(r.views ? 6 : 3, (r.views / maxV) * 100) + "%", background: r.views ? BAR[i % 7] : "#ffe1ef" }} />{i % 5 === 0 && <span>{r.day.slice(8)}</span>}</div>)}
                </div>
                <p className="note" style={{ margin: "8px 0 0" }}><b>{sumV}</b> vues · <b>{sumC}</b> appels sur 30 jours</p></>)}
            </section>
            <section className="dcard">
              <h3>Répartition des profils</h3>
              <div className="dn"><div className="donut" style={{ background: `conic-gradient(${stops})` }} role="img" aria-label={Object.entries(cnt.g).map(([k, v]) => `${CATS[k]} ${v}`).join(", ")}><b>{gTot}</b></div>
                <ul>{Object.entries(cnt.g).map(([k, v]) => <li key={k}><i style={{ background: GCOL[k] }} />{CATS[k]}<b>{gTot ? Math.round((v / gTot) * 100) : 0} %</b></li>)}</ul></div>
            </section>
            <section className="dcard" style={{ gridColumn: "1 / -1" }}>
              <h3>Activité récente</h3>
              {activity.length === 0 ? <p className="note">Rien pour le moment.</p> : <ul className="dl">{activity.map((a, i) => <li key={i}><span>{a.i} <b>{a.title}</b> · {a.sub}</span><b style={{ whiteSpace: "nowrap" }}>{ago(a.t)}</b></li>)}</ul>}
            </section>
            <section className="dcard" style={{ gridColumn: "1 / -1", display: "grid", gap: 10 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                <h3 style={{ margin: 0 }}>Profils à modérer</h3>
                <button type="button" className="btn ghost" onClick={() => setTab("profiles")}>Voir tous les profils →</button>
              </div>
              {profiles.slice(0, 8).map((p) => (
                <div key={p.id} className="dprow">
                  <div style={{ flex: "1 1 200px", minWidth: 0 }}><Link href={`/profil/${p.id}`}><b>{p.name}</b></Link><div className="note">{CATS[p.genre]} · {p.city} · {fmt(p.created_at)}{p.paused && " · masqué"}</div></div>
                  <label className="ck"><input type="checkbox" checked={p.vip} onChange={(e) => setProfile(p, { vip: e.target.checked })} /> VIP</label>
                  <label className="ck"><input type="checkbox" checked={p.verified} onChange={(e) => setProfile(p, { verified: e.target.checked })} /> Vérifié</label>
                  <label className="ck"><input type="checkbox" checked={p.paused} onChange={(e) => setProfile(p, { paused: e.target.checked })} /> Masqué</label>
                </div>))}
            </section>
          </div>
        </>)}

        {tab === "reports" && (<div style={{ display: "grid", gap: 12 }}>
          <label className="ck"><input type="checkbox" checked={onlyNew} onChange={(e) => setOnlyNew(e.target.checked)} /> Seulement les nouveaux</label>
          {shownReports.length === 0 && <p className="note">Aucun signalement.</p>}
          {shownReports.map((r) => (
            <div className="dcard" key={r.id} style={{ display: "grid", gap: 6 }}>
              <div><b>{r.reason}</b> · <span className="note">{fmt(r.created_at)} · {r.status}</span></div>
              <div>Profil : {r.profiles ? <Link href={`/profil/${r.profiles.id}`}><b>{r.profiles.name}</b> ({r.profiles.city})</Link> : "supprimé"}{r.profiles?.paused && " · masqué"}</div>
              {r.details && <p style={{ margin: 0, whiteSpace: "pre-wrap" }}>{r.details}</p>}
              {r.contact && <div className="note">Contact : {r.contact}</div>}
              <div className="acts">
                {r.profiles && <button className="btn" onClick={() => setProfile(r.profiles, { paused: !r.profiles.paused })}>{r.profiles.paused ? "▶ Réactiver le profil" : "⏸ Masquer le profil"}</button>}
                {r.status === "nouveau" ? <button className="btn ghost" onClick={() => mark("reports", r.id, { status: "traité" })}>✓ Marquer traité</button> : <button className="btn ghost" onClick={() => mark("reports", r.id, { status: "nouveau" })}>Rouvrir</button>}
                {r.profiles && (sure === "r" + r.id
                  ? <><button className="btn" onClick={() => del(r.profiles.id)}>Confirmer la suppression</button><button className="btn ghost" onClick={() => setSure("")}>Annuler</button></>
                  : <button className="btn ghost" onClick={() => setSure("r" + r.id)}>🗑 Supprimer le profil</button>)}
              </div>
            </div>))}
        </div>)}

        {tab === "profiles" && (<div style={{ display: "grid", gap: 10 }}>
          <div className="sp" style={{ maxWidth: 420, margin: 0 }}><input type="search" placeholder="Rechercher un nom…" value={q} onChange={(e) => setQ(e.target.value)} /></div>
          <p className="note" style={{ margin: 0 }}>{profiles.length} profil{profiles.length > 1 ? "s" : ""} (200 maximum affichés)</p>
          {profiles.map((p) => (
            <div className="dcard" key={p.id} style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap", padding: "10px 16px" }}>
              <div style={{ flex: "1 1 200px", minWidth: 0 }}><Link href={`/profil/${p.id}`}><b>{p.name}</b></Link><div className="note">{CATS[p.genre]} · {p.city} · {fmt(p.created_at)}{p.paused && " · masqué"}</div></div>
              <label className="ck"><input type="checkbox" checked={p.vip} onChange={(e) => setProfile(p, { vip: e.target.checked })} /> VIP</label>
              <label className="ck"><input type="checkbox" checked={p.verified} onChange={(e) => setProfile(p, { verified: e.target.checked })} /> Vérifié</label>
              <label className="ck"><input type="checkbox" checked={p.paused} onChange={(e) => setProfile(p, { paused: e.target.checked })} /> Masqué</label>
              {sure === "p" + p.id
                ? <><button className="btn" onClick={() => del(p.id)}>Confirmer</button><button className="btn ghost" onClick={() => setSure("")}>Annuler</button></>
                : <button className="btn ghost" aria-label={`Supprimer ${p.name}`} onClick={() => setSure("p" + p.id)}>🗑</button>}
            </div>))}
        </div>)}

        {tab === "messages" && (<div style={{ display: "grid", gap: 12 }}>
          {messages.length === 0 && <p className="note">Aucun message.</p>}
          {messages.map((m) => (
            <div className="dcard" key={m.id} style={{ display: "grid", gap: 6, opacity: m.done ? 0.6 : 1 }}>
              <div><b>{m.subject}</b> · <span className="note">{fmt(m.created_at)}</span></div>
              <div>{m.name} · <a href={`mailto:${m.contact}`}>{m.contact}</a></div>
              <p style={{ margin: 0, whiteSpace: "pre-wrap" }}>{m.body}</p>
              <div className="acts"><button className="btn ghost" onClick={() => mark("messages", m.id, { done: !m.done })}>{m.done ? "Rouvrir" : "✓ Marquer traité"}</button></div>
            </div>))}
        </div>)}

        {tab === "assos" && (<div style={{ display: "grid", gap: 10 }}>
          <p className="note" style={{ margin: 0 }}>Avant de valider : appelle ou écris à l’association pour vérifier qu’elle existe vraiment. Une modification par l’association la remet en attente.</p>
          {assos.length === 0 && <p className="note">Aucune fiche (ou <code>migration-associations.sql</code> pas encore lancé).</p>}
          {assos.map((a) => (
            <div className="dcard" key={a.id} style={{ display: "grid", gap: 6 }}>
              <div><b>{a.name}</b> · {a.city} · <span className="note">{fmt(a.created_at)} · {a.status === "pending" ? "⏳ en attente" : a.status === "approved" ? "✅ publiée" : "❌ refusée"}</span></div>
              <div className="note">{[a.phone, a.email, a.site, a.address].filter(Boolean).join(" · ") || "Aucun contact"}</div>
              {a.description && <p style={{ margin: 0, whiteSpace: "pre-wrap" }}>{a.description}</p>}
              <input placeholder="Motif du refus (visible par l’association)" maxLength={300} value={rej[a.id] || ""} onChange={(e) => setRej({ ...rej, [a.id]: e.target.value })} />
              <div className="acts">
                {a.status !== "approved" && <button className="btn" onClick={() => setAsso(a, "approved")}>✓ Valider</button>}
                {a.status !== "rejected" && <button className="btn ghost" onClick={() => setAsso(a, "rejected")}>✕ Refuser</button>}
                <Link className="btn ghost" href={`/associations/${a.slug}`}>Voir</Link>
              </div>
            </div>))}
        </div>)}

        {tab === "clients" && (<div style={{ display: "grid", gap: 10 }}>
          <p className="note" style={{ margin: 0 }}>Signalements de numéros faits par les profils. Les numéros sont conservés sous forme d’empreinte : ils ne sont pas lisibles ici.</p>
          {clients.length === 0 && <p className="note">Aucun signalement de client (ou <code>migration-clients-signales.sql</code> pas encore lancé).</p>}
          {clients.map((c) => (
            <div className="dcard" key={c.id} style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap", padding: "10px 16px" }}>
              <div style={{ flex: "1 1 240px", minWidth: 0 }}><b>{MOTIFS[c.category] || c.category}</b> · <span className="note">{fmt(c.created_at)} · par {c.profiles?.name || "profil supprimé"}</span>{c.note && <div style={{ whiteSpace: "pre-wrap" }}>{c.note}</div>}</div>
              <button className="btn ghost" onClick={() => delClient(c.id)}>🗑 Supprimer</button>
            </div>))}
        </div>)}

        {tab === "journal" && (<div style={{ display: "grid", gap: 10 }}>
          {journal.length === 0 && <p className="note">Journal vide (ou <code>migration-journal-admin.sql</code> pas encore lancé).</p>}
          {journal.map((j) => (
            <div className="dcard" key={j.id} style={{ padding: "10px 16px" }}><b>{j.action}</b> · <span className="note">{fmt(j.created_at)} · {ago(j.created_at)}</span>
              <div className="note">{j.details?.nom || j.details?.name || ""}{j.action === "suppression" && ` · identifiant du journal : ${j.id}`}</div></div>))}
        </div>)}
      </main>
    </div>
  );
}
