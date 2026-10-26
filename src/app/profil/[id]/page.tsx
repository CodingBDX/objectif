import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { supabaseServer } from "@/lib/supabase/server";
import { GENRES, Profile } from "@/lib/types";

export const dynamic = "force-dynamic";
const get = async (id: string) => {
  const { data } = await supabaseServer().from("profiles").select("*").eq("id", id).maybeSingle();
  return data as Profile | null;
};
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const p = await get(params.id);
  return p ? { title: `${p.name} — ${p.city}`, description: p.bio.slice(0, 150) } : {};
}
const DAYS = ["Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi","Dimanche"];
const wm = `© ${process.env.NEXT_PUBLIC_SITE_NAME || "Objectif"}`;

export default async function ProfilePage({ params }: { params: { id: string } }) {
  const p = await get(params.id);
  if (!p) notFound();
  const g = GENRES.find((x) => x.id === p.genre);
  const today = new Date().toISOString().slice(0, 10);
  const trips = (p.trips || []).filter((t) => t.to >= today).sort((a, b) => a.from.localeCompare(b.from));
  return (
    <div className="two">
      <div>
        {p.video && <div className="wm" data-wm={wm} style={{ marginBottom: 16 }}><video src={p.video} controls playsInline /></div>}
        <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))" }}>
          {p.photos.map((u, i) => <div key={i} className="ph wm card" data-wm={wm}><img src={u} alt={`${p.name} ${i + 1}`} /></div>)}
        </div>
      </div>
      <aside className="panel" style={{ alignSelf: "start" }}>
        <h1 style={{ margin: 0 }}>{p.name} {p.verified && "✔"}</h1>
        <p className="mut" style={{ margin: "4px 0 10px" }}>{g?.icon} {g?.label.replace(/s$/, "")} · {p.city}{p.vip && " · 👑 VIP"}</p>
        <div className="tags">{p.specialties.map((s) => <span key={s} className="badge">{s}</span>)}</div>
        <p style={{ whiteSpace: "pre-wrap" }}>{p.bio}</p>
        <h3>Disponibilités</h3>
        {p.h24 ? <p>Disponible 24h/24, 7j/7</p> :
          <ul style={{ paddingLeft: 18 }}>{DAYS.map((d, i) => { const h = p.hours?.[String(i)]; return <li key={d}>{d} : {h ? `${h[0]} – ${h[1]}` : "indisponible"}</li>; })}</ul>}
        {trips.length > 0 && (<><h3>Prochains déplacements</h3>
          <ul style={{ paddingLeft: 18 }}>{trips.map((t, i) => <li key={i}>{t.city} · {t.from} → {t.to}</li>)}</ul></>)}
        <h3>Contact</h3>
        {p.phone && <p>📞 {p.phone}</p>}
        <p>
          {p.instagram && <a className="badge" href={`https://instagram.com/${p.instagram.replace("@", "")}`} target="_blank" rel="noopener noreferrer">Instagram</a>}
          {p.snapchat && <a className="badge" href={`https://snapchat.com/add/${p.snapchat.replace("@", "")}`} target="_blank" rel="noopener noreferrer">Snapchat</a>}
          {p.tiktok && <a className="badge" href={`https://tiktok.com/@${p.tiktok.replace("@", "")}`} target="_blank" rel="noopener noreferrer">TikTok</a>}
          {p.site && /^https?:\/\//.test(p.site) && <a className="badge" href={p.site} target="_blank" rel="noopener noreferrer">Site</a>}
        </p>
      </aside>
    </div>
  );
}
