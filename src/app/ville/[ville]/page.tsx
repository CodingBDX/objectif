import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import Home from "@/components/Home";
import { allProfiles, cityBySlug, cityFromSlug } from "@/lib/data";
import { cityList } from "@/lib/types";
import CityIntro from "@/components/CityIntro";
import CityAssos from "@/components/CityAssos";
import { regionMap } from "@/lib/cityinfo";

export const dynamic = "force-dynamic";
export async function generateMetadata({ params }: { params: { ville: string } }): Promise<Metadata> {
  const city = cityBySlug(await allProfiles(), params.ville); if (!city) return {};
  return { title: `Escortes à ${city}`, description: `Photographes, vidéastes, artistes et livecam à ${city} : portfolios, disponibilités et agenda des passages.`, alternates: { canonical: `/ville/${params.ville}` } };
}
export default async function Page({ params }: { params: { ville: string } }) {
  const profiles = await allProfiles(); const city = cityBySlug(profiles, params.ville) || cityFromSlug(params.ville); if (!city || !/^[a-z0-9-]+$/.test(params.ville)) notFound();
  const regions = await regionMap(profiles);
  return <Suspense><Home region={regions[city] || ""} regions={regions} key={params.ville} profiles={profiles} initialCity={city} h1={`Escortes à ${city}`} intro={<><Suspense fallback={null}><CityAssos city={city} /></Suspense><Suspense fallback={<p className="note" style={{ margin: "0 0 12px" }}>Chargement des infos de la ville…</p>}><CityIntro city={city} profiles={profiles} /></Suspense></>} /></Suspense>;
}
