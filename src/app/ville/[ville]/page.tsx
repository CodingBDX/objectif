import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import Home from "@/components/Home";
import { allProfiles, cityBySlug } from "@/lib/data";
import { cityList } from "@/lib/types";
import { cityIntro } from "@/lib/cityinfo";

export const dynamic = "force-dynamic";
export async function generateMetadata({ params }: { params: { ville: string } }): Promise<Metadata> {
  const city = cityBySlug(await allProfiles(), params.ville); if (!city) return {};
  return { title: `Créateurs à ${city}`, description: `Photographes, vidéastes, artistes et livecam à ${city} : portfolios, disponibilités et agenda des passages.`, alternates: { canonical: `/ville/${params.ville}` } };
}
export default async function Page({ params }: { params: { ville: string } }) {
  const profiles = await allProfiles(); const city = cityBySlug(profiles, params.ville); if (!city) notFound();
  return <Suspense><Home key={params.ville} profiles={profiles} initialCity={city} h1={`Créateurs à ${city}`} intro={await cityIntro(city, profiles)} /></Suspense>;
}
