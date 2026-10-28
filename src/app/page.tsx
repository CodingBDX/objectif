import type { Metadata } from "next";
import { Suspense } from "react";
import Home from "@/components/Home";
import { allProfiles } from "@/lib/data";
import Faq from "@/components/Faq";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: { absolute: "Sex-Escorte, annuaire des escortes populaire, sexy, numéro un" },
  description: "Trouve des escortes près de chez toi. Profils vérifiés, photos, disponibilités et agenda des villes visitées. 50 % reversés aux associations.",
  alternates: { canonical: "/" }
};
export default async function Page() {
  const profiles = await allProfiles();
  return <><Suspense><Home profiles={profiles} h1="Annuaire des escortes" intro="Parcours les profils, vois qui est disponible maintenant et où les escortes passent prochainement." /></Suspense><div className="gut" style={{ paddingBlock: "8px 40px", maxWidth: 1000 }}><Faq /></div></>;
}
