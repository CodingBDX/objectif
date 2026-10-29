"use client";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import { logSec, HONEYPOT } from "@/lib/secEvent";

type C = { id: number; author_id: string; author_name: string; body: string; created_at: string; parent_id?: number | null };
const PAGE = 5;
const Flag = ({ n }: { n?: number }) => n ? <span className="cmflag" title={`Numéro signalé par ${n} profil${n > 1 ? "s" : ""}`}>🚩 Signalé · {n} signalement{n > 1 ? "s" : ""}</span> : null;
const fmtD = (t: string) => new Date(t).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });

export default function Comments({ profileId, ownerId }: { profileId: string; ownerId: string }) {
  const sb = supabaseBrowser();
  const [list, setList] = useState<C[]>([]); const [flag, setFlag] = useState<Record<string, number>>({}); const [noPhone, setNoPhone] = useState(false); const [me, setMe] = useState<{ id: string; name: string } | null>(null);
  const [rep, setRep] = useState<number | null>(null); const [rtxt, setRtxt] = useState("");
  const [shown, setShown] = useState(PAGE); const sentinel = useRef<HTMLDivElement>(null);
  const [txt, setTxt] = useState(""); const [err, setErr] = useState(""); const [busy, setBusy] = useState(false);
  const load = useCallback(async () => {
    const { data } = await sb.from("comments").select("*").eq("profile_id", profileId).order("created_at", { ascending: true });
    setList((data || []) as C[]);
    const ids = Array.from(new Set(((data || []) as C[]).map((c) => c.author_id)));
    if (ids.length) { const { data: fl } = await sb.rpc("flagged_authors", { p_ids: ids }); setFlag(Object.fromEntries(((fl || []) as { author_id: string; signalements: number }[]).map((x) => [x.author_id, x.signalements]))); }
  }, [profileId]);
  useEffect(() => { (async () => {
    await load();
    const { data: { user } } = await sb.auth.getUser(); if (!user) return;
    const { data: m } = await sb.from("members").select("pseudo,phone_hash").eq("id", user.id).maybeSingle();
    if (m) { setMe({ id: user.id, name: m.pseudo }); setNoPhone(!m.phone_hash); return; }
    const { data: p } = await sb.from("profiles").select("name").eq("id", user.id).maybeSingle();
    setMe({ id: user.id, name: p?.name || "" });
  })(); }, [load]);
  const tops = list.filter((c) => !c.parent_id);
  useEffect(() => {
    const el = sentinel.current; if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver((es) => { if (es[0].isIntersecting) setShown((n) => Math.min(n + PAGE, tops.length)); }, { rootMargin: "300px" });
    io.observe(el); return () => io.disconnect();
  }, [shown, tops.length]);
  async function post() {
    if (!me || !txt.trim()) return; if (document.querySelector<HTMLInputElement>(".hpf")?.value) { logSec("piege_commentaire", ""); setTxt(""); return; } setBusy(true); setErr("");
    const { error } = await sb.from("comments").insert({ profile_id: profileId, author_id: me.id, author_name: me.name, body: txt.trim() });
    setBusy(false); if (error) setErr("Impossible de publier : " + error.message); else { setTxt(""); load(); }
  }
  async function reply(parent: number) {
    if (!me || !rtxt.trim()) return; if (document.querySelector<HTMLInputElement>(".hpf")?.value) { logSec("piege_commentaire", ""); setRtxt(""); setRep(null); return; } setBusy(true); setErr("");
    const { error } = await sb.from("comments").insert({ profile_id: profileId, author_id: me.id, author_name: me.name, body: rtxt.trim(), parent_id: parent });
    setBusy(false); if (error) setErr("Impossible de répondre : " + error.message); else { setRtxt(""); setRep(null); load(); }
  }
  async function del(id: number) { await sb.from("comments").delete().eq("id", id); load(); }
  return (
    <section className="panel cm" id="cm">
      <h2>Commentaires ({list.length})</h2>
      {list.length ? tops.slice(0, shown).map((c, i) => {
        const kids = list.filter((r) => r.parent_id === c.id); const mine = me?.id === ownerId;
        return (<div className="cmt pop" key={c.id} style={{ animationDelay: (i % PAGE) * 45 + "ms" }}>
          <div className={`cmi${c.author_id === ownerId ? " own" : ""}${flag[c.author_id] ? " flagged" : ""}`}><header>{c.author_name}<Flag n={flag[c.author_id]} />{c.author_id === ownerId && <span className="cmo">Profil</span>}<time>{fmtD(c.created_at)}</time>
            {mine && c.author_id !== ownerId && <button className="cmr" onClick={() => { setRep(rep === c.id ? null : c.id); setRtxt(""); }}>Répondre</button>}
            {(me?.id === c.author_id || me?.id === ownerId) && <button className="cmx" onClick={() => del(c.id)}>Supprimer</button>}</header><p>{c.body}</p></div>
          {kids.map((r) => <div className={`cmi reply${flag[r.author_id] ? " flagged" : ""}`} key={r.id}><header>{r.author_name}<Flag n={flag[r.author_id]} /><span className="cmo">Réponse du profil</span><time>{fmtD(r.created_at)}</time>
            {(me?.id === r.author_id || me?.id === ownerId) && <button className="cmx" onClick={() => del(r.id)}>Supprimer</button>}</header><p>{r.body}</p></div>)}
          {rep === c.id && <div className="cmi reply rform"><textarea maxLength={500} value={rtxt} autoFocus onChange={(e) => setRtxt(e.target.value)} placeholder={`Ta réponse à ${c.author_name}…`} aria-label={`Répondre à ${c.author_name}`} />
            <div><button className="btn" onClick={() => reply(c.id)} disabled={busy}>Publier la réponse</button> <button className="btn ghost" onClick={() => setRep(null)}>Annuler</button></div></div>}
        </div>);
      }) : <p className="note">Aucun commentaire pour le moment.</p>}
      {shown < tops.length && <div className="more" ref={sentinel}><i /><i /><i /><span>{tops.length - shown} commentaire{tops.length - shown > 1 ? "s" : ""} à venir</span><button className="btn ghost" type="button" onClick={() => setShown((n) => n + PAGE)}>Voir plus</button></div>}
      {me && me.name && noPhone ? (<>
        <p className="note" role="alert" style={{ color: "var(--btn)", fontWeight: 700 }}>Ajoute ton numéro de téléphone pour pouvoir commenter.</p>
        <div><Link className="btn" href="/mon-profil">Ajouter mon numéro</Link></div>
      </>) : me && me.name ? (<>
        <input {...HONEYPOT} defaultValue="" />
        <label className="f">Commenter en tant que {me.name || "moi"}<textarea maxLength={500} value={txt} onChange={(e) => setTxt(e.target.value)} placeholder="Votre commentaire respectueux…" /></label>
        {err && <p className="note" role="alert" style={{ color: "var(--btn)", fontWeight: 700 }}>{err}</p>}
        <div><button className="btn" onClick={post} disabled={busy}>Publier le commentaire</button></div>
      </>) : (<>
        <p className="note">Seuls les profils membres peuvent commenter.</p>
        <div><Link className="btn" href={me ? "/mon-profil" : "/connexion?inscription=1"}>Créer un profil membre</Link></div>
      </>)}
    </section>
  );
}
