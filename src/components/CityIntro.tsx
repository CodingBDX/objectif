import { cityIntro } from "@/lib/cityinfo";
import type { Profile } from "@/lib/types";

/** Texte d'introduction d'une ville (appelle l'API des communes voisines) : affiché en différé, la page ne l'attend pas.
 *  `lead` remplace la première phrase (ex. pages « genre + ville »). */
export default async function CityIntro({ city, profiles, lead }: { city: string; profiles: Profile[]; lead?: string }) {
  const t = await cityIntro(city, profiles);
  return <p className="note" style={{ margin: "0 0 12px" }}>{lead ? lead + " " + t.replace(/^[^.]*\. /, "") : t}</p>;
}
