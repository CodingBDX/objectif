import type { Metadata } from "next";
import { allProfiles } from "@/lib/data";
import { lab } from "@/lib/types";
import MapView, { MapCity } from "@/components/MapView";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Carte des profils", description: "Carte de France des profils : trouve les créateurs près de chez toi.", alternates: { canonical: "/carte" } };

export default async function Page() {
  const ps = await allProfiles(); const by: Record<string, MapCity> = {};
  ps.forEach((p) => { const c = (by[p.city] ||= { city: p.city, n: 0, p: [] }); c.n++; if (c.p.length < 6) c.p.push({ id: p.id, name: p.name, sub: lab(p) }); });
  const cities = Object.values(by).sort((a, b) => b.n - a.n);
  return (
    <section className="gut mapw">
      <h1 className="maph">🗺 Carte des profils</h1>
      <p className="note" style={{ margin: "0 0 10px" }}>{ps.length} profil{ps.length > 1 ? "s" : ""} dans {cities.length} ville{cities.length > 1 ? "s" : ""}. Seule la ville est affichée, jamais une adresse.</p>
      <MapView cities={cities} />
    </section>
  );
}
