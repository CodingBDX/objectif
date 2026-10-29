import type { Metadata } from "next";
import { Crumbs } from "@/components/Ld";
import Link from "next/link";
import { notFound } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import Slider from "@/components/Slider";
import AvailCalendar from "@/components/AvailCalendar";
import Ic from "@/components/Ic";
import { Tr } from "@/lib/i18n";
import { todayP } from "@/lib/avail";
import { busyList, WARNING } from "@/lib/lodging";
import { canSeeLodgings } from "@/lib/lodgingServer";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Logement", robots: { index: false, follow: false } };

export default async function Page({ params }: { params: { id: string } }) {
  const sb = supabaseServer();
  const { data: l } = await sb.from("lodgings").select("*").eq("profile_id", params.id).maybeSingle();
  if (!l) notFound();
  const { data: o } = await sb.from("profiles").select("id,name,vip,verified,paused").eq("id", params.id).maybeSingle();
  const { data: { user } } = await sb.auth.getUser(); const mine = user?.id === params.id;
  if (!mine && !(await canSeeLodgings())) notFound();
  if (!mine && (l.status !== "approved" || !o || !o.vip || !o.verified || (o as any).paused)) notFound();
  return (
    <section id="lg" className="gut">
      <div className="pbar"><Crumbs inline items={[["Accueil", "/"], ["Logements", "/logements"], [l.title, "#"]]} /><h1 className="pbn">{l.title}</h1></div>
      <div className="pfc"><div className="pgrid"><div className="pmain">
        {l.status !== "approved" && mine && <p className="note" role="status"><b><Tr k="⏳ Aperçu : ton logement n’est pas encore visible par les autres." /></b></p>}
        <Slider imgs={l.photos || []} vip={true} alt={l.title} />
        <div className="panel pi">
          <div className="rates" aria-label="Prix">{l.price_day ? <span><Ic n="rose" s={18} /><Tr k="Jour" /> <b>{l.price_day}</b></span> : null}{l.price_week ? <span><Ic n="rose" s={18} /><Tr k="Semaine" /> <b>{l.price_week}</b></span> : null}{l.price_month ? <span><Ic n="rose" s={18} /><Tr k="Mois" /> <b>{l.price_month}</b></span> : null}</div>
          <p className="note" style={{ margin: "0 0 10px" }}>📍 {l.city}{l.area ? ` · ${l.area}` : ""}</p>
          {l.description && <div className="bio" style={{ whiteSpace: "pre-wrap" }}>{l.description}</div>}
          <h2 className="pres"><Tr k="Calendrier" /></h2>
          <AvailCalendar busy={busyList(l)} today={todayP()} />
          <p className="note"><span className="calkey free" /> <Tr k="Libre" /> · <span className="calkey occ" /> <Tr k="Occupé" /></p>
          {o && <p style={{ margin: "14px 0 0" }}><Link className="btn" href={`/profil/${o.id}`}><Tr k="Contacter {n} sur son profil" vars={{ n: o.name }} /></Link></p>}
          <p className="note" role="note" style={{ margin: "14px 0 0" }}>⚠️ <Tr k={WARNING} /></p>
        </div></div></div></div>
    </section>
  );
}
