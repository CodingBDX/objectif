"use client";
import { notifyAdmin } from "@/lib/notifyAdmin";
import { useEffect, useState } from "react";
import Link from "next/link";
import CityInput from "@/components/CityInput";
import { supabaseBrowser } from "@/lib/supabase/client";
import { ASSO_SERVICES } from "@/lib/assos";
import { slug } from "@/lib/site";

type Row = { id: string; slug: string; name: string; city: string; more: string[]; region: string | null; description: string; services: string[]; phone: string | null; email: string | null; site: string | null; address: string | null; hours: string | null; status: "pending" | "approved" | "rejected"; admin_note: string | null };
const EMPTY = { name: "", city: "", description: "", phone: "", email: "", site: "", address: "", hours: "" };
const STATUT = { pending: "⏳ En attente de validation", approved: "✅ Publiée", rejected: "❌ Refusée" } as const;

export default function AssoForm({ onInfo }: { onInfo?: (i: { row: Row | null; name: string }) => void }) {
  const sb = supabaseBrowser();
  const [st, setSt] = useState<"load" | "out" | "ok">("load"); const [uid, setUid] = useState("");
  const [row, setRow] = useState<Row | null>(null);
  const [f, setF] = useState(EMPTY); const [more, setMore] = useState<string[]>([]); const [svc, setSvc] = useState<string[]>([]);
  const [msg, setMsg] = useState<{ t: string; ok?: boolean } | null>(null); const [busy, setBusy] = useState(false); const [sure, setSure] = useState(false);

  useEffect(() => { (async () => {
    const { data: u } = await sb.auth.getUser(); if (!u.user) { setSt("out"); return; }
    setUid(u.user.id);
    const { data } = await sb.from("associations").select("*").eq("owner", u.user.id).maybeSingle();
    if (data) { const r = data as Row; setRow(r); setF({ name: r.name, city: r.city, description: r.description, phone: r.phone || "", email: r.email || "", site: r.site || "", address: r.address || "", hours: r.hours || "" }); setMore(r.more || []); setSvc(r.services || []); }
    setSt("ok");
  })(); }, []);

  const set = (k: keyof typeof EMPTY) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setF({ ...f, [k]: e.target.value });
  async function save(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setMsg(null);
    let site = f.site.trim(); if (site && !/^https?:\/\//i.test(site)) site = "https://" + site;
    const body = {
      name: f.name.trim(), city: f.city.trim(), more: more.map((m) => m.trim()).filter(Boolean).slice(0, 10), description: f.description.trim(), services: svc,
      phone: f.phone.trim() || null, email: f.email.trim() || null, site: site || null, address: f.address.trim() || null, hours: f.hours.trim() || null
    };
    const { data, error } = row
      ? await sb.from("associations").update(body).eq("id", row.id).select("*").single()
      : await sb.from("associations").insert({ ...body, owner: uid, slug: `${slug(f.name)}-${slug(f.city)}-${Math.random().toString(36).slice(2, 6)}` }).select("*").single();
    setBusy(false);
    if (error) { setMsg({ t: "Enregistrement impossible : vérifie les champs (e-mail, site commençant par http…)." }); return; }
    setRow(data as Row); notifyAdmin("association");
    setMsg({ t: "Fiche enregistrée. Elle sera visible du public après validation par notre équipe.", ok: true });
  }
  async function del() { if (!row) return; await sb.from("associations").delete().eq("id", row.id); setRow(null); setF(EMPTY); setMore([]); setSvc([]); setSure(false); setMsg({ t: "Fiche supprimée.", ok: true }); }

  useEffect(() => { onInfo?.({ row, name: f.name }); }, [row, f.name]); // eslint-disable-line react-hooks/exhaustive-deps
  /** Blocs en menus déroulants, comme Mon profil. */
  const toggleCard = (e: React.MouseEvent) => { const h = (e.target as HTMLElement).closest(".acc .dcard > h3") as HTMLElement | null; if (!h) return; const c = h.parentElement!; c.classList.toggle("open"); h.setAttribute("aria-expanded", String(c.classList.contains("open"))); };
  const keyCard = (e: React.KeyboardEvent) => { if ((e.key === "Enter" || e.key === " ") && (e.target as HTMLElement).matches(".acc .dcard > h3")) { e.preventDefault(); toggleCard(e as unknown as React.MouseEvent); } };
  useEffect(() => { document.querySelectorAll<HTMLElement>(".acc .dcard > h3").forEach((h) => { h.tabIndex = 0; h.setAttribute("role", "button"); h.setAttribute("aria-expanded", String(h.parentElement!.classList.contains("open"))); }); });
  if (st === "load") return <p className="note">Chargement…</p>;
  if (st === "out") return (
    <div>
      <section className="dcard"><p className="note" style={{ marginTop: 0 }}>Crée un compte (ou connecte-toi) avec l’e-mail de l’association pour publier ta fiche.</p>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}><Link className="btn" href="/connexion?inscription=1&next=/mon-association">Créer un compte</Link><Link className="btn ghost" href="/connexion?next=/mon-association">Se connecter</Link></div></section>
    </div>);

  return (
    <div>
      {row && <section className="dcard"><b>{STATUT[row.status]}</b>
        {row.status === "rejected" && row.admin_note && <p className="note" style={{ color: "var(--btn)", fontWeight: 700, margin: "6px 0 0" }}>Motif : {row.admin_note}</p>}
        <p className="note" style={{ margin: "6px 0 0" }}>Chaque création ou modification est relue avant d’être publiée.</p></section>}
      <form className="fs acc" style={{ border: 0, padding: 0 }} onSubmit={save} onClick={toggleCard} onKeyDown={keyCard} onInvalidCapture={(e) => (e.target as HTMLElement).closest(".dcard")?.classList.add("open")}>
        <section className="dcard open"><h3>Qui êtes-vous ?</h3>
          <label className="f">Nom de l’association<input required minLength={2} maxLength={80} value={f.name} onChange={set("name")} /></label>
          <label className="f">Présentation<textarea rows={6} maxLength={1500} value={f.description} onChange={set("description")} placeholder="Qui vous êtes, à qui vous vous adressez, comment vous aidez…" /></label>
        </section>
        <section className="dcard"><h3>Où vous trouver ?</h3>
          <div className="f"><span>Ville principale</span><CityInput value={f.city} onChange={(v) => setF({ ...f, city: v })} required label="Ville" placeholder="Ex. Lyon" /></div>
          <div className="f"><span>Autres villes où vous intervenez (facultatif)</span>
            <div style={{ display: "grid", gap: 8 }}>{more.map((m, i) => <div key={i} style={{ display: "flex", gap: 6 }}><div style={{ flex: 1 }}><CityInput value={m} label={`Ville ${i + 2}`} placeholder={`Ville ${i + 2}`} onChange={(v) => setMore(more.map((x, j) => (j === i ? v : x)))} /></div><button type="button" className="btn ghost" aria-label="Retirer cette ville" onClick={() => setMore(more.filter((_, j) => j !== i))}>✕</button></div>)}
              {more.length < 10 && <div><button type="button" className="btn ghost" onClick={() => setMore([...more, ""])}>+ Ajouter une ville</button></div>}</div></div>
          <label className="f">Adresse d’accueil (facultatif)<input maxLength={200} value={f.address} onChange={set("address")} /></label>
        </section>
        <section className="dcard"><h3>Ce que vous proposez</h3>
          <fieldset className="fs"><legend className="note">12 maximum</legend>
            <div className="tags">{ASSO_SERVICES.map((s) => <button type="button" key={s} className="chip" aria-pressed={svc.includes(s)} onClick={() => setSvc(svc.includes(s) ? svc.filter((x) => x !== s) : svc.length < 12 ? [...svc, s] : svc)}>{s}</button>)}</div></fieldset>
        </section>
        <section className="dcard"><h3>Contact</h3>
          <div className="row2"><label className="f">Téléphone<input type="tel" maxLength={30} value={f.phone} onChange={set("phone")} autoComplete="tel" /></label>
            <label className="f">E-mail public<input type="email" maxLength={120} value={f.email} onChange={set("email")} autoComplete="email" /></label></div>
          <div className="row2"><label className="f">Site web<input maxLength={200} value={f.site} onChange={set("site")} placeholder="https://…" /></label>
            <label className="f">Horaires / permanences<input maxLength={200} value={f.hours} onChange={set("hours")} placeholder="Ex. lun–ven 10h–18h" /></label></div>
        </section>
        {msg && <p className="note" role={msg.ok ? "status" : "alert"} style={msg.ok ? undefined : { color: "var(--btn)", fontWeight: 700 }}>{msg.t}</p>}
        <button className="btn" type="submit" disabled={busy}>{busy ? "Enregistrement…" : row ? "Enregistrer (revalidation)" : "Envoyer ma fiche"}</button>
      </form>
      {row && <div>{sure
        ? <p className="note">Supprimer définitivement la fiche ? <button className="btn" onClick={del}>Oui, supprimer</button> <button className="btn ghost" onClick={() => setSure(false)}>Annuler</button></p>
        : <button className="btn ghost" onClick={() => setSure(true)}>🗑 Supprimer ma fiche</button>}</div>}
    </div>
  );
}
