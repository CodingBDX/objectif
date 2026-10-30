import type { Metadata } from "next";
import { Suspense } from "react";
import Home from "@/components/Home";
import { allProfiles } from "@/lib/data";
import Faq from "@/components/Faq";
import Link from "next/link";
import { GUIDES } from "@/lib/guides";
import { SkeletonCards } from "@/components/Skeleton";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: { absolute: "Escortes en France : filles, hommes, trans | Sex-Escorte" },
  description: "Annuaire d’escortes en France : filles, hommes, trans et livecam. Photos, disponibilités, villes visitées et contact direct. Profils majeurs, protégés des arnaqueurs.",
  alternates: { canonical: "/" }
};
export default function Page() {
  return <Suspense fallback={<SkeletonCards n={9} />}><PageBody /></Suspense>;
}
async function PageBody() {
  const profiles = await allProfiles();
  return <><Suspense><Home profiles={profiles} h1="Annuaire des escortes" intro="Parcours les profils, vois qui est disponible maintenant et où les escortes passent prochainement." /></Suspense><div className="gut" style={{ paddingBlock: "8px 40px", maxWidth: 1000 }}><section aria-labelledby="blog-h" style={{ marginBottom: 28 }}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}><h2 id="blog-h" style={{ font: "700 22px/1.2 var(--fd)", margin: "0 0 12px" }}>Derniers articles du blog</h2><Link href="/guides" className="note">Tous les articles →</Link></div><div className="guides">{[...GUIDES].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3).map((g) => <Link key={g.slug} href={`/guides/${g.slug}`} className="gcard"><span className="ge" aria-hidden="true">{g.emoji}</span><b>{g.title}</b><span>{g.desc}</span></Link>)}</div></section><Faq /></div></>;
}
