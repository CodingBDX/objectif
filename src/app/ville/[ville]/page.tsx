import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import Home from "@/components/Home";
import { allProfiles, cityBySlug } from "@/lib/data";
import { cityList } from "@/lib/types";

export const dynamic = "force-dynamic";
export async function generateMetadata({ params }: { params: { ville: string } }): Promise<Metadata> {
  const city = cityBySlug(await allProfiles(), params.ville); if (!city) return {};
  return { title: `Créateurs à ${city}`, description: `Photographes, vidéastes, artistes et livecam à ${city} : portfolios, disponibilités et agenda des passages.`, alternates: { canonical: `/ville/${params.ville}` } };
}
export default async function Page({ params }: { params: { ville: string } }) {
  const profiles = await allProfiles(); const city = cityBySlug(profiles, params.ville); if (!city) notFound();
  const n = profiles.filter((p) => cityList(p).includes(city)).length;
  return <Suspense><Home key={params.ville} profiles={profiles} initialCity={city} h1={`Créateurs à ${city}`} intro={`${n} profil${n > 1 ? "s" : ""} à ${city} : photographes, vidéastes, artistes et livecam, avec leurs disponibilités et leurs prochains passages.`} /></Suspense>;
}
