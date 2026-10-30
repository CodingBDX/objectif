import Link from "next/link";
import { Tr } from "@/lib/i18n";
import { InstallLink } from "@/components/InstallBanner";
import { cap } from "@/lib/types";

/** Pied de page : bandeau d'invitation, marque, colonnes de liens, spécialités, bandeau 18+. */
export default function SiteFooter({ escort, specs = [] }: { escort: boolean; specs?: string[] }) {
  return (
    <footer className="sf" id="foot">
      <div className="gut">
        <div className="sf-cta">
          <div><b>Tu es escorte ?</b><p>Crée ton profil gratuitement, protège-toi des arnaqueurs et reçois plus de contacts.</p></div>
          <Link className="sf-btn" href="/rejoindre"><Tr k="Rejoindre" /> <span aria-hidden="true">→</span></Link>
        </div>
        <div className="sf-in">
          <div className="sf-brand">
            <b className="sf-logo">Sex-Escorte<span aria-hidden="true">♥</span></b>
            <p><Tr k="Sex-Escorte.com soutient les escortes et les protège des arnaqueurs et des réseaux de proxénétisme, d’adultes comme de mineurs. Contenus professionnels uniquement. Les profils sont réservés aux personnes majeures qui détiennent les droits de leurs images et vidéos." /></p>
            <ul className="sf-trust"><li>✔ Profils vérifiés</li><li>🛡 Anti-arnaque</li><li>🔞 Adultes</li></ul>
          </div>
          <nav className="sf-col" aria-label="Explorer">
            <h2>Explorer</h2>
            <Link href="/genre/filles">Filles</Link><Link href="/genre/hommes">Hommes</Link><Link href="/genre/trans">Trans</Link><Link href="/genre/livecam">Livecam</Link><Link href="/carte">Carte</Link>
          </nav>
          <nav className="sf-col" aria-label="Pour les escortes">
            <h2>Pour les escortes</h2>
            <Link href="/guides">Blog</Link><Link href="/statistiques">Statistiques</Link>
            {escort && <Link href="/associations">Associations</Link>}
            <Link href="/contact?s=vip">Devenir VIP</Link>
          </nav>
          <nav className="sf-col" aria-label="Informations">
            <h2>Informations</h2>
            <Link href="/mentions-legales">Mentions légales</Link><Link href="/cgu">Conditions d’utilisation</Link><Link href="/confidentialite">Confidentialité</Link><Link href="/contact">Contact</Link>
          </nav>
          {specs.length > 0 && <nav className="sf-col sf-specs" aria-label="Spécialités">
            <h2>Spécialités</h2>
            <div>{specs.map((t) => <Link key={t} href={`/?tag=${encodeURIComponent(t)}`}>{cap(t)}</Link>)}</div>
          </nav>}
        </div>
        <div className="sf-bot">
          <span className="sf-18">18+</span>
          <span>© {new Date().getFullYear()} Sex-Escorte · <Tr k="Réservé aux adultes" /></span>
          <InstallLink bare />
        </div>
      </div>
    </footer>
  );
}
