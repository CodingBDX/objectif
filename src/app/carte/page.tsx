import type { Metadata } from "next";
import Link from "next/link";
import { allProfiles } from "@/lib/data";
import { lab } from "@/lib/types";
import { assosForViewer } from "@/lib/assosServer";
import MapView, { MapCity, MapAsso } from "@/components/MapView";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Carte des profils", description: "Carte de France des profils : trouve les escortes près de chez toi.", alternates: { canonical: "/carte" } };

export default async function Page() {
  const ps = await allProfiles(); const by: Record<string, MapCity> = {};
  ps.forEach((p) => { const c = (by[p.city] ||= { city: p.city, n: 0, p: [] }); c.n++; if (c.p.length < 14) c.p.push({ id: p.id, name: p.name, sub: lab(p), g: p.genre, img: p.photos[0] || "" }); });
  const cities = Object.values(by).sort((a, b) => b.n - a.n);
  const { allowed, list } = await assosForViewer();
  const assos: MapAsso[] = allowed ? list.filter((a) => a.address).map((a) => ({ slug: a.slug, name: a.name, address: a.address as string, city: a.city, phone: a.phone })) : [];
  return (
    <div className="dash gut mapw">
      <aside className="dside">
        <div className="dav">🗺</div>
        <div className="dhi">Carte</div>
        <nav>
          <Link className="on" href="/carte">🗺 Carte des profils</Link>
          <Link href="/">🏠 Annuaire</Link>
          <Link href="/?pm=1">📍 Près de moi</Link>
          <Link href="/?fav=1">💗 Favoris</Link>
          {allowed && <Link href="/associations">🤝 Associations</Link>}
          <Link href="/contact">✉️ Contact</Link>
        </nav>
        {allowed && <div className="dvip"><div className="crown">🤝</div><b>Soutien près de toi</b><span>{assos.length} association{assos.length > 1 ? "s" : ""} sur la carte, à leur adresse d’accueil.</span></div>}
      </aside>
      <main className="dmain dedit">
        <div className="dtop"><h1>Carte des profils</h1></div>
        <section className="dcard">
          <p className="note" style={{ margin: "0 0 10px" }}>{ps.length} profil{ps.length > 1 ? "s" : ""} dans {cities.length} ville{cities.length > 1 ? "s" : ""}. Pour les profils, seule la ville est affichée, jamais une adresse.{allowed ? " Les 🤝 sont des associations de soutien." : ""}</p>
          <MapView cities={cities} assos={assos} />
        </section>
      </main>
    </div>
  );
}
