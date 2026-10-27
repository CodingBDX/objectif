import type { Metadata } from "next";
import { Suspense } from "react";
import Home from "@/components/Home";
import { allProfiles } from "@/lib/data";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: { absolute: "HeyPapi, annuaire des créateurs : photographes, vidéastes, artistes et livecam" },
  description: "Trouve des photographes, vidéastes, artistes et créateurs livecam près de chez toi. Profils vérifiés, portfolios, disponibilités et agenda des villes visitées. 50 % reversés aux associations.",
  alternates: { canonical: "/" }
};
export default async function Page() {
  const profiles = await allProfiles();
  return <Suspense><Home profiles={profiles} h1="Annuaire des escortes" intro="Photographes, vidéastes, artistes et créateurs livecam : parcours les portfolios, vois qui est disponible maintenant et où les créateurs passent prochainement." /></Suspense>;
}
