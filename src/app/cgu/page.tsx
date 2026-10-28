import type { Metadata } from "next";
import Legal from "@/components/Legal";
export const metadata: Metadata = { title: "Conditions d’utilisation", alternates: { canonical: "/cgu" } };
export default function Page() {
  return (
    <Legal title="Conditions d’utilisation" updated="octobre 2026">
      <h2>1. Objet</h2>
      <p>Sex-Escorte est un annuaire en ligne de photographes, vidéastes, artistes et créateurs livecam. Les présentes conditions encadrent l’utilisation du site.</p>
      <h2>2. Accès réservé aux majeurs</h2>
      <p>Le site est strictement réservé aux personnes <b>âgées de 18 ans ou plus</b>. En entrant sur le site puis en créant un compte, tu certifies avoir 18 ans révolus. Un compte dont le titulaire est mineur sera supprimé sans préavis.</p>
      <h2>3. Compte et profil</h2>
      <p>Tu t’engages à fournir des informations exactes, à garder ton mot de passe confidentiel et à ne créer qu’un profil par personne. Tu peux modifier, mettre en pause ou demander la suppression de ton profil à tout moment.</p>
      <h2>4. Contenus publiés</h2>
      <p>Tu garantis détenir tous les droits sur les photos et vidéos que tu publies, et avoir l’accord des personnes qui y figurent. Sont <b>interdits</b> : les contenus concernant des mineurs, les contenus à caractère sexuel explicite ou pornographique, les contenus violents, haineux, discriminatoires ou illégaux, l’usurpation d’identité, les arnaques et le harcèlement. Les contenus doivent rester professionnels.</p>
      <h2>5. Modération et signalement</h2>
      <p>Chaque profil peut être signalé avec le bouton « Signaler ce profil ». Sex-Escorte peut masquer ou supprimer, sans préavis, tout contenu ou profil contraire aux présentes conditions.</p>
      <h2>6. Profils VIP</h2>
      <p>L’option VIP met un profil en avant. Ses conditions tarifaires seront communiquées avant tout paiement. <b>[À COMPLÉTER : prix, durée, rétractation et remboursement]</b></p>
      <h2>7. Responsabilité</h2>
      <p>Sex-Escorte met en relation des visiteurs et des créateurs mais n’est pas partie aux échanges entre eux et n’est pas responsable des prestations proposées. Le site est fourni « en l’état » et peut être interrompu pour maintenance.</p>
      <h2>8. Données personnelles</h2>
      <p>Le traitement de tes données est décrit dans la <a href="/confidentialite">politique de confidentialité</a>.</p>
      <h2>9. Droit applicable</h2>
      <p>Les présentes conditions sont soumises au droit français. En cas de litige, les tribunaux français sont compétents, sous réserve des règles protégeant les consommateurs.</p>
    </Legal>
  );
}
