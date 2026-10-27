import type { Metadata } from "next";
import Legal from "@/components/Legal";
export const metadata: Metadata = { title: "Politique de confidentialité", alternates: { canonical: "/confidentialite" } };
export default function Page() {
  return (
    <Legal title="Politique de confidentialité" updated="octobre 2026">
      <h2>Responsable du traitement</h2>
      <p><b>[À COMPLÉTER : ton nom ou ta société]</b>, joignable à <b>[À COMPLÉTER : e-mail]</b>.</p>
      <h2>Données collectées</h2>
      <ul>
        <li><b>Compte :</b> adresse e-mail et mot de passe (chiffré), date de confirmation de la majorité.</li>
        <li><b>Profil (publié par toi) :</b> nom ou pseudo, genre, ville, présentation, spécialités, photos, vidéo, disponibilités, déplacements, et, si tu les renseignes, numéro de téléphone, réseaux sociaux et site. <b>Ces informations sont visibles de tous les visiteurs.</b></li>
        <li><b>Commentaires, signalements et messages</b> envoyés via le site.</li>
        <li><b>Statistiques de profil :</b> nombre de vues et de clics par jour, sans identifier les visiteurs.</li>
        <li><b>Localisation (« Près de moi ») :</b> utilisée uniquement dans ton navigateur pour trouver ta ville ; elle n’est pas enregistrée. Le nom de la commune est demandé à l’API officielle des adresses (api-adresse.data.gouv.fr).</li>
      </ul>
      <h2>Finalités et bases légales</h2>
      <p>Gérer ton compte et publier ton profil (exécution du contrat), modérer les contenus et assurer la sécurité (intérêt légitime), répondre à tes messages, mesurer l’audience de ton profil (intérêt légitime), respecter nos obligations légales.</p>
      <h2>Stockage dans ton navigateur</h2>
      <p>Le site utilise le stockage local de ton navigateur pour te garder connecté, retenir ta confirmation de majorité, tes favoris, ton affichage (cartes ou liste) et ta dernière ville. Il n’y a ni publicité ni suivi publicitaire.</p>
      <h2>Destinataires et hébergeurs</h2>
      <p>Tes données sont hébergées par Supabase (base de données et fichiers) et Vercel (site), qui peuvent traiter des données hors de l’Union européenne avec des garanties appropriées. Elles ne sont ni vendues ni cédées.</p>
      <h2>Durée de conservation</h2>
      <p>Tant que ton compte existe. Si tu supprimes ton profil ou ton compte, tes données sont effacées, hors obligations légales de conservation.</p>
      <h2>Tes droits</h2>
      <p>Tu peux accéder à tes données, les corriger, les supprimer, t’opposer à leur traitement ou demander leur portabilité en écrivant à <b>[À COMPLÉTER : e-mail]</b> ou via le <a href="/contact">formulaire de contact</a>. Tu peux aussi saisir la CNIL (cnil.fr).</p>
    </Legal>
  );
}
