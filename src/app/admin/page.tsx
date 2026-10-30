"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import CountUp from "@/components/CountUp";
import { supabaseBrowser } from "@/lib/supabase/client";
import { CATS, SPECIALTIES } from "@/lib/types";
import { refreshListings } from "@/app/actions";

type Tab = "dash" | "profiles" | "reports" | "messages" | "specs" | "clients" | "assos" | "journal" | "lodgings" | "verifs" | "secu" | "membres" | "mails";
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
  const [verifs, setVerifs] = useState<any[]>([]); const [ai, setAi] = useState<Record<string, any>>({});
  const [lodgs, setLodgs] = useState<any[]>([]); const [lAddr, setLAddr] = useState<Record<string, string>>({});
  const [vipEnd, setVipEnd] = useState<Record<string, { until: string; paused_at: string | null }>>({});
  const [assos, setAssos] = useState<any[]>([]); const [clients, setClients] = useState<any[]>([]); const [journal, setJournal] = useState<any[]>([]); const [secEv, setSecEv] = useState<any[]>([]); const [membres, setMembres] = useState<any[]>([]); const [mver, setMver] = useState<Record<string, boolean>>({});
  const [daily, setDaily] = useState<{ day: string; views: number; calls: number }[]>([]); const [dailyErr, setDailyErr] = useState(false);
  const [cnt, setCnt] = useState<{ total: number; vip: number; paused: number; month: number; g: Record<string, number> }>({ total: 0, vip: 0, paused: 0, month: 0, g: {} });
  const [specs, setSpecs] = useState<string[]>([]); const [specDb, setSpecDb] = useState(true); const [specEd, setSpecEd] = useState<Record<string, string>>({}); const [specNew, setSpecNew] = useState(""); const [specUse, setSpecUse] = useState<Record<string, number>>({}); const [specOk, setSpecOk] = useState("");
  const [doms, setDoms] = useState<string[]>([]); const [domNew, setDomNew] = useState(""); const [domErr, setDomErr] = useState(""); const [domQ, setDomQ] = useState("");
  const loadDoms = useCallback(async () => { const { data, error } = await sb.from("disposable_domains").select("domain").order("domain").limit(5000); if (error) { setDomErr("Lance d’abord migration-email-jetables.sql dans Supabase."); return; } setDomErr(""); setDoms((data || []).map((x: any) => x.domain)); }, []);
  useEffect(() => { if (state === "ok" && tab === "mails") loadDoms(); }, [state, tab, loadDoms]);
  const [rej, setRej] = useState<Record<string, string>>({}); const [q, setQ] = useState(""); const [onlyNew, setOnlyNew] = useState(true); const [sure, setSure] = useState(""); const [err, setErr] = useState("");

  const loadReports = useCallback(async () => {
    const { data } = await sb.from("reports").select("*, profiles(id,name,city,paused,vip,verified)").order("created_at", { ascending: false }).limit(300); setReports(data || []);
  }, []);
  const loadProfiles = useCallback(async () => {
    let qq = sb.from("profiles").select("id,name,city,genre,vip,verified,paused,created_at,crown,crown_forced,points,street,zone,zone_map,zone_map_blocked").order("created_at", { ascending: false }).limit(200);
    if (q.trim()) qq = qq.ilike("name", `%${q.trim()}%`);
    const { data } = await qq; setProfiles(data || []);
    const { data: ve } = await sb.from("vip_until").select("profile_id,until,paused_at"); setVipEnd(Object.fromEntries((ve || []).map((x: any) => [x.profile_id, x])));
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
    { const mm = await sb.from("members").select("id,pseudo,created_at").order("created_at", { ascending: false }).limit(500); setMembres(mm.error ? [] : mm.data || []); const mv = await sb.from("member_verified").select("member_id"); setMver(Object.fromEntries((mv.data || []).map((x: any) => [x.member_id, true]))); }
    { const se = await sb.from("security_events").select("id,kind,detail,created_at").order("created_at", { ascending: false }).limit(300); setSecEv(se.error ? [] : se.data || []); }
    const a = await sb.from("client_reports").select("id,category,note,created_at,profiles(name)").order("created_at", { ascending: false }).limit(200); setClients(a.error ? [] : a.data || []);
    const v = await sb.from("verif_requests").select("profile_id,path,status,created_at,profiles(name,city)").eq("status", "pending").order("created_at"); 
    const vr = v.error ? [] : (v.data || []) as any[];
    setVerifs(await Promise.all(vr.map(async (x) => ({ ...x, url: x.path ? (await sb.storage.from("verif").createSignedUrl(x.path, 600)).data?.signedUrl : null }))));
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
  async function blockZoneMap(p: any, blocked: boolean) { setErr(""); const { error } = await sb.rpc("admin_block_zone_map", { p_id: p.id, p_blocked: blocked }); if (error) setErr(error.message); else loadProfiles(); }
  const zoneBtn = (p: any) => p.street ? <span className="ck" title="Carte de la zone de travail (rue) sur la page du profil">📍 {p.zone || "zone"}{p.zone_map ? " · carte demandée" : " · sans carte"} : <button type="button" className="btn ghost" onClick={() => blockZoneMap(p, !p.zone_map_blocked)}>{p.zone_map_blocked ? "Carte bloquée · débloquer" : "Bloquer la carte"}</button></span> : null;
  const loadLodgs = useCallback(async () => {
    const { data } = await sb.from("lodgings").select("*").order("updated_at", { ascending: false }).limit(200); const l = data || [];
    const ids = l.map((x: any) => x.profile_id);
    const [{ data: ps }, { data: ad }] = await Promise.all([ids.length ? sb.from("profiles").select("id,name,vip,verified").in("id", ids) : Promise.resolve({ data: [] as any[] }), ids.length ? sb.from("lodging_private").select("profile_id,address").in("profile_id", ids) : Promise.resolve({ data: [] as any[] })]);
    const nm = new Map((ps || []).map((x: any) => [x.id, x]));
    setLodgs(l.map((x: any) => ({ ...x, owner: nm.get(x.profile_id) }))); setLAddr(Object.fromEntries((ad || []).map((a: any) => [a.profile_id, a.address])));
  }, []);
  useEffect(() => { if (state === "ok") loadLodgs(); }, [state, loadLodgs]);
  async function setLodg(id: string, status: string) {
    setErr(""); const { error } = await sb.rpc("admin_set_lodging", { p_id: id, p_status: status }); if (error) { setErr(error.message); return; }
    loadLodgs();
    if (status === "approved") { try { const r = await fetch("/api/alerte-logement", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ id }) }); const j = await r.json(); if (!r.ok) setErr("Alertes non envoyées : " + (j.error || r.status)); else if (j.sent) setErr(`✉️ ${j.sent} alerte(s) e-mail envoyée(s).`); } catch { setErr("Alertes non envoyées (erreur réseau)."); } }
  }
  async function giveVip(id: string, days: number) {
    setErr(""); const { error } = await sb.rpc("admin_set_vip", { p_id: id, p_days: days });
    if (error) setErr(error.message); else { loadProfiles(); loadCounts(); loadExtra(); }
  }
  const vipBtns = (p: any) => <span className="vipadm">{p.vip && <small className="note">{vipEnd[p.id] ? `jusqu’au ${fmt(vipEnd[p.id].until)}${vipEnd[p.id].paused_at ? " (gelé, en pause)" : ""}` : "sans fin"}</small>}
    {[2, 5, 30].map((d) => <button key={d} type="button" className="btn ghost" onClick={() => giveVip(p.id, d)}>+{d} j</button>)}</span>;
  async function setCrown(id: string, v: string) {
    setErr(""); const { error } = await sb.rpc("admin_set_crown", { p_id: id, p_level: v === "auto" ? null : Number(v) });
    if (error) setErr(error.message); else loadProfiles();
  }
  async function addPts(id: string, n: number) {
    setErr(""); const { error } = await sb.rpc("admin_add_points", { p_id: id, p_pts: n });
    if (error) setErr(error.message); else loadProfiles();
  }
  const crownBtns = (p: any) => <span className="vipadm" title="Couronne et points de fidélité">
    <small className="note">👑 {p.points || 0} pts</small>
    <select aria-label="Couronne" value={p.crown_forced === null || p.crown_forced === undefined ? "auto" : String(p.crown_forced)} onChange={(e) => setCrown(p.id, e.target.value)}>
      <option value="auto">Couronne : auto{!(p.crown_forced ?? null) && p.crown ? ` (${["", "Bronze", "Argent", "Or", "Diamant"][p.crown]})` : ""}</option><option value="0">Aucune</option><option value="1">Bronze</option><option value="2">Argent</option><option value="3">Or</option><option value="4">Diamant</option></select>
    {[-50, 50, 100].map((n) => <button key={n} type="button" className="btn ghost" onClick={() => addPts(p.id, n)}>{n > 0 ? "+" : ""}{n} pts</button>)}</span>;
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
  async function loadSpecs() {
    const { data, error } = await sb.from("specialties").select("name").order("position").order("name");
    if (error) { setSpecDb(false); setSpecs(SPECIALTIES); return; } setSpecDb(true); setSpecs((data || []).map((r: any) => r.name)); setSpecEd({});
    const u = await sb.from("profiles").select("specialties").limit(5000); const c: Record<string, number> = {};
    (u.data || []).forEach((p: any) => (p.specialties || []).forEach((x: string) => { c[x] = (c[x] || 0) + 1; })); setSpecUse(c);
  }
  useEffect(() => { if (state === "ok") loadSpecs(); }, [state]);
  async function specCall(fn: string, args: Record<string, unknown>, ok: string) {
    setErr(""); setSpecOk(""); const { error } = await sb.rpc(fn, args);
    if (error) { setErr(error.message); return; } setSpecOk(ok); setSure(""); await loadSpecs(); await refreshListings(); loadExtra();
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
  async function analyse(x: any) {
    setAi((a) => ({ ...a, [x.profile_id]: { wait: true } }));
    try { const r = await fetch("/api/verif-ai", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ path: x.path }) }); const j = await r.json(); setAi((a) => ({ ...a, [x.profile_id]: r.ok ? j : { error: j.error || "Erreur" } })); }
    catch { setAi((a) => ({ ...a, [x.profile_id]: { error: "Erreur réseau" } })); }
  }
  async function decideVerif(x: any, ok: boolean) {
    setErr(""); const { error } = await sb.rpc("admin_decide_verif", { p_id: x.profile_id, p_ok: ok, p_note: ok ? "" : (rej["v" + x.profile_id] || "") });
    if (error) { setErr(error.message); return; }
    if (x.path) await sb.storage.from("verif").remove([x.path]);
    setVerifs((l) => l.filter((y) => y.profile_id !== x.profile_id)); loadProfiles(); refreshListings();
  }
  const nav = (t: Tab, label: string, badge = 0) => <a href={`#${t}`} className={tab === t ? "on" : ""} aria-current={tab === t ? "page" : undefined} onClick={(e) => { e.preventDefault(); setTab(t); }}>{label}{badge > 0 && <b style={{ marginLeft: "auto", background: "var(--pink)", color: "#fff", borderRadius: 999, padding: "1px 8px", fontSize: 12 }}>{badge}</b>}</a>;
  const title: Record<Tab, string> = { dash: "Tableau de bord", profiles: "Profils", reports: "Signalements", messages: "Messages", specs: "Spécialités", clients: "Clients signalés", assos: "Associations", journal: "Journal des actions", secu: "Sécurité", membres: "Membres", verifs: "Demandes de vérification", lodgings: "Logements" };

  return (
    <div className="dash gut">
      <aside className="dside">
        <div className="dav">A</div>
        <div className="dhi">Administration</div>
        <nav>
          {nav("dash", "📊 Tableau de bord")}{nav("profiles", "👤 Profils")}{nav("reports", "🚩 Signalements", nNew)}{nav("messages", "✉️ Messages", nMsg)}{nav("specs", "🏷 Spécialités")}
          {nav("assos", "🤝 Associations", assos.filter((a) => a.status === "pending").length)}{nav("clients", "🛡️ Clients signalés")}{nav("journal", "📜 Journal")}{nav("membres", "👥 Membres")}{nav("mails", "📧 E-mails bloqués")}{nav("secu", "🔒 Sécurité", secEv.filter((x) => Date.now() - new Date(x.created_at).getTime() < 864e5).length)}{nav("verifs", "✅ Vérifications", verifs.length)}{nav("lodgings", "🏠 Logements", lodgs.filter((x) => x.status === "pending").length)}
          <Link href="/">📖 Annuaire</Link>
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
                  <label className="ck"><input type="checkbox" checked={p.vip} onChange={(e) => setProfile(p, { vip: e.target.checked })} /> VIP</label>{vipBtns(p)}{crownBtns(p)}{zoneBtn(p)}
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
              <label className="ck"><input type="checkbox" checked={p.vip} onChange={(e) => setProfile(p, { vip: e.target.checked })} /> VIP</label>{vipBtns(p)}{crownBtns(p)}{zoneBtn(p)}
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

        {tab === "mails" && (<div style={{ display: "grid", gap: 10 }}>
          <p className="note" style={{ margin: 0 }}>Les inscriptions avec ces domaines d’e-mail (jetables) sont refusées, sous-domaines compris. {doms.length} domaine{doms.length > 1 ? "s" : ""} bloqué{doms.length > 1 ? "s" : ""}.</p>
          {domErr && <p className="note" role="alert" style={{ margin: 0, color: "var(--btn)", fontWeight: 700 }}>{domErr}</p>}
          <form className="dcard" style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", padding: "10px 16px" }}
            onSubmit={async (e) => { e.preventDefault(); const d = domNew.trim().toLowerCase().replace(/^.*@/, "").replace(/^https?:\/\//, "").replace(/\/.*$/, ""); if (!/^[a-z0-9.-]+\.[a-z]{2,}$/.test(d)) { setDomErr("Domaine invalide (ex. mailinator.com)."); return; } const { error } = await sb.from("disposable_domains").upsert({ domain: d }); if (error) setDomErr(error.message); else { setDomNew(""); loadDoms(); } }}>
            <input style={{ flex: "1 1 220px" }} placeholder="Domaine à bloquer, ex. mailinator.com" value={domNew} onChange={(e) => setDomNew(e.target.value)} aria-label="Domaine à bloquer" />
            <button className="btn" type="submit">Bloquer</button>
          </form>
          <input placeholder="Rechercher un domaine…" value={domQ} onChange={(e) => setDomQ(e.target.value)} aria-label="Rechercher un domaine" />
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {doms.filter((d) => d.includes(domQ.trim().toLowerCase())).map((d) => <span key={d} className="gchip" style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>{d}
              <button type="button" aria-label={`Débloquer ${d}`} title="Débloquer" style={{ border: 0, background: "none", cursor: "pointer", color: "inherit", font: "inherit", padding: 0 }} onClick={async () => { await sb.from("disposable_domains").delete().eq("domain", d); loadDoms(); }}>✕</button></span>)}
          </div>
        </div>)}
        {tab === "specs" && (<div style={{ display: "grid", gap: 10 }}>
          {!specDb && <p className="note" role="alert" style={{ margin: 0, color: "var(--btn)", fontWeight: 700 }}>Lance d’abord <code>migration-specialites-admin.sql</code> dans Supabase pour pouvoir modifier la liste.</p>}
          <p className="note" style={{ margin: 0 }}>Renommer change le mot partout, y compris sur les profils qui l’avaient choisi. Supprimer le retire aussi des profils. L’ordre ici est celui de la page « Mon profil ». {specs.length} spécialité{specs.length > 1 ? "s" : ""}.</p>
          {specOk && <p className="note" role="status" style={{ margin: 0, fontWeight: 700 }}>✓ {specOk}</p>}
          <form className="dcard" style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", padding: "10px 16px" }}
            onSubmit={(e) => { e.preventDefault(); const n = specNew.trim(); if (n) specCall("admin_add_specialty", { p_name: n }, `« ${n} » ajoutée`).then(() => setSpecNew("")); }}>
            <input aria-label="Nouvelle spécialité" placeholder="Nouvelle spécialité…" maxLength={40} value={specNew} onChange={(e) => setSpecNew(e.target.value)} style={{ flex: "1 1 220px" }} disabled={!specDb} />
            <button className="btn" disabled={!specDb || !specNew.trim()}>＋ Ajouter</button>
          </form>
          {specs.map((x, i) => { const v = specEd[x] ?? x; const changed = v.trim() !== x && !!v.trim(); return (
            <div className="dcard" key={x} style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", padding: "8px 16px" }}>
              <input aria-label={`Nom de la spécialité ${x}`} maxLength={40} value={v} disabled={!specDb} style={{ flex: "1 1 200px" }}
                onChange={(e) => setSpecEd({ ...specEd, [x]: e.target.value })}
                onKeyDown={(e) => { if (e.key === "Enter" && changed) specCall("admin_rename_specialty", { p_old: x, p_new: v.trim() }, `« ${x} » renommée en « ${v.trim()} »`); }} />
              <span className="note" style={{ whiteSpace: "nowrap" }}>{specUse[x] || 0} profil{(specUse[x] || 0) > 1 ? "s" : ""}</span>
              {changed && <button className="btn" onClick={() => specCall("admin_rename_specialty", { p_old: x, p_new: v.trim() }, `« ${x} » renommée en « ${v.trim()} »`)}>✓ Renommer</button>}
              <button className="btn ghost" aria-label={`Monter ${x}`} disabled={!specDb || i === 0} onClick={() => specCall("admin_move_specialty", { p_name: x, p_dir: -1 }, `« ${x} » déplacée`)}>↑</button>
              <button className="btn ghost" aria-label={`Descendre ${x}`} disabled={!specDb || i === specs.length - 1} onClick={() => specCall("admin_move_specialty", { p_name: x, p_dir: 1 }, `« ${x} » déplacée`)}>↓</button>
              {sure === "s" + x
                ? <><button className="btn" onClick={() => specCall("admin_delete_specialty", { p_name: x }, `« ${x} » supprimée`)}>Confirmer</button><button className="btn ghost" onClick={() => setSure("")}>Annuler</button></>
                : <button className="btn ghost" aria-label={`Supprimer ${x}`} disabled={!specDb} onClick={() => setSure("s" + x)}>🗑</button>}
            </div>); })}
        </div>)}

        {tab === "verifs" && (<div style={{ display: "grid", gap: 10 }}>
          <p className="note" style={{ margin: 0 }}>Vérifie que la personne tient un papier avec « sex-escorte.com » et la date du jour, visage visible, et qu’elle ressemble aux photos du profil. La photo est supprimée dès ta décision. La pré-analyse est une aide : la décision reste la tienne (elle envoie la photo à l’IA, uniquement quand tu cliques).</p>
          {verifs.length === 0 && <p className="note">Aucune demande en attente.</p>}
          {verifs.map((x) => (
            <div className="dcard" key={x.profile_id} style={{ display: "grid", gap: 8 }}>
              <div><Link href={`/profil/${x.profile_id}`}><b>{x.profiles?.name || "?"}</b></Link> · {x.profiles?.city} · <span className="note">{ago(x.created_at)}</span></div>
              {x.url ? <a href={x.url} target="_blank" rel="noopener noreferrer"><img src={x.url} alt="" style={{ maxWidth: "100%", maxHeight: 420, borderRadius: 12, objectFit: "contain" }} /></a> : <p className="note">Photo introuvable.</p>}
              {(Date.now() - new Date(x.created_at).getTime() > 48 * 36e5) && <div className="note" style={{ color: "var(--btn)", fontWeight: 700 }}>⏰ En attente depuis plus de 48 h : à traiter en priorité.</div>}
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                <button type="button" className="btn ghost" disabled={!!ai[x.profile_id]?.wait} onClick={() => analyse(x)}>{ai[x.profile_id]?.wait ? "Analyse…" : "🤖 Pré-analyse"}</button>
                {ai[x.profile_id]?.error && <span className="note" style={{ color: "var(--btn)" }}>{ai[x.profile_id].error}</span>}
                {ai[x.profile_id] && !ai[x.profile_id].wait && !ai[x.profile_id].error && (() => { const a = ai[x.profile_id]; const ok = a.papier && a.site && a.date && a.visage && !a.doute; return <span style={{ fontWeight: 700 }}>{ok ? "✅ Conforme" : "⚠️ À regarder de près"} · {a.papier ? "✔" : "✘"} papier · {a.site ? "✔" : "✘"} sex-escorte.com · {a.date ? "✔" : "✘"} date · {a.visage ? "✔" : "✘"} visage{a.doute ? " · ⚠ doute" : ""}</span>; })()}
              </div>
              {ai[x.profile_id]?.resume && <div className="note">Lu sur le papier : {ai[x.profile_id].resume}</div>}
              <input placeholder="Motif du refus (facultatif)" maxLength={300} value={rej["v" + x.profile_id] || ""} onChange={(e) => setRej((r) => ({ ...r, ["v" + x.profile_id]: e.target.value }))} />
              <div className="acts"><button className="btn" onClick={() => decideVerif(x, true)}>✓ Vérifier le profil</button><button className="btn ghost" onClick={() => decideVerif(x, false)}>✕ Refuser</button></div>
            </div>))}
        </div>)}

        {tab === "lodgings" && (<div style={{ display: "grid", gap: 10 }}>
          <h2 style={{ margin: 0 }}>Logements</h2>
          {lodgs.length === 0 && <p className="note">Aucun logement pour le moment.</p>}
          {lodgs.map((x) => (
            <div className="dcard" key={x.profile_id} style={{ display: "grid", gap: 8 }}>
              <div><b>{x.title}</b> · {x.city}{x.area ? ` (${x.area})` : ""} · <span className="note">{x.status === "pending" ? "⏳ en attente" : x.status === "approved" ? "✅ publié" : "❌ refusé"}</span></div>
              <div className="note">Propriétaire : <Link href={`/profil/${x.profile_id}`}>{x.owner?.name || "?"}</Link> · {x.owner?.vip ? "VIP" : "non VIP"} · {x.owner?.verified ? "vérifié" : "non vérifié"} · Adresse privée : {lAddr[x.profile_id] || "—"}</div>
              <div className="note">Jour {x.price_day ?? "—"} · Semaine {x.price_week ?? "—"} · Mois {x.price_month ?? "—"}</div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>{(x.photos || []).map((u: string) => <img key={u} src={u} alt="" width={80} height={80} style={{ objectFit: "cover", borderRadius: 8 }} />)}</div>
              {x.description && <p style={{ margin: 0, whiteSpace: "pre-wrap" }}>{x.description}</p>}
              <div className="acts">
                {x.status !== "approved" && <button className="btn" onClick={() => setLodg(x.profile_id, "approved")}>✓ Valider</button>}
                {x.status !== "rejected" && <button className="btn ghost" onClick={() => setLodg(x.profile_id, "rejected")}>✕ Refuser</button>}
                <Link className="btn ghost" href={`/logements/${x.profile_id}`}>Voir</Link>
              </div>
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

        {tab === "membres" && (<div style={{ display: "grid", gap: 10 }}>
          <p className="note" style={{ margin: 0 }}>Les membres peuvent commenter les profils. Donne le badge « ✔ Client vérifié » après avoir contrôlé la personne toi-même (appel ou message). Il s’affiche sous ses commentaires.</p>
          {membres.length === 0 && <p className="note">Aucun membre (ou <code>migration-clients-verifies.sql</code> pas encore lancé).</p>}
          {membres.map((m) => (
            <div className="dcard" key={m.id} style={{ padding: "10px 16px", display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
              <b style={{ flex: 1, minWidth: 120 }}>{m.pseudo}</b>
              <span className="note">{fmt(m.created_at)}</span>
              {mver[m.id] ? <><span className="cmver">✔ Client vérifié</span><button className="btn ghost" onClick={async () => { await sb.from("member_verified").delete().eq("member_id", m.id); setMver({ ...mver, [m.id]: false }); }}>Retirer</button></>
                : <button className="btn" onClick={async () => { const { error } = await sb.from("member_verified").insert({ member_id: m.id }); if (!error) setMver({ ...mver, [m.id]: true }); }}>✔ Vérifier</button>}
            </div>))}
        </div>)}
        {tab === "secu" && (() => {
          const day = (x: any) => Date.now() - new Date(x.created_at).getTime() < 864e5;
          const KIND: Record<string, string> = { piege_contact: "🤖 Robot bloqué (contact)", piege_signalement: "🤖 Robot bloqué (signalement)", piege_commentaire: "🤖 Robot bloqué (commentaire)", connexion_echec: "🔑 Connexion échouée", trop_rapide: "⚡ Envoi trop rapide" };
          const by = Object.keys(KIND).map((k) => [k, secEv.filter((x) => x.kind === k && day(x)).length] as const);
          const nouveaux = profiles.filter((p: any) => p.created_at && Date.now() - new Date(p.created_at).getTime() < 7 * 864e5);
          return (<div style={{ display: "grid", gap: 12 }}>
            <div className="dcard"><h3 style={{ marginTop: 0 }}>Dernières 24 h</h3>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>{by.map(([k, n]) => <span key={k} className="chip" style={{ cursor: "default" }}>{KIND[k]} : <b>{n}</b></span>)}</div>
              {secEv.length === 0 && <p className="note">Aucun événement (ou <code>migration-securite.sql</code> pas encore lancé).</p>}</div>
            <div className="dcard"><h3 style={{ marginTop: 0 }}>Nouveaux profils (7 jours) : {nouveaux.length}</h3>
              <div className="note">{nouveaux.slice(0, 40).map((p: any) => `${p.name} (${p.city})`).join(" · ") || "Aucun."}</div></div>
            <div className="dcard"><h3 style={{ marginTop: 0 }}>Derniers événements</h3>
              {secEv.slice(0, 80).map((x) => <div key={x.id} className="note" style={{ padding: "2px 0" }}>{fmt(x.created_at)} · {ago(x.created_at)} — <b>{KIND[x.kind] || x.kind}</b>{x.detail ? ` · ${x.detail}` : ""}</div>)}</div>
          </div>);
        })()}
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
