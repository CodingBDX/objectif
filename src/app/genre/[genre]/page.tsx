import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import Home from "@/components/Home";
import { allProfiles } from "@/lib/data";
import { GFROM, GPATH, GTITLE } from "@/lib/site";
import Ld, { crumbs, itemList } from "@/components/Ld";

export const dynamic = "force-dynamic";
export async function generateMetadata({ params }: { params: { genre: string } }): Promise<Metadata> {
  const g = GFROM[params.genre]; if (!g) return {};
  return { title: g === "livecam" ? "Escortes livecam" : `Escortes ${GTITLE[g].toLowerCase()}`, description: `Annuaire des escortes ${g === "livecam" ? "livecam" : GTITLE[g].toLowerCase()} : photos, tarifs, disponibilités et villes visitées. Profils majeurs et protégés des arnaqueurs.`, alternates: { canonical: `/genre/${GPATH[g]}` } };
}
export default async function Page({ params }: { params: { genre: string } }) {
  const g = GFROM[params.genre]; if (!g) notFound();
  const profiles = await allProfiles();
  return <><Ld data={crumbs([["Accueil", "/"], [`Profils ${GTITLE[g]}`, `/genre/${GPATH[g]}`]])} /><Ld data={itemList(profiles.filter((p) => p.genre === g), `Profils ${GTITLE[g]}`)} /><Suspense><Home key={g} profiles={profiles} initialType={g} h1={`Profils ${GTITLE[g]}`} intro={`${profiles.filter((p) => p.genre === g).length} profils ${GTITLE[g].toLowerCase()} à découvrir : portfolios, disponibilités et agenda des villes visitées.`} /></Suspense></>;
}
