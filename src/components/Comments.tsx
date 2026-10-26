"use client";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";

type C = { id: number; author_id: string; author_name: string; body: string; created_at: string };
const fmtD = (t: string) => new Date(t).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });

export default function Comments({ profileId, ownerId }: { profileId: string; ownerId: string }) {
  const sb = supabaseBrowser();
  const [list, setList] = useState<C[]>([]); const [me, setMe] = useState<{ id: string; name: string } | null>(null);
  const [txt, setTxt] = useState(""); const [err, setErr] = useState(""); const [busy, setBusy] = useState(false);
  const load = useCallback(async () => {
    const { data } = await sb.from("comments").select("*").eq("profile_id", profileId).order("created_at", { ascending: true });
    setList((data || []) as C[]);
  }, [profileId]);
  useEffect(() => { (async () => {
    await load();
    const { data: { user } } = await sb.auth.getUser(); if (!user) return;
    const { data: m } = await sb.from("members").select("pseudo").eq("id", user.id).maybeSingle();
    if (m) { setMe({ id: user.id, name: m.pseudo }); return; }
    const { data: p } = await sb.from("profiles").select("name").eq("id", user.id).maybeSingle();
    setMe({ id: user.id, name: p?.name || "" });
  })(); }, [load]);
  async function post() {
    if (!me || !txt.trim()) return; setBusy(true); setErr("");
    const { error } = await sb.from("comments").insert({ profile_id: profileId, author_id: me.id, author_name: me.name, body: txt.trim() });
    setBusy(false); if (error) setErr("Impossible de publier : " + error.message); else { setTxt(""); load(); }
  }
  async function del(id: number) { await sb.from("comments").delete().eq("id", id); load(); }
  return (
    <section className="panel cm" id="cm">
      <h2>Commentaires ({list.length})</h2>
      {list.length ? list.map((c) => (
        <div className="cmi" key={c.id}><header>{c.author_name}<time>{fmtD(c.created_at)}</time>
          {(me?.id === c.author_id || me?.id === ownerId) && <button className="cmx" onClick={() => del(c.id)}>Supprimer</button>}</header><p>{c.body}</p></div>
      )) : <p className="note">Aucun commentaire pour le moment.</p>}
      {me && me.name ? (<>
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
