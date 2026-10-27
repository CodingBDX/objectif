import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { supabaseServer } from "@/lib/supabase/server";
import { cap, CATS, isNew, Profile, showTarif } from "@/lib/types";
import { avail, DAYL, dShort, MS, nowP, todayP, tripsOf } from "@/lib/avail";
import Ic from "@/components/Ic";
import Heart from "@/components/Heart";
import Slider from "@/components/Slider";
import OwnerBar from "@/components/OwnerBar";
import CopyBtn from "@/components/CopyBtn";
import Comments from "@/components/Comments";
import ReportBtn from "@/components/ReportBtn";
import { TrackLink, TrackView } from "@/components/Track";
import { GPATH, siteUrl, slug } from "@/lib/site";

export const dynamic = "force-dynamic";
const get = async (id: string) => { const { data } = await supabaseServer().from("profiles").select("*").eq("id", id).maybeSingle(); return data as Profile | null; };
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const p = await get(params.id);
  if (!p) return {};
  const desc = (p.bio ? p.bio.slice(0, 150) : `${p.name}, ${CATS[p.genre] || "créateur"} à ${p.city}. Photos, disponibilités et contact.`);
  return {
    title: `${p.name}, ${CATS[p.genre] || "profil"} à ${p.city}`, description: desc, alternates: { canonical: `/profil/${p.id}` },
    openGraph: { type: "profile", title: `${p.name} · ${p.city}`, description: desc, images: p.photos[0] ? [{ url: p.photos[0] }] : undefined },
    twitter: { card: "summary_large_image", title: `${p.name} · ${p.city}`, description: desc, images: p.photos[0] ? [p.photos[0]] : undefined }
  };
}
const SOC: Record<string, [string, string, (h: string) => string]> = {
  instagram: ["insta", "Instagram", (h) => "https://www.instagram.com/" + h],
  snapchat: ["snap", "Snapchat", (h) => "https://www.snapchat.com/add/" + h],
  tiktok: ["tiktok", "TikTok", (h) => "https://www.tiktok.com/@" + h]
};
const handle = (h: string | null) => String(h || "").trim().replace(/^@/, "");
const okHandle = (h: string) => /^[A-Za-z0-9._]{1,30}$/.test(h);
const telHref = (s: string) => { const d = s.replace(/[^\d+]/g, ""); return /^0\d{9}$/.test(d) ? "+33" + d.slice(1) : d.replace(/^00/, "+"); };
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
      <TrackView id={p.id} skip={mine} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org", "@type": "ProfilePage", url: `${siteUrl()}/profil/${p.id}`, dateCreated: p.created_at,
        mainEntity: { "@type": "Person", name: p.name, description: p.bio.slice(0, 300), image: p.photos.slice(0, 3).map((u) => (u.startsWith("http") ? u : siteUrl() + u)),
          homeLocation: { "@type": "Place", address: { "@type": "PostalAddress", addressLocality: p.city, addressCountry: "FR" } }, knowsAbout: p.specialties,
          sameAs: (["instagram", "snapchat", "tiktok"] as const).map((k) => { const h = handle((p as any)[k]); return h && okHandle(h) ? SOC[k][2](h) : null; }).filter(Boolean) }
      }).replace(/</g, "\\u003c") }} />
      <div className="pbar"><Link className="btn ghost" href="/">← Tous les profils</Link><strong className="pbn">{p.name}</strong>
        <div className="pcontact">
          {p.phone && <span className="pph"><Ic n="phone" s={18} /><TrackLink id={p.id} kind="call" skip={mine} className="nb" href={`tel:${telHref(p.phone)}`} aria-label={`Appeler ${p.name}`}>{fmtPh(p.phone)}</TrackLink><CopyBtn text={p.phone} label="Copier" className="" trackId={mine ? undefined : p.id} /></span>}
          {Object.keys(SOC).map((k) => { const h = handle((p as any)[k]); if (!h || !okHandle(h)) return null; const [i, n, u] = SOC[k];
            return <TrackLink key={k} id={p.id} kind="social" skip={mine} className="soc" href={u(h)} target="_blank" rel="noopener noreferrer" aria-label={`${n} de ${p.name}`} title={n}><Ic n={i} s={22} /></TrackLink>; })}
        </div></div>
      <div className="pfc">
        <div className="pgrid">
          <div className="pmain">
            {mine && <OwnerBar id={p.id} paused={p.paused} vip={p.vip} />}
            <Slider imgs={p.photos} vip={p.vip} video={p.video} />
            {live && p.vlink && /^https?:\/\//.test(p.vlink) && <p style={{ margin: "0 0 22px" }}><a className="btn" href={p.vlink} target="_blank" rel="noopener noreferrer">▶ Rejoindre le live</a></p>}
            <div className="panel pi">
              <div className="top"><h1 className="pn">{p.name}</h1>
                {p.genre && <Link className="gchip" href={`/genre/${GPATH[p.genre]}`}>{CATS[p.genre]}</Link>}
                {isNew(p) && <span className="gchip"><Ic n="spark" s={13} /> Nouveau</span>}
                {live && <span className="liveb"><i />LIVE</span>}
                {p.verified && <span className="vf" role="img" aria-label="Profil vérifié" title="Profil vérifié"><Ic n="check" s={12} /></span>}
                {p.vip && <span className="vipb" style={{ position: "static" }}><Ic n="crown" s={14} />VIP</span>}
                <Heart id={p.id} /></div>
              <div className="bio" style={{ whiteSpace: "pre-wrap" }}>{p.bio}</div>
              <div className="acts"><CopyBtn text="" label="🔗 Copier le lien du profil" />
                {!mine && <ReportBtn profileId={p.id} />}
                {p.site && /^https?:\/\//.test(p.site) && <a className="btn ghost" href={p.site} target="_blank" rel="noopener noreferrer">Site web</a>}</div>
            </div>
            <Comments profileId={p.id} ownerId={p.id} />
          </div>
          <aside className="pside" aria-label="Villes, déplacements et disponibilités">
            <section className="bsec"><h3 className="ph"><Ic n="pin" s={18} />Villes</h3><div className="bub">
              <Link className="bubble base" href={`/ville/${slug(p.city)}`} title="Ville de base">{p.city} ★</Link>
              {(p.more || []).filter((c) => c !== p.city).map((c) => <Link key={c} className="bubble" href={`/ville/${slug(c)}`}>{c}</Link>)}</div></section>
            <section className="bsec"><h3 className="ph"><Ic n="tag" s={18} />Spécialités</h3><div className="bub">{p.specialties.map((t) => <span key={t} className="bubble">{cap(t)}</span>)}</div></section>
            {trips.length > 0 && <div className="panel"><h3 className="ph"><Ic n="pin" s={18} />Prochains passages</h3>
              {trips.map((x, i) => { const now = x.from <= td; const [, m, d] = x.from.split("-");
                return <div className="trip" key={i}><div className="tcal"><b>{MS[+m - 1]}</b><span>{+d}</span></div>
                  <div className="tinf"><Link href={`/ville/${slug(x.city)}`}>{x.city}</Link>{now && <span className="tnow">En ce moment</span>}
                    <em>{x.to !== x.from ? `du ${dShort(x.from)} au ${dShort(x.to)}` : `le ${dShort(x.from)}`}</em></div></div>; })}</div>}
            {showTarif(p) ? <div className="panel"><h3 className="ph"><Ic n="rose" s={18} />Tarifs</h3>{p.tarif_30 ? <div className="meta"><Ic n="rose" s={15} />30 minutes : <b>{p.tarif_30}</b></div> : null}{p.tarif_60 ? <div className="meta"><Ic n="rose" s={15} />1 heure : <b>{p.tarif_60}</b></div> : null}</div> : null}
            {a && (p.h24 || Object.values(p.hours || {}).some((h) => h && h[0] && h[1])) && <div className="panel"><h3 className="ph"><Ic n="clock" s={18} />Disponibilités</h3>
              {a ? (<>
                {a.on ? <div className="meta avl on"><Ic n="clock" s={15} />{a.h24 ? "Disponible 24h/24, 7j/7" : "Disponible jusqu’à " + a.until}</div>
                  : <div className="meta"><Ic n="clock" s={15} />Indisponible{a.next ? " · reprend " + a.next : ""}</div>}
                {p.h24 ? <p className="note h24n">Disponible à toute heure, tous les jours.</p> :
                  <div className="hrs">{DAYL.map((n, d) => { const h = p.hours[d]; return <div key={n} className={d === nd ? "today" : ""}><span>{n}</span><span className={h ? "" : "cl"}>{h ? `${h[0]} – ${h[1]}` : "Indisponible"}</span></div>; })}</div>}
              </>) : null}
            </div>}
          </aside>
        </div>
      </div>
    </section>
  );
}
