import type { Metadata } from "next";
import Legal from "@/components/Legal";
export const metadata: Metadata = { title: "Mentions légales", alternates: { canonical: "/mentions-legales" } };
export default function Page() {
  return (
    <Legal title="Mentions légales" updated="octobre 2026">
      <h2>Éditeur du site</h2>
      <p>HeyPapi est édité par <b>[À COMPLÉTER : ton nom et prénom, ou la raison sociale de ta société]</b>, <b>[À COMPLÉTER : adresse postale]</b>.<br />
        Contact : <b>[À COMPLÉTER : adresse e-mail]</b> ou via le <a href="/contact">formulaire de contact</a>.<br />
        Directeur de la publication : <b>[À COMPLÉTER]</b>.<br />
        SIRET (si activité professionnelle) : <b>[À COMPLÉTER]</b>.</p>
      <h2>Hébergement</h2>
      <p>Le site est hébergé par Vercel Inc. (États-Unis, vercel.com). Les données (comptes, profils, photos et vidéos) sont stockées chez Supabase (supabase.com).</p>
      <h2>Contenus publiés par les membres</h2>
      <p>Les profils, photos, vidéos et commentaires sont publiés par les membres, sous leur responsabilité. HeyPapi agit en qualité d’hébergeur de ces contenus. Tout contenu illicite peut être signalé avec le bouton « Signaler ce profil » ou via le formulaire de contact ; il sera examiné et retiré rapidement s’il est manifestement illicite.</p>
      <h2>Propriété intellectuelle</h2>
      <p>La marque, le logo et le design du site sont protégés. Chaque membre reste propriétaire de ses photos et vidéos et garantit détenir les droits nécessaires à leur publication. Les images portent le filigrane « © HeyPapi » ; toute reproduction sans autorisation est interdite.</p>
      <h2>Accès réservé aux majeurs</h2>
      <p>Le site est réservé aux personnes âgées de 18 ans ou plus.</p>
    </Legal>
  );
}
