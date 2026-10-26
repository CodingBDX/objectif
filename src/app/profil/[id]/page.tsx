import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { supabaseServer } from "@/lib/supabase/server";
import { cap, CATS, isNew, Profile } from "@/lib/types";
import { avail, DAYL, dShort, MS, nowP, todayP, tripsOf } from "@/lib/avail";
import Ic from "@/components/Ic";
import Heart from "@/components/Heart";
import Slider from "@/components/Slider";
import OwnerBar from "@/components/OwnerBar";
import CopyBtn from "@/components/CopyBtn";
import Comments from "@/components/Comments";

export const dynamic = "force-dynamic";
const get = async (id: string) => { const { data } = await supabaseServer().from("profiles").select("*").eq("id", id).maybeSingle(); return data as Profile | null; };
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const p = await get(params.id);
  return p ? { title: `${p.name} · ${p.city}`, description: p.bio.slice(0, 150) } : {};
}
const SOC: Record<string, [string, string, (h: string) => string]> = {
  instagram: ["insta", "Instagram", (h) => "https://www.instagram.com/" + h],
  snapchat: ["snap", "Snapchat", (h) => "https://www.snapchat.com/add/" + h],
  tiktok: ["tiktok", "TikTok", (h) => "https://www.tiktok.com/@" + h]
};
const handle = (h: string | null) => String(h || "").trim().replace(/^@/, "");
const okHandle = (h: string) => /^[A-Za-z0-9._]{1,30}$/.test(h);
const fmtPh = (s: string) => { const d = s.replace(/\D/g, ""); return /^0\d{9}$/.test(d) ? d.replace(/(\d{2})(?=\d)/g, "$1 ") : s; };

export default async function ProfilePage({ params }: { params: { id: string } }) {
  const sb = supabaseServer();
  const p = await get(params.id);
  if (!p) notFound();
  const { data: { user } } = await sb.auth.getUser();
  const mine = user?.id === p.id;
  const a = avail(p); const trips = tripsOf(p); const td = todayP(); const nd = nowP().d;
  const live = p.genre === "livecam";
  return (
    <section id="pf" className="gut">
      <div className="pbar"><Link className="btn ghost" href="/">← Tous les profils</Link><strong className="pbn">{p.name}</strong>
        <div className="pcontact">
          {p.phone && <span className="pph"><Ic n="phone" s={18} /><span className="nb">{fmtPh(p.phone)}</span><CopyBtn text={p.phone} label="Copier" className="" /></span>}
          {Object.keys(SOC).map((k) => { const h = handle((p as any)[k]); if (!h || !okHandle(h)) return null; const [i, n, u] = SOC[k];
            return <a key={k} className="soc" href={u(h)} target="_blank" rel="noopener noreferrer" aria-label={`${n} de ${p.name}`} title={n}><Ic n={i} s={22} /></a>; })}
        </div></div>
      <div className="pfc">
        <div className="pgrid">
          <div className="pmain">
            {mine && <OwnerBar id={p.id} paused={p.paused} vip={p.vip} />}
            {p.video && <div className="video"><video controls playsInline src={p.video} /></div>}
            <h2 className="sec">Portfolio</h2>
            <Slider imgs={p.photos} vip={p.vip} />
            {live && p.vlink && /^https?:\/\//.test(p.vlink) && <p style={{ margin: "0 0 22px" }}><a className="btn" href={p.vlink} target="_blank" rel="noopener noreferrer">▶ Rejoindre le live</a></p>}
            <div className="panel pi">
              <div className="top"><h2 className="pn">{p.name}</h2>
                {p.genre && <span className="gchip">{CATS[p.genre]}</span>}
                {isNew(p) && <span className="gchip"><Ic n="spark" s={13} /> Nouveau</span>}
                {live && <span className="liveb"><i />LIVE</span>}
                {p.verified && <span className="vf" role="img" aria-label="Profil vérifié" title="Profil vérifié"><Ic n="check" s={12} /></span>}
                {p.vip && <span className="vipb" style={{ position: "static" }}><Ic n="crown" s={14} />VIP</span>}
                <Heart id={p.id} /></div>
              <div className="bio" style={{ whiteSpace: "pre-wrap" }}>{p.bio}</div>
              <div className="acts"><CopyBtn text="" label="🔗 Copier le lien du profil" />
                {p.site && /^https?:\/\//.test(p.site) && <a className="btn ghost" href={p.site} target="_blank" rel="noopener noreferrer">Site web</a>}</div>
            </div>
            <Comments profileId={p.id} ownerId={p.id} />
          </div>
          <aside className="pside" aria-label="Villes, déplacements et disponibilités">
            <section className="bsec"><h3 className="ph"><Ic n="pin" s={18} />Villes</h3><div className="bub">
              <Link className="bubble base" href={`/?ville=${encodeURIComponent(p.city)}`} title="Ville de base">{p.city} ★</Link>
              {(p.more || []).filter((c) => c !== p.city).map((c) => <Link key={c} className="bubble" href={`/?ville=${encodeURIComponent(c)}`}>{c}</Link>)}</div></section>
            <section className="bsec"><h3 className="ph"><Ic n="tag" s={18} />Spécialités</h3><div className="bub">{p.specialties.map((t) => <span key={t} className="bubble">{cap(t)}</span>)}</div></section>
            {trips.length > 0 && <div className="panel"><h3 className="ph"><Ic n="pin" s={18} />Prochains passages</h3>
              {trips.map((x, i) => { const now = x.from <= td; const [, m, d] = x.from.split("-");
                return <div className="trip" key={i}><div className="tcal"><b>{MS[+m - 1]}</b><span>{+d}</span></div>
                  <div className="tinf"><Link href={`/?ville=${encodeURIComponent(x.city)}`}>{x.city}</Link>{now && <span className="tnow">En ce moment</span>}
                    <em>{x.to !== x.from ? `du ${dShort(x.from)} au ${dShort(x.to)}` : `le ${dShort(x.from)}`}</em></div></div>; })}</div>}
            <div className="panel"><h3 className="ph"><Ic n="clock" s={18} />Disponibilités</h3>
              {a ? (<>
                {a.on ? <div className="meta avl on"><Ic n="clock" s={15} />{a.h24 ? "Disponible 24h/24, 7j/7" : "Disponible jusqu’à " + a.until}</div>
                  : <div className="meta"><Ic n="clock" s={15} />Indisponible{a.next ? " · reprend " + a.next : ""}</div>}
                {p.h24 ? <p className="note h24n">Disponible à toute heure, tous les jours.</p> :
                  <div className="hrs">{DAYL.map((n, d) => { const h = p.hours[d]; return <div key={n} className={d === nd ? "today" : ""}><span>{n}</span><span className={h ? "" : "cl"}>{h ? `${h[0]} – ${h[1]}` : "Indisponible"}</span></div>; })}</div>}
              </>) : <p className="note">Horaires non renseignés.</p>}
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
