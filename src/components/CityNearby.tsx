import Link from "next/link";
import { nearbyCommunes } from "@/lib/cityinfo";
import { cityList, Profile } from "@/lib/types";
import { slug } from "@/lib/site";
import { Tr } from "@/lib/i18n";

/** Sous l'intro d'une ville : liens vers les villes proches qui ont des profils (maillage interne), et invitation à rejoindre quand la ville est peu fournie. */
export default async function CityNearby({ city, profiles }: { city: string; profiles: Profile[] }) {
  const count: Record<string, number> = {};
  profiles.filter((p) => p.genre !== "livecam").forEach((p) => cityList(p).forEach((c) => { count[c] = (count[c] || 0) + 1; }));
  const here = count[city] || 0;
  const near = (await nearbyCommunes(city, 10)).filter((c) => count[c]);
  if (!near.length && here >= 3) return null;
  return (
    <div className="note" style={{ margin: "0 0 12px", display: "grid", gap: 6 }}>
      {near.length > 0 && <p style={{ margin: 0 }}><b><Tr k="Villes proches avec des profils :" /></b> {near.map((c, i) => <span key={c}>{i ? " · " : ""}<Link href={`/ville/${slug(c)}`}>{c} ({count[c]})</Link></span>)}</p>}
      {here < 3 && <p style={{ margin: 0 }}><Tr k="Tu es escort dans cette ville ?" /> <Link href="/rejoindre"><Tr k="Créer mon profil gratuit" /></Link></p>}
    </div>
  );
}
