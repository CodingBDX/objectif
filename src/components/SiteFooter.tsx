import Link from "next/link";
import { Tr } from "@/lib/i18n";
import { InstallLink } from "@/components/InstallBanner";

/** Pied de page : marque et mission, trois colonnes de liens, bandeau 18+. */
export default function SiteFooter({ escort }: { escort: boolean }) {
  return (
    <footer className="sf" id="foot">
      <div className="gut sf-in">
        <div className="sf-brand">
          <b className="sf-logo">Sex-Escorte<span aria-hidden="true">♥</span></b>
          <p><Tr k="Sex-Escorte.com soutient les escortes et les protège des arnaqueurs et des réseaux de proxénétisme, d’adultes comme de mineurs. Contenus professionnels uniquement. Les profils sont réservés aux personnes majeures qui détiennent les droits de leurs images et vidéos." /></p>
        </div>
        <nav className="sf-col" aria-label="Explorer">
          <h2>Explorer</h2>
          <Link href="/genre/filles">Filles</Link><Link href="/genre/hommes">Hommes</Link><Link href="/genre/trans">Trans</Link><Link href="/genre/livecam">Livecam</Link>
          <Link href="/carte">Carte</Link>
        </nav>
        <nav className="sf-col" aria-label="Pour les escortes">
          <h2>Pour les escortes</h2>
          <Link href="/rejoindre"><Tr k="Rejoindre" /></Link><Link href="/guides">Guides</Link>
          <Link href="/statistiques">Statistiques</Link>
          {escort && <Link href="/associations">Associations</Link>}
          <Link href="/contact?s=vip">Devenir VIP</Link>
        </nav>
        <nav className="sf-col" aria-label="Informations">
          <h2>Informations</h2>
          <Link href="/mentions-legales">Mentions légales</Link><Link href="/cgu">Conditions d’utilisation</Link><Link href="/confidentialite">Confidentialité</Link><Link href="/contact">Contact</Link>
        </nav>
      </div>
      <div className="gut sf-bot">
        <span className="sf-18">18+</span>
        <span>© {new Date().getFullYear()} Sex-Escorte · <Tr k="Réservé aux adultes" /></span>
        <InstallLink bare />
      </div>
    </footer>
  );
}
