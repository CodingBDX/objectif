import type { Metadata } from "next";
import { Suspense } from "react";
import Home from "@/components/Home";
import { allProfiles } from "@/lib/data";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Recherche", robots: { index: false, follow: true }, alternates: { canonical: "/recherche" } };
export default async function Page() {
  const profiles = await allProfiles();
  return <Suspense><Home profiles={profiles} searchMode h1="Recherche" intro="" /></Suspense>;
}
