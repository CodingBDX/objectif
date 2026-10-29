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

/** Fil d'Ariane visible (même contenu que les données structurées). */
export function Crumbs({ items, inline }: { items: [string, string][]; inline?: boolean }) {
  return <nav className={inline ? "crumbs inline" : "crumbs gut"} aria-label="Fil d’Ariane"><ol>{items.map(([n, h], i) => <li key={h} {...(i === items.length - 1 ? { "aria-current": "page" as const } : {})}>{i === items.length - 1 ? n : <a href={h}>{n}</a>}</li>)}</ol></nav>;
}
