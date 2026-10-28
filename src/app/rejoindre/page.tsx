import type { Metadata } from "next";
import Link from "next/link";
import { Tr } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "Rejoindre Sex-Escorte",
  description: "Crée ton profil gratuit sur Sex-Escorte.com : un annuaire pensé pour protéger les escortes des arnaqueurs et des réseaux de proxénétisme.",
  alternates: { canonical: "/rejoindre" },
};

const BENEFITS: [string, string, string][] = [
  ["🛡️", "Protégée avant tout", "Vérifie un numéro avant un rendez-vous : tu vois s’il a déjà été signalé par d’autres profils."],
  ["🆓", "Profil gratuit", "Photos, description, tarifs, villes : tu publies gratuitement et tu modifies quand tu veux."],
  ["⏸️", "Tu gardes la main", "Mets ton profil en pause en un clic. Tes photos restent à toi, tu les retires quand tu veux."],
  ["👑", "VIP pour être vue", "Mise en avant, plusieurs tarifs, accès à la carte des logements réservée aux profils VIP et vérifiés."],
];
const STEPS: [string, string][] = [
  ["Crée ton compte", "Une adresse e-mail et un mot de passe, rien d’autre."],
  ["Compose ton profil", "Ajoute tes photos, ta présentation et tes tarifs. Tu choisis ce que tu montres."],
  ["Sois visible", "Ton profil apparaît dans l’annuaire. Passe VIP et fais-le vérifier pour plus de visibilité."],
];

export default function Page() {
  return (
    <div className="rj gut">
      <section className="rjh">
        <span className="rjk"><Tr k="Pour les escortes indépendantes" /></span>
        <h1><Tr k="Ton annuaire, ta protection." /></h1>
        <p><Tr k="Sex-Escorte.com soutient les escortes et les protège des arnaqueurs et des réseaux de proxénétisme, d’adultes comme de mineurs." /></p>
        <div className="rja"><Link className="btn" href="/connexion?inscription=1"><Tr k="Créer mon profil gratuit" /></Link><Link className="btn ghost" href="/"><Tr k="Voir l’annuaire" /></Link></div>
        <small className="rjs"><Tr k="Réservé aux personnes majeures qui détiennent les droits de leurs images et vidéos." /></small>
      </section>

      <section className="rjg" aria-label="Avantages">
        {BENEFITS.map(([e, t, d]) => <article key={t} className="panel rjc"><span className="rje" aria-hidden="true">{e}</span><h2><Tr k={t} /></h2><p><Tr k={d} /></p></article>)}
      </section>

      <section className="panel rjst">
        <h2><Tr k="Comment ça marche" /></h2>
        <ol>{STEPS.map(([t, d], i) => <li key={t}><b className="rjn">{i + 1}</b><div><strong><Tr k={t} /></strong><span><Tr k={d} /></span></div></li>)}</ol>
      </section>

      <section className="rjf">
        <h2><Tr k="Prête à rejoindre Sex-Escorte ?" /></h2>
        <p><Tr k="L’inscription prend deux minutes." /></p>
        <Link className="btn" href="/connexion?inscription=1"><Tr k="Créer mon profil" /></Link>
      </section>
    </div>
  );
}
