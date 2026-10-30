import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import Home from "@/components/Home";
import { allProfiles, cityBySlug, cityFromSlug } from "@/lib/data";
import { cityList } from "@/lib/types";
import CityIntro from "@/components/CityIntro";
import CityAssos from "@/components/CityAssos";
import CityNearby from "@/components/CityNearby";
import { regionMap } from "@/lib/cityinfo";
import Ld, { crumbs, Crumbs, itemList } from "@/components/Ld";
import Link from "next/link";
import { MIN_INDEX, slug } from "@/lib/site";

export const dynamic = "force-dynamic";
export async function generateMetadata({ params }: { params: { ville: string } }): Promise<Metadata> {
  const ps = await allProfiles(); const city = cityBySlug(ps, params.ville); if (!city) return { robots: { index: false, follow: true } };
  const n = ps.filter((p) => p.genre !== "livecam" && cityList(p).includes(city)).length;
  return { title: `Escortes à ${city}`, description: `${n} profil${n > 1 ? "s" : ""} à ${city} : photos, tarifs, disponibilités et agenda des passages. Profils majeurs, vérifiés et protégés des arnaqueurs.`, alternates: { canonical: `/ville/${params.ville}` }, ...(n < MIN_INDEX ? { robots: { index: false, follow: true } } : {}) };
}
export default async function Page({ params }: { params: { ville: string } }) {
  const profiles = await allProfiles(); const city = cityBySlug(profiles, params.ville) || cityFromSlug(params.ville); if (!city || !/^[a-z0-9-]+$/.test(params.ville)) notFound();
  const regions = await regionMap(profiles);
  const here = profiles.filter((p) => p.genre !== "livecam" && cityList(p).includes(city));
  const cr: [string, string][] = [["Accueil", "/"], [`Escortes à ${city}`, `/ville/${params.ville}`]];
  const speN = new Map<string, [string, number]>(); here.forEach((p) => new Set(p.specialties.map((t) => t.toLowerCase())).forEach((t) => { const k = slug(t); if (k) speN.set(k, [t, (speN.get(k)?.[1] || 0) + 1]); }));
  const spes = [...speN.entries()].sort((a, b) => b[1][1] - a[1][1]).slice(0, 12);
  return <><Ld data={crumbs(cr)} /><div className="gut"><div className="pbar"><Crumbs items={cr} inline /></div></div><Ld data={itemList(here, `Escortes à ${city}`)} /><Suspense><Home region={regions[city] || ""} regions={regions} key={params.ville} profiles={profiles} initialCity={city} h1={`Escortes à ${city}`} intro={<><Suspense fallback={null}><CityAssos city={city} /></Suspense><Suspense fallback={<p className="note" style={{ margin: "0 0 12px" }}>Chargement des infos de la ville…</p>}><CityIntro city={city} profiles={profiles} /></Suspense><Suspense fallback={null}><CityNearby city={city} profiles={profiles} /></Suspense></>} /></Suspense>{spes.length > 0 && <nav className="gut spel" aria-label={`Spécialités à ${city}`}><b>Spécialités à {city} :</b> {spes.map(([k, [t, n]]) => <Link key={k} href={`/ville/${params.ville}/${k}`}>{t[0].toUpperCase() + t.slice(1)} ({n})</Link>)}</nav>}</>;
}
