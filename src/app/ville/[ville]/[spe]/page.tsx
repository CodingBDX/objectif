import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import Home from "@/components/Home";
import { allProfiles, cityBySlug } from "@/lib/data";
import { cityList, cap } from "@/lib/types";
import { regionMap } from "@/lib/cityinfo";
import { slug } from "@/lib/site";
import Ld, { crumbs, Crumbs, itemList } from "@/components/Ld";
import type { Profile } from "@/lib/types";

export const dynamic = "force-dynamic";

/** Trouve la spécialité (telle qu'écrite par les profils) à partir de son adresse, parmi les profils de la ville. */
function find(ps: Profile[], city: string, spe: string) {
  const here = ps.filter((p) => p.genre !== "livecam" && cityList(p).includes(city));
  const withSpe = here.filter((p) => p.specialties.some((t) => slug(t) === spe));
  const label = withSpe.flatMap((p) => p.specialties).find((t) => slug(t) === spe);
  return { here, withSpe, label: label ? cap(label.toLowerCase()) : "" };
}
export async function generateMetadata({ params }: { params: { ville: string; spe: string } }): Promise<Metadata> {
  const ps = await allProfiles(); const city = cityBySlug(ps, params.ville); if (!city) return { robots: { index: false, follow: true } };
  const { withSpe, label } = find(ps, city, params.spe); if (!label) return { robots: { index: false, follow: true } };
  const n = withSpe.length;
  return {
    title: `${label} à ${city} : escortes`,
    description: `${n} profil${n > 1 ? "s" : ""} proposant « ${label.toLowerCase()} » à ${city} : photos, tarifs, disponibilités. Profils majeurs, vérifiés et protégés des arnaqueurs.`,
    alternates: { canonical: `/ville/${params.ville}/${params.spe}` }
  };
}
export default async function Page({ params }: { params: { ville: string; spe: string } }) {
  if (!/^[a-z0-9-]+$/.test(params.ville) || !/^[a-z0-9-]+$/.test(params.spe)) notFound();
  const profiles = await allProfiles(); const city = cityBySlug(profiles, params.ville); if (!city) notFound();
  const { withSpe, label } = find(profiles, city, params.spe); if (!label) notFound();
  const regions = await regionMap(profiles);
  const cr: [string, string][] = [["Accueil", "/"], [`Escortes à ${city}`, `/ville/${params.ville}`], [`${label} à ${city}`, `/ville/${params.ville}/${params.spe}`]];
  return (
    <>
      <Ld data={crumbs(cr)} /><div className="gut"><div className="pbar"><Crumbs items={cr} inline /></div></div>
      <Ld data={itemList(withSpe, `${label} à ${city}`)} />
      <Suspense><Home key={params.ville + params.spe} region={regions[city] || ""} regions={regions} profiles={profiles} initialCity={city} initialTag={label.toLowerCase()} h1={`${label} à ${city}`}
        intro={`${withSpe.length} profil${withSpe.length > 1 ? "s" : ""} proposant « ${label.toLowerCase()} » à ${city}. Compare les photos, les tarifs et les disponibilités, puis contacte directement le profil qui te plaît.`} /></Suspense>
    </>
  );
}
