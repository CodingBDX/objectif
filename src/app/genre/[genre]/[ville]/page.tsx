import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import Home from "@/components/Home";
import { allProfiles, cityBySlug } from "@/lib/data";
import { GFROM, GPATH, GTITLE } from "@/lib/site";
import { cityList } from "@/lib/types";
import { cityIntro } from "@/lib/cityinfo";

export const dynamic = "force-dynamic";
export async function generateMetadata({ params }: { params: { genre: string; ville: string } }): Promise<Metadata> {
  const g = GFROM[params.genre]; const city = cityBySlug(await allProfiles(), params.ville); if (!g || !city) return {};
  return { title: `Profils ${GTITLE[g]} à ${city}`, description: `Profils ${GTITLE[g].toLowerCase()} à ${city} : photographes, vidéastes et artistes. Portfolios, disponibilités et agenda.`, alternates: { canonical: `/genre/${GPATH[g]}/${params.ville}` } };
}
export default async function Page({ params }: { params: { genre: string; ville: string } }) {
  const g = GFROM[params.genre]; const profiles = await allProfiles(); const city = cityBySlug(profiles, params.ville);
  if (!g || !city) notFound();
  const n = profiles.filter((p) => p.genre === g && cityList(p).includes(city)).length;
  return <Suspense><Home key={g + params.ville} profiles={profiles} initialType={g} initialCity={city} h1={`Profils ${GTITLE[g]} à ${city}`} intro={`${n} profil${n > 1 ? "s" : ""} ${GTITLE[g].toLowerCase()} à ${city}. ` + (await cityIntro(city, profiles)).replace(/^[^.]*\. /, "")} /></Suspense>;
}
