import type { Metadata } from "next";
import Link from "next/link";
import { GUIDES } from "@/lib/guides";
import Ld, { crumbs, Crumbs } from "@/components/Ld";

export const metadata: Metadata = {
  title: "Guides pour les escortes : sécurité, profil, vie privée",
  description: "Conseils pratiques pour les escortes : créer un profil qui attire, assurer sa sécurité, repérer les arnaques, se faire vérifier et protéger sa vie privée.",
  alternates: { canonical: "/guides" }
};
export default function Page() {
  const cr: [string, string][] = [["Accueil", "/"], ["Guides", "/guides"]];
  return (
    <section className="gut">
      <Ld data={crumbs(cr)} />
      <div className="pbar"><Crumbs items={cr} inline /></div>
      <div className="pfc" style={{ maxWidth: 820 }}>
        <h1 style={{ font: "700 clamp(28px,5vw,38px)/1.1 var(--fd)", color: "var(--pink)", margin: "0 0 6px" }}>Guides pour les escortes</h1>
        <p className="note" style={{ margin: "0 0 16px" }}>Des conseils simples, écrits pour toi : profil, sécurité, vie privée, démarches. Réservé aux adultes.</p>
        <div className="guides">
          {GUIDES.map((g) => <Link key={g.slug} href={`/guides/${g.slug}`} className="gcard"><span className="ge" aria-hidden="true">{g.emoji}</span><b>{g.title}</b><span>{g.desc}</span></Link>)}
        </div>
      </div>
    </section>
  );
}
