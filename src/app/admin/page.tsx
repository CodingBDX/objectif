"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase/client";
import { CATS } from "@/lib/types";

type Tab = "reports" | "profiles" | "messages";
const fmt = (t: string) => new Date(t).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });

export default function Admin() {
  const sb = supabaseBrowser();
  const [state, setState] = useState<"load" | "no" | "ok">("load");
  const [tab, setTab] = useState<Tab>("reports");
  const [reports, setReports] = useState<any[]>([]); const [profiles, setProfiles] = useState<any[]>([]); const [messages, setMessages] = useState<any[]>([]);
  const [q, setQ] = useState(""); const [onlyNew, setOnlyNew] = useState(true); const [sure, setSure] = useState(""); const [err, setErr] = useState("");

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

  useEffect(() => { (async () => {
    const { data: { user } } = await sb.auth.getUser();
    if (!user) { location.href = "/connexion"; return; }
    const { data } = await sb.from("admins").select("id").eq("id", user.id).maybeSingle();
    if (!data) { setState("no"); return; }
    setState("ok"); loadReports(); loadMessages();
  })(); }, []);
  useEffect(() => { if (state === "ok") loadProfiles(); }, [state, loadProfiles]);

  async function setProfile(p: any, patch: Partial<{ vip: boolean; verified: boolean; paused: boolean }>) {
    setErr(""); const n = { vip: p.vip, verified: p.verified, paused: p.paused, ...patch };
    const { error } = await sb.rpc("admin_set_profile", { p_id: p.id, p_vip: n.vip, p_verified: n.verified, p_paused: n.paused });
    if (error) setErr(error.message); else { loadProfiles(); loadReports(); }
  }
  async function del(id: string) {
    setErr(""); const { error } = await sb.rpc("admin_delete_profile", { p_id: id }); setSure("");
    if (error) setErr(error.message); else { loadProfiles(); loadReports(); }
  }
  async function mark(table: "reports" | "messages", id: number, v: any) { await sb.from(table).update(v).eq("id", id); table === "reports" ? loadReports() : loadMessages(); }

  if (state === "load") return <section className="gut"><p className="note" style={{ minHeight: 400, opacity: 0 }} aria-busy="true">Chargement…</p></section>;
  if (state === "no") return (
    <section className="gut"><div className="pfc" style={{ maxWidth: 560 }}><div className="panel regp"><h1 className="regh">Accès réservé</h1>
      <p className="note">Ce compte n’est pas administrateur. Pour te donner l’accès, ajoute ton compte dans la table « admins » (voir le fichier migration-admin.sql).</p>
      <Link className="btn ghost" href="/">← Retour à l’annuaire</Link></div></div></section>);

  const nNew = reports.filter((r) => r.status === "nouveau").length, nMsg = messages.filter((m) => !m.done).length;
  const shownReports = reports.filter((r) => !onlyNew || r.status === "nouveau");
  const chip = (t: Tab, label: string) => <button type="button" className="chip" aria-pressed={tab === t} onClick={() => setTab(t)}>{label}</button>;

  return (
    <section className="gut">
      <div className="pbar"><Link className="btn ghost" href="/">← Retour à l’annuaire</Link><strong className="pbn">Administration</strong></div>
      <div className="pfc">
        <div className="mchips" style={{ display: "flex", margin: "0 0 14px" }}>
          {chip("reports", `🚩 Signalements${nNew ? ` (${nNew})` : ""}`)}{chip("profiles", "👤 Profils")}{chip("messages", `✉ Messages${nMsg ? ` (${nMsg})` : ""}`)}
        </div>
        {err && <p className="note" role="alert" style={{ color: "var(--btn)", fontWeight: 700 }}>{err}</p>}

        {tab === "reports" && (<div style={{ display: "grid", gap: 12 }}>
          <label className="ck"><input type="checkbox" checked={onlyNew} onChange={(e) => setOnlyNew(e.target.checked)} /> Seulement les nouveaux</label>
          {shownReports.length === 0 && <p className="note">Aucun signalement.</p>}
          {shownReports.map((r) => (
            <div className="panel" key={r.id} style={{ display: "grid", gap: 6 }}>
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
            <div className="panel" key={p.id} style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap", padding: "10px 16px" }}>
              <div style={{ flex: "1 1 200px", minWidth: 0 }}><Link href={`/profil/${p.id}`}><b>{p.name}</b></Link><div className="note">{CATS[p.genre]} · {p.city} · {fmt(p.created_at)}{p.paused && " · masqué"}</div></div>
              <label className="ck"><input type="checkbox" checked={p.vip} onChange={(e) => setProfile(p, { vip: e.target.checked })} /> VIP</label>
              <label className="ck"><input type="checkbox" checked={p.verified} onChange={(e) => setProfile(p, { verified: e.target.checked })} /> Vérifié</label>
              <label className="ck"><input type="checkbox" checked={p.paused} onChange={(e) => setProfile(p, { paused: e.target.checked })} /> Masqué</label>
              {sure === "p" + p.id
                ? <><button className="btn" onClick={() => del(p.id)}>Confirmer</button><button className="btn ghost" onClick={() => setSure("")}>Annuler</button></>
                : <button className="btn ghost" onClick={() => setSure("p" + p.id)}>🗑</button>}
            </div>))}
        </div>)}

        {tab === "messages" && (<div style={{ display: "grid", gap: 12 }}>
          {messages.length === 0 && <p className="note">Aucun message.</p>}
          {messages.map((m) => (
            <div className="panel" key={m.id} style={{ display: "grid", gap: 6, opacity: m.done ? 0.6 : 1 }}>
              <div><b>{m.subject}</b> · <span className="note">{fmt(m.created_at)}</span></div>
              <div>{m.name} · <a href={`mailto:${m.contact}`}>{m.contact}</a></div>
              <p style={{ margin: 0, whiteSpace: "pre-wrap" }}>{m.body}</p>
              <div className="acts"><button className="btn ghost" onClick={() => mark("messages", m.id, { done: !m.done })}>{m.done ? "Rouvrir" : "✓ Marquer traité"}</button></div>
            </div>))}
        </div>)}
      </div>
    </section>
  );
}
