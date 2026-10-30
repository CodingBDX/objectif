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
  const cut = (t: string) => (t.length > 90 ? t.slice(0, 88).trimEnd() + "…" : t);
  return (
    <section className="arrs assos" aria-label={`Associations de soutien à ${city}`}>
      <p className="arrh"><span>🤝 Soutien à {city}</span><Link href={`/associations?ville=${encodeURIComponent(city)}`}>Voir tout →</Link></p>
      <div className={`arrl${show.length === 1 ? " one" : ""}`}>
        {show.map((a) => (
          <Link key={a.id} className="une arr asso" href={`/associations/${a.slug}`}>
            <i aria-hidden="true">🤝</i>
            <span><small>{a.national ? "Association nationale" : a.city}</small><b>{a.name}</b><em>{cut(a.services?.length ? a.services.slice(0, 2).join(" · ") : a.description || "")}</em></span>
            <u aria-hidden="true">→</u>
          </Link>
        ))}
      </div>
    </section>
  );
}
