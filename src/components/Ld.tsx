import { siteUrl } from "@/lib/site";
import { profilePath } from "@/lib/profilUrl";
import type { Profile } from "@/lib/types";

/** Données structurées (JSON-LD) pour les moteurs de recherche. */
export default function Ld({ data }: { data: object }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}
export const crumbs = (items: [string, string][]) => ({
  "@context": "https://schema.org", "@type": "BreadcrumbList",
  itemListElement: items.map(([name, path], i) => ({ "@type": "ListItem", position: i + 1, name, item: siteUrl() + path }))
});
export const itemList = (ps: Profile[], name: string) => ({
  "@context": "https://schema.org", "@type": "ItemList", name,
  itemListElement: ps.slice(0, 20).map((p, i) => ({ "@type": "ListItem", position: i + 1, name: p.name, url: siteUrl() + profilePath(p) }))
});
