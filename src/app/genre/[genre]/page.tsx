import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import Home from "@/components/Home";
import { allProfiles } from "@/lib/data";
import { GFROM, GPATH, GTITLE } from "@/lib/site";

export const dynamic = "force-dynamic";
export async function generateMetadata({ params }: { params: { genre: string } }): Promise<Metadata> {
  const g = GFROM[params.genre]; if (!g) return {};
  return { title: `Créateurs ${GTITLE[g]}`, description: `Annuaire des profils ${GTITLE[g].toLowerCase()} : photographes, vidéastes et artistes. Portfolios, disponibilités et villes visitées.`, alternates: { canonical: `/genre/${GPATH[g]}` } };
}
export default async function Page({ params }: { params: { genre: string } }) {
  const g = GFROM[params.genre]; if (!g) notFound();
  const profiles = await allProfiles();
  return <Suspense><Home key={g} profiles={profiles} initialType={g} h1={`Profils ${GTITLE[g]}`} intro={`${profiles.filter((p) => p.genre === g).length} profils ${GTITLE[g].toLowerCase()} à découvrir : portfolios, disponibilités et agenda des villes visitées.`} /></Suspense>;
}
