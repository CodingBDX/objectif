import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { publicLodgings, canSeeLodgings } from "@/lib/lodgingServer";
import LodgingSearch, { LItem } from "@/components/LodgingSearch";
import { Tr } from "@/lib/i18n";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Logements", robots: { index: false, follow: false } };

export default async function Page() {
  if (!(await canSeeLodgings())) notFound();
  const data = await publicLodgings("profile_id,title,city,area,lat,lon,photos,price_day,price_week,price_month");
  const items: LItem[] = data.map((l: any) => ({ id: l.profile_id, title: l.title, city: l.city, area: l.area, lat: l.lat, lon: l.lon, photo: l.photos?.[0] || "", day: l.price_day, week: l.price_week, month: l.price_month, owner: l.owner as string }));
  return (
    <section id="lg" className="gut">
      <div className="pbar"><Link className="btn ghost" href="/"><Tr k="← Retour à l’annuaire" /></Link><h1 className="pbn"><Tr k="🏠 Logements" /></h1></div>
      <div className="pfc"><LodgingSearch items={items} /></div>
    </section>
  );
}
