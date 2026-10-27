import Link from "next/link";
import { assosForViewer } from "@/lib/assosServer";
import { assoCities } from "@/lib/assos";
import { slug } from "@/lib/site";

/** Bulles « soutien » en haut d'une page ville : associations de la ville + associations nationales. Invisible pour tous sauf les profils escortes. */
export default async function CityAssos({ city }: { city: string }) {
  const { allowed, list } = await assosForViewer();
  if (!allowed) return null;
  const s = slug(city);
  const here = list.filter((a) => assoCities(a).some((c) => slug(c) === s));
  const nat = list.filter((a) => a.national);
  const show = [...here, ...nat.filter((n) => !here.some((h) => h.id === n.id))].slice(0, 6);
  if (!show.length) return null;
  return (
    <nav className="nearb" aria-label={`Associations de soutien à ${city}`}>
      <span className="nearh">🤝 Soutien à {city} :</span>
      {show.map((a) => <Link key={a.id} className="nbub" href={`/associations/${a.slug}`}>{a.name}{a.national && <b>France</b>}</Link>)}
      <Link className="nbub" href={`/associations?ville=${encodeURIComponent(city)}`}>Voir tout</Link>
    </nav>
  );
}
