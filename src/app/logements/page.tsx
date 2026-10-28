import type { Metadata } from "next";
import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";
import LodgingSearch, { LItem } from "@/components/LodgingSearch";
import { Tr } from "@/lib/i18n";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Logements", robots: { index: false, follow: false } };

export default async function Page() {
  const sb = supabaseServer();
  const { data } = await sb.from("lodgings").select("profile_id,title,city,area,lat,lon,photos,price_day,price_week,price_month,status").eq("status", "approved").order("updated_at", { ascending: false }).limit(300);
  const ids = (data || []).map((l: any) => l.profile_id);
  const { data: owners } = ids.length ? await sb.from("profiles").select("id,name").in("id", ids) : { data: [] as any[] };
  const nm = new Map((owners || []).map((o: any) => [o.id, o.name]));
  const items: LItem[] = (data || []).filter((l: any) => nm.has(l.profile_id)).map((l: any) => ({ id: l.profile_id, title: l.title, city: l.city, area: l.area, lat: l.lat, lon: l.lon, photo: l.photos?.[0] || "", day: l.price_day, week: l.price_week, month: l.price_month, owner: nm.get(l.profile_id) as string }));
  return (
    <section id="lg" className="gut">
      <div className="pbar"><Link className="btn ghost" href="/"><Tr k="← Retour à l’annuaire" /></Link><h1 className="pbn"><Tr k="🏠 Logements" /></h1></div>
      <div className="pfc"><LodgingSearch items={items} /></div>
    </section>
  );
}
