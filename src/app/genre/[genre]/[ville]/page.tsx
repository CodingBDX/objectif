import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import Home from "@/components/Home";
import { allProfiles, cityBySlug, cityFromSlug } from "@/lib/data";
import { GFROM, GPATH, GTITLE } from "@/lib/site";
import { cityList } from "@/lib/types";
import CityIntro from "@/components/CityIntro";
import CityAssos from "@/components/CityAssos";
import { regionMap } from "@/lib/cityinfo";
import Ld, { crumbs, Crumbs, itemList } from "@/components/Ld";

export const dynamic = "force-dynamic";
export async function generateMetadata({ params }: { params: { genre: string; ville: string } }): Promise<Metadata> {
  const g = GFROM[params.genre]; const city = cityBySlug(await allProfiles(), params.ville); if (!g || !city) return {};
  return { title: `Escortes ${GTITLE[g].toLowerCase()} à ${city}`, description: `Escortes ${GTITLE[g].toLowerCase()} à ${city} : photos, tarifs, disponibilités et agenda des passages. Profils majeurs et protégés des arnaqueurs.`, alternates: { canonical: `/genre/${GPATH[g]}/${params.ville}` } };
}
export default async function Page({ params }: { params: { genre: string; ville: string } }) {
  const g = GFROM[params.genre]; const profiles = await allProfiles(); const city = cityBySlug(profiles, params.ville) || cityFromSlug(params.ville);
  if (!g || !city || !/^[a-z0-9-]+$/.test(params.ville)) notFound();
  const n = profiles.filter((p) => p.genre === g && cityList(p).includes(city)).length;
  const regions = await regionMap(profiles);
  const here = profiles.filter((p) => p.genre === g && cityList(p).includes(city));
  const cr: [string, string][] = [["Accueil", "/"], [`Profils ${GTITLE[g]}`, `/genre/${GPATH[g]}`], [city, `/genre/${GPATH[g]}/${params.ville}`]];
  return <><Ld data={crumbs(cr)} /><Crumbs items={cr} /><Ld data={itemList(here, `Profils ${GTITLE[g]} à ${city}`)} /><Suspense><Home region={regions[city] || ""} regions={regions} key={g + params.ville} profiles={profiles} initialType={g} initialCity={city} h1={`Profils ${GTITLE[g]} à ${city}`} intro={<><Suspense fallback={null}><CityAssos city={city} /></Suspense><Suspense fallback={<p className="note" style={{ margin: "0 0 12px" }}>{`${n} profil${n > 1 ? "s" : ""} ${GTITLE[g].toLowerCase()} à ${city}. `}</p>}><CityIntro city={city} profiles={profiles} lead={`${n} profil${n > 1 ? "s" : ""} ${GTITLE[g].toLowerCase()} à ${city}. `} /></Suspense></>} /></Suspense></>;
}
