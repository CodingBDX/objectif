import Link from "next/link";
import { nearbyCommunes } from "@/lib/cityinfo";
import { slug } from "@/lib/site";

/** Texte éditorial sous la liste d'une page ville (150 à 300 mots) : de quoi donner du contenu propre à Google,
 *  sans vocabulaire explicite. Les grandes villes ont un paragraphe écrit à la main, les autres un texte commun. */

const LOCAL: Record<string, string> = {
  paris: "À Paris, les profils sont répartis dans les vingt arrondissements et la petite couronne : beaucoup reçoivent dans le centre, d’autres se déplacent à l’hôtel ou à domicile. Pense à regarder les villes indiquées sur chaque fiche : certaines escortes de Boulogne-Billancourt, Clichy, Asnières-sur-Seine ou Saint-Denis acceptent aussi les rendez-vous dans Paris intra-muros.",
  bordeaux: "À Bordeaux, les profils se partagent entre le centre-ville et la métropole : Mérignac, Pessac, Talence, Bègles ou Villenave-d’Ornon sont à quelques minutes en tram. Beaucoup d’escortes de la métropole indiquent Bordeaux comme ville supplémentaire, elles apparaissent donc aussi sur cette page.",
  annecy: "À Annecy, le site regroupe les profils de la ville et du bassin annécien. Proche de la Suisse, la région voit passer des escortes en tournée entre Annecy, Annemasse, Chambéry et Genève : le calendrier des passages t’indique qui sera en ville dans les prochains jours."
};

const list = (a: string[]) => (a.length > 1 ? a.slice(0, -1).join(", ") + " et " + a[a.length - 1] : a[0] || "");

export default async function CityGuide({ city, n }: { city: string; n: number }) {
  const near = await nearbyCommunes(city, 3);
  const local = LOCAL[slug(city)];
  return (
    <section className="gut cityguide" aria-labelledby="cg-h" style={{ maxWidth: 860, paddingBlock: "8px 32px" }}>
      <h2 id="cg-h" style={{ font: "700 22px/1.25 var(--fd)", margin: "0 0 12px" }}>Escortes à {city} : comment ça marche</h2>
      <p>
        Sex-Escorte réunit {n > 1 ? `${n} profils` : "les profils"} d’escortes majeures à {city} : filles, hommes et personnes trans, qui gèrent elles-mêmes leur annonce.
        Chaque fiche indique les disponibilités, les tarifs quand la personne choisit de les afficher, si elle reçoit ou se déplace, et ses prochains passages dans d’autres villes.
      </p>
      {local && <p>{local}</p>}
      {!local && near.length > 0 && <p>Autour de {city}, pense aussi à regarder les profils de {list(near.map((c) => c))} : beaucoup d’escortes indiquent plusieurs villes proches sur leur fiche.</p>}
      <p>
        Pour un rendez-vous qui se passe bien : privilégie les <b>profils vérifiés</b> (photo de contrôle validée par le site), présente-toi poliment et clairement,
        respecte le cadre et les limites fixés par la personne, et ne demande jamais d’informations privées. Si un profil te semble faux, géré par un tiers
        ou si tu as un doute sur l’âge ou le consentement d’une personne, utilise le bouton <b>Signaler</b> sur sa fiche : le site refuse tout réseau de proxénétisme
        et toute exploitation de mineurs.
      </p>
      <p>
        Tu es escorte à {city} ? <Link href="/rejoindre">Crée ton profil gratuitement</Link> et consulte nos guides :{" "}
        <Link href="/guides/securite-avant-pendant-apres-un-rendez-vous">sécurité en rendez-vous</Link>,{" "}
        <Link href="/guides/reperer-arnaques-et-mauvais-clients">repérer les arnaques</Link>,{" "}
        <Link href="/guides/sante-et-prevention">santé et prévention</Link> et{" "}
        <Link href="/guides/cadre-legal-en-france">cadre légal en France</Link>.
      </p>
    </section>
  );
}
