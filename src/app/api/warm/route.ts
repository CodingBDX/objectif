import { NextResponse } from "next/server";
import { allProfiles } from "@/lib/data";
import { nearbyCommunes, regionMap } from "@/lib/cityinfo";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

/** Préchauffe le cache des villes (communes voisines + régions) pour que la première visite de chaque ville soit rapide.
 *  Appelée chaque nuit par Vercel (voir vercel.json). Ne renvoie aucune donnée sensible. */
export async function GET() {
  const profiles = await allProfiles();
  const cc: Record<string, number> = {}; profiles.forEach((p) => { cc[p.city] = (cc[p.city] || 0) + 1; });
  const cities = Object.entries(cc).sort((a, b) => b[1] - a[1]).slice(0, 40).map(([c]) => c);
  await regionMap(profiles);
  await Promise.all(cities.map((c) => nearbyCommunes(c, 3)));
  return NextResponse.json({ ok: true, villes: cities.length });
}
