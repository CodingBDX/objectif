import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { supabaseServer } from "@/lib/supabase/server";
import { cap, CATS, isNew, Profile, showTarif, rateList, RATE_OPTS } from "@/lib/types";
import { publicSpecialties } from "@/lib/public";
import { avail, DAYL, dShort, MS, nextOpen, nowP, todayP, tripsOf } from "@/lib/avail";
import Ic from "@/components/Ic";
import Heart from "@/components/Heart";
import Slider from "@/components/Slider";
import PauseBtn from "@/components/PauseBtn";
import { Tr, TDate } from "@/lib/i18n";
import { RichText, plain } from "@/lib/rich";
import CopyBtn from "@/components/CopyBtn";
import PhoneReveal from "@/components/PhoneReveal";
import Comments from "@/components/Comments";
import ReportBtn from "@/components/ReportBtn";
import { TrackLink, TrackView } from "@/components/Track";
import { GPATH, siteUrl, slug } from "@/lib/site";

export const dynamic = "force-dynamic";
const get = async (id: string) => { const [{ data }, spec] = await Promise.all([supabaseServer().from("profiles").select("*").eq("id", id).maybeSingle(), publicSpecialties()]); const p = data as Profile | null; if (p) p.specialties = (p.specialties || []).filter((x) => spec.includes(x)); return p; };
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const p = await get(params.id);
  if (!p) return {};
  const desc = (p.bio ? plain(p.bio).slice(0, 150) : `${p.name}, ${CATS[p.genre] || "créateur"}${p.genre === "livecam" ? " en ligne" : ` à ${p.city}`}. Photos, disponibilités et contact.`);
  return {
    title: `${p.name}, ${CATS[p.genre] || "profil"}${p.genre === "livecam" ? "" : ` à ${p.city}`}`, description: desc, alternates: { canonical: `/profil/${p.id}` },
    openGraph: { type: "profile", title: (p.genre === "livecam" ? p.name : `${p.name} · ${p.city}`), description: desc, images: p.photos[0] ? [{ url: p.photos[0] }] : undefined },
    twitter: { card: "summary_large_image", title: (p.genre === "livecam" ? p.name : `${p.name} · ${p.city}`), description: desc, images: p.photos[0] ? [p.photos[0]] : undefined }
  };
}
const SOC: Record<string, [string, string, (h: string) => string]> = {
  instagram: ["insta", "Instagram", (h) => "https://www.instagram.com/" + h],
  snapchat: ["snap", "Snapchat", (h) => "https://www.snapchat.com/add/" + h],
  tiktok: ["tiktok", "TikTok", (h) => "https://www.tiktok.com/@" + h]
};
const handle = (h: string | null) => String(h || "").trim().replace(/^@/, "");
const okHandle = (h: string) => /^[A-Za-z0-9._]{1,30}$/.test(h);

const HL: Record<string, string> = { non: "Non", parfois: "Parfois", oui: "Oui" };
export default async function ProfilePage({ params }: { params: { id: string } }) {
  const sb = supabaseServer();
  const p = await get(params.id);
  if (!p) notFound();
  const { data: { user } } = await sb.auth.getUser();
  const mine = user?.id === p.id;
  const a = avail(p); const trips = tripsOf(p); const td = todayP(); const nd = nowP().d;
  const live = p.genre === "livecam";
  const asleep = !mine && !!a && !a.on;
  const back = asleep ? nextOpen(p) : null;
  let st: { views_total: number; views_today: number; last_seen_day: string | null } | null = null;
  try { const { data } = await sb.rpc("profile_public_stats", { p_id: p.id }); const r = Array.isArray(data) ? data[0] : data; if (r) st = { views_total: Number(r.views_total), views_today: Number(r.views_today), last_seen_day: r.last_seen_day }; } catch {}
  const nbd = (iso: string) => Math.round((new Date(td + "T12:00:00").getTime() - new Date(iso + "T12:00:00").getTime()) / 864e5);
  const seen: { k: string; v?: Record<string, number> } | null = st?.last_seen_day ? (() => { const n = nbd(st.last_seen_day); return n <= 0 ? { k: "Aujourd’hui" } : n === 1 ? { k: "Hier" } : n < 30 ? { k: "Il y a {n} jours", v: { n } } : { k: "Il y a plus d’un mois" }; })() : null;
  const since = new Date(p.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Paris" });
  const fmtN = (n: number) => n.toLocaleString("fr-FR");
  return (
    <section id="pf" className="gut">
      <TrackView id={p.id} skip={mine} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org", "@type": "ProfilePage", url: `${siteUrl()}/profil/${p.id}`, dateCreated: p.created_at,
        mainEntity: { "@type": "Person", name: p.name, description: plain(p.bio).slice(0, 300), image: p.photos.slice(0, 3).map((u) => (u.startsWith("http") ? u : siteUrl() + u)),
          ...(p.genre === "livecam" ? {} : { homeLocation: { "@type": "Place", address: { "@type": "PostalAddress", addressLocality: p.city, addressCountry: "FR" } } }), knowsAbout: p.specialties,
          sameAs: (["instagram", "snapchat", "tiktok"] as const).map((k) => { const h = handle((p as any)[k]); return p.vip && h && okHandle(h) ? SOC[k][2](h) : null; }).filter(Boolean) }
      }).replace(/</g, "\\u003c") }} />
      <div className="pbar"><Link className="btn ghost" href="/"><Tr k="← Tous les profils" /></Link><h1 className="pbn">{p.name}</h1>
        <span className="pbadges">{live && <span className="liveb"><i />LIVE</span>}<Heart id={p.id} />{p.verified && <span className="vf" role="img" aria-label="Profil vérifié" title="Profil vérifié"><Ic n="check" s={12} /></span>}
          {isNew(p) && <span className="gchip"><Ic n="spark" s={13} /> <Tr k="Nouveau" /></span>}
          {p.vip && <span className="vipb" style={{ position: "static" }}><Ic n="crown" s={14} />VIP</span>}</span>
        <div className="pcontact">
          {mine && <PauseBtn id={p.id} paused={p.paused} icon className="soc pz" />}
          {asleep && <span className="pph zz"><Ic n="clock" s={18} /><b><Tr k={p.genre === "homme" ? "Il dort" : "Elle dort"} /></b>{back && <small><Tr k="(retour le {d} à {h})" vars={{ d: dShort(back.iso), h: back.time }} /></small>}</span>}
          {!asleep && <PhoneReveal id={p.id} live={live} mine={mine} name={p.name} />}
          {Object.keys(SOC).map((k) => { const h = handle((p as any)[k]); if ((!p.vip && !live) || !h || !okHandle(h)) return null; const [i, n, u] = SOC[k];
            return <TrackLink key={k} id={p.id} kind="social" skip={mine} className="soc" href={u(h)} target="_blank" rel="noopener noreferrer" aria-label={`${n} de ${p.name}`} title={n}><Ic n={i} s={22} /></TrackLink>; })}
        </div></div>
      <div className="pfc">
        <div className="pgrid">
          <div className="pmain">
            {!live && <section className="mvil" aria-label="Villes"><h2><Ic n="pin" s={20} /><Tr k="Villes" /></h2><div className="mvs"><Link className="bubble base" href={`/ville/${slug(p.city)}`} title="Ville de base">{p.city} ★</Link>
                {(p.more || []).filter((c) => c !== p.city).map((c) => <Link key={c} className="bubble" href={`/ville/${slug(c)}`}>{c}</Link>)}</div></section>}
            <Slider imgs={p.photos} vip={p.vip} video={p.video} alt={p.genre === "livecam" ? p.name : `${p.name}, ${CATS[p.genre] || "profil"} à ${p.city}`} />
            {live && p.vlink && /^https?:\/\//.test(p.vlink) && <p style={{ margin: "0 0 22px" }}><a className="btn" href={p.vlink} target="_blank" rel="noopener noreferrer"><Tr k="▶ Rejoindre le live" /></a></p>}
            <div className="panel pi">
              <div className="pst" role="list" aria-label="Informations du profil">
                <div role="listitem"><i aria-hidden="true">📅</i><b><TDate iso={p.created_at} /></b><span><Tr k="Inscription" /></span></div>
                {seen && <div role="listitem"><i aria-hidden="true">🕒</i><b><Tr k={seen.k} vars={seen.v} /></b><span><Tr k="Dernière connexion" /></span></div>}
                {st && <div role="listitem"><i aria-hidden="true">👁</i><b>{fmtN(st.views_total)}</b><span><Tr k="Vues au total" /></span></div>}
                {st && <div role="listitem"><i aria-hidden="true">🔥</i><b>{fmtN(st.views_today)}</b><span><Tr k="Vues aujourd’hui" /></span></div>}
              </div>
              {showTarif(p) && <div className="rates" aria-label="Tarifs">{rateList(p).map((r) => <span key={r.d}><Ic n="rose" s={18} /><Tr k={RATE_OPTS.find((o) => o[0] === r.d)![1]} /> <b>{r.p}</b></span>)}</div>}
              {live && (p.pay_wero || p.pay_paypal) && <div className="rates pay" aria-label="Paiement">
                {p.pay_wero && <span><Ic n="rose" s={18} />Wero <b>{p.pay_wero}</b><CopyBtn text={p.pay_wero} label="Copier" className="" /></span>}
                {p.pay_paypal && (/^https:\/\/(www\.)?paypal\.me\/[\w./-]+$/i.test(p.pay_paypal) ? <span><Ic n="rose" s={18} />PayPal <a className="nb" href={p.pay_paypal} target="_blank" rel="noopener noreferrer">{p.pay_paypal.replace(/^https:\/\/(www\.)?/i, "")}</a></span> : <span><Ic n="rose" s={18} />PayPal <b>{p.pay_paypal}</b><CopyBtn text={p.pay_paypal} label="Copier" className="" /></span>)}</div>}
              {(p.genre || p.receives || p.travels || p.age || p.hair || p.eyes || p.bra || p.smoker || p.drinker || p.height_cm || p.weight_kg || p.nationality || (p.languages || []).length > 0) && <><h2 className="pres"><Tr k="Description" /></h2>
                <ul className="dscr">{p.genre ? <li><span><Tr k="👤 Genre" /></span><b><Tr k={CATS[p.genre]} /></b></li> : null}{p.receives ? <li><span><Tr k="🏠 Rencontre" /></span><b><Tr k="Reçoit" /></b></li> : null}{p.travels ? <li><span><Tr k="🚗 Rencontre" /></span><b><Tr k="Se déplace" /></b></li> : null}{p.age ? <li><span><Tr k="🎂 Âge" /></span><b>{p.age} <Tr k="ans" /></b></li> : null}{p.height_cm ? <li><span><Tr k="📏 Taille" /></span><b>{p.height_cm} cm</b></li> : null}{p.weight_kg ? <li><span><Tr k="⚖️ Poids" /></span><b>{p.weight_kg} kg</b></li> : null}{p.hair ? <li><span><Tr k="💇 Cheveux" /></span><b><Tr k={p.hair!} /></b></li> : null}{p.eyes ? <li><span><Tr k="👁 Yeux" /></span><b><Tr k={p.eyes!} /></b></li> : null}{p.bra ? <li><span><Tr k="👙 Bonnet" /></span><b>{p.bra}</b></li> : null}{p.smoker ? <li><span><Tr k="🚬 Fume" /></span><b><Tr k={HL[p.smoker]} /></b></li> : null}{p.drinker ? <li><span><Tr k="🍷 Boit" /></span><b><Tr k={HL[p.drinker]} /></b></li> : null}{p.nationality ? <li><span><Tr k="🏳️ Nationalité" /></span><b>{p.nationality}</b></li> : null}{(p.languages || []).length > 0 ? <li><span><Tr k="🗣 Langues" /></span><b>{p.languages!.map((l, i) => <span key={l}>{i > 0 ? ", " : ""}<Tr k={l} /></span>)}</b></li> : null}</ul></>}
              {p.specialties.length > 0 && <div className="mspec"><h2 className="pres"><Tr k="Spécialités" /></h2><div className="bub">{p.specialties.map((t) => <span key={t} className="bubble">{cap(t)}</span>)}</div></div>}
              {p.bio && <h2 className="pres"><Tr k="Présentation" /></h2>}
              <div className="bio"><RichText text={p.bio} /></div>
              <div className="acts"><CopyBtn text="" label="🔗 Copier le lien du profil" />
                {!mine && <ReportBtn profileId={p.id} />}
                {p.site && /^https?:\/\//.test(p.site) && <a className="btn ghost" href={p.site} target="_blank" rel="noopener noreferrer"><Tr k="Site web" /></a>}</div>
            </div>
          </div>
          <aside className="pside" aria-label="Villes, déplacements et disponibilités">
            {!live && <section className="bsec dsk"><h3 className="ph"><Ic n="pin" s={18} /><Tr k="Villes" /></h3><div className="bub">
              <Link className="bubble base" href={`/ville/${slug(p.city)}`} title="Ville de base">{p.city} ★</Link>
              {(p.more || []).filter((c) => c !== p.city).map((c) => <Link key={c} className="bubble" href={`/ville/${slug(c)}`}>{c}</Link>)}</div></section>}
            <section className="bsec dsk"><h3 className="ph"><Ic n="tag" s={18} /><Tr k="Spécialités" /></h3><div className="bub">{p.specialties.map((t) => <span key={t} className="bubble">{cap(t)}</span>)}</div></section>
            {trips.length > 0 && <div className="panel"><h3 className="ph"><Ic n="pin" s={18} /><Tr k="Prochains passages" /></h3>
              {trips.map((x, i) => { const now = x.from <= td; const [, m, d] = x.from.split("-");
                return <div className="trip" key={i}><div className="tcal"><b>{MS[+m - 1]}</b><span>{+d}</span></div>
                  <div className="tinf"><Link href={`/ville/${slug(x.city)}`}>{x.city}</Link>{now && <span className="tnow"><Tr k="En ce moment" /></span>}
                    <em>{x.to !== x.from ? <Tr k="du {a} au {b}" vars={{ a: dShort(x.from), b: dShort(x.to) }} /> : <Tr k="le {a}" vars={{ a: dShort(x.from) }} />}</em></div></div>; })}</div>}
                        {a && (p.h24 || Object.values(p.hours || {}).some((h) => h && h[0] && h[1])) && <div className="panel"><h3 className="ph"><Ic n="clock" s={18} /><Tr k="Disponibilités" /></h3>
              {a ? (<>
                {a.on ? <div className="meta avl on"><Ic n="clock" s={15} />{a.h24 ? <Tr k="Disponible 24h/24, 7j/7" /> : <Tr k="Disponible jusqu’à {u}" vars={{ u: a.until || "" }} />}</div>
                  : <div className="meta"><Ic n="clock" s={15} /><Tr k="Indisponible" />{a.next ? <Tr k=" · reprend {n}" vars={{ n: a.next }} /> : null}</div>}
                {p.h24 ? <p className="note h24n"><Tr k="Disponible à toute heure, tous les jours." /></p> :
                  <div className="hrs">{DAYL.map((n, d) => { const h = p.hours[d]; return <div key={n} className={d === nd ? "today" : ""}><span><Tr k={n} /></span><span className={h ? "" : "cl"}>{h ? `${h[0]} – ${h[1]}` : <Tr k="Indisponible" />}</span></div>; })}</div>}
              </>) : null}
            </div>}
          </aside>
        </div>
        <div className="pgrid cmrow"><Comments profileId={p.id} ownerId={p.id} /></div>
      </div>
    </section>
  );
}
