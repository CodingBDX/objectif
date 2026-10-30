import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { publicLodgings, canSeeLodgings } from "@/lib/lodgingServer";
import LodgingSearch, { LItem } from "@/components/LodgingSearch";
import LodgingShell from "@/components/LodgingShell";
import { slug } from "@/lib/site";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Logements", robots: { index: false, follow: false } };

export default async function Page({ searchParams }: { searchParams: { ville?: string } }) {
  if (!(await canSeeLodgings())) notFound();
  const data = await publicLodgings("profile_id,title,city,area,lat,lon,photos,price_day,price_week,price_month");
  const items: LItem[] = data.map((l: any) => ({ id: l.profile_id, title: l.title, city: l.city, area: l.area, lat: l.lat, lon: l.lon, photo: l.photos?.[0] || "", day: l.price_day, week: l.price_week, month: l.price_month, owner: l.owner as string }));
  const counts = new Map<string, number>(); items.forEach((l) => counts.set(l.city, (counts.get(l.city) || 0) + 1));
  const want = (searchParams.ville || "").trim().slice(0, 80);
  const cities = [...counts.keys()].sort((x, y) => (counts.get(y) || 0) - (counts.get(x) || 0) || x.localeCompare(y, "fr")).map((c) => ({ name: c, n: counts.get(c) || 0, on: !!want && slug(c) === slug(want) }));
  return (
    <LodgingShell title="🏠 Logements" cities={cities}>
      <LodgingSearch items={items} initialCity={want} />
    </LodgingShell>
  );
}
