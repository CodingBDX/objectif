import type { Metadata } from "next";
import Legal from "@/components/Legal";
export const metadata: Metadata = { title: "Conditions d’utilisation", alternates: { canonical: "/cgu" } };
export default function Page() {
  return (
    <Legal title="Conditions d’utilisation" updated="30 octobre 2026">
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
      <h2 id="vip">6. Profils VIP (option payante)</h2>
      <p><b>6.1 Ce que c’est.</b> Le VIP est une option de visibilité et de confort pour ton profil : affichage prioritaire dans les listes, jusqu’à 20 photos, tarifs détaillés, réseaux sociaux, slogan, adresse personnalisée, remontée plus fréquente et statistiques. Le VIP ne garantit aucun résultat (nombre de vues, de contacts ou de rendez-vous).</p>
      <p><b>6.2 Prix et durée.</b> Les forfaits (durée et prix en euros) sont affichés dans « Modifier mon profil » avant toute commande, et le prix applicable est celui affiché au moment où tu commandes. Chaque forfait couvre une durée précise : il n’y a ni abonnement, ni renouvellement automatique.</p>
      <p><b>6.3 Paiement et activation.</b> Tu règles par Wero, PayPal ou virement, en indiquant la référence unique de ta commande. Après ton paiement, tu cliques sur « J’ai payé ». Ton VIP est activé après vérification manuelle de la réception du paiement, dans les meilleurs délais.</p>
      <p><b>6.4 Prolongation, pause et fin.</b> Si tu prolonges ton VIP, les jours achetés s’ajoutent à la fin de ton VIP en cours. Quand ton profil est en pause, le décompte du VIP s’arrête. À la fin de la période, ton profil repasse automatiquement en profil gratuit, sans démarche de ta part.</p>
      <p><b>6.5 Rétractation et remboursement.</b> Le VIP est un service numérique que tu demandes à voir activé immédiatement après paiement. En cochant la case prévue à cet effet au moment de la commande, tu demandes l’exécution immédiate du service et, dans la mesure permise par la loi, tu renonces à ton droit de rétractation une fois le VIP activé. Les jours déjà écoulés ne sont pas remboursés. Si tu as payé sans que le VIP soit activé, ou si tu as payé deux fois par erreur, tu es remboursée sur demande via la page Contact. Si ton profil est suspendu ou supprimé parce qu’il ne respecte pas les présentes conditions, le VIP en cours n’est pas remboursé.</p>
      <p><b>6.6 VIP offert.</b> Le VIP obtenu par parrainage ou en échange de points est gratuit, n’a pas de valeur monétaire et ne peut pas être converti en argent.</p>
      <p><b>6.7 Réclamation.</b> Pour toute question sur une commande, utilise la page <a href="/contact">Contact</a> en indiquant la référence de ta commande.</p>
      <h2>7. Responsabilité</h2>
      <p>Sex-Escorte met en relation des visiteurs et des créateurs mais n’est pas partie aux échanges entre eux et n’est pas responsable des prestations proposées. Le site est fourni « en l’état » et peut être interrompu pour maintenance.</p>
      <h2>8. Données personnelles</h2>
      <p>Le traitement de tes données est décrit dans la <a href="/confidentialite">politique de confidentialité</a>.</p>
      <h2>9. Droit applicable</h2>
      <p>Les présentes conditions sont soumises au droit français. En cas de litige, les tribunaux français sont compétents, sous réserve des règles protégeant les consommateurs.</p>
    </Legal>
  );
}
