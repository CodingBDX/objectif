import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { GUIDES, guideBySlug } from "@/lib/guides";
import { RichText } from "@/lib/rich";
import { siteUrl } from "@/lib/site";
import Ld, { crumbs, Crumbs } from "@/components/Ld";

export function generateStaticParams() { return GUIDES.map((g) => ({ slug: g.slug })); }
export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const g = guideBySlug(params.slug); if (!g) return { robots: { index: false, follow: true } };
  return { title: g.title, description: g.desc, alternates: { canonical: `/guides/${g.slug}` }, openGraph: { title: g.title, description: g.desc, type: "article" } };
}
export default function Page({ params }: { params: { slug: string } }) {
  const g = guideBySlug(params.slug); if (!g) notFound();
  const cr: [string, string][] = [["Accueil", "/"], ["Guides", "/guides"], [g.title, `/guides/${g.slug}`]];
  const others = GUIDES.filter((x) => x.slug !== g.slug).slice(0, 3);
  return (
    <section className="gut">
      <Ld data={crumbs(cr)} />
      <Ld data={{ "@context": "https://schema.org", "@type": "Article", headline: g.title, description: g.desc, datePublished: g.date, dateModified: g.date, inLanguage: "fr", mainEntityOfPage: `${siteUrl()}/guides/${g.slug}`, author: { "@type": "Organization", name: "Sex-Escorte" }, publisher: { "@type": "Organization", name: "Sex-Escorte" } }} />
      {g.video && <Ld data={{ "@context": "https://schema.org", "@type": "VideoObject", name: g.title, description: g.desc, thumbnailUrl: `${siteUrl()}${g.video.poster}`, contentUrl: `${siteUrl()}${g.video.src}`, uploadDate: g.date, duration: `PT${g.video.seconds}S`, inLanguage: "fr" }} />}
      <div className="pbar"><Crumbs items={cr} inline /></div>
      <article className="pfc guide" style={{ maxWidth: 760 }}>
        <h1>{g.emoji} {g.title}</h1>
        <p className="note">{g.desc}</p>
        {g.video && <figure className="gvid"><video controls playsInline preload="metadata" poster={g.video.poster} aria-label={g.video.label}><source src={g.video.src} type="video/mp4" /></video><figcaption>{g.video.label}</figcaption></figure>}
        <RichText text={g.body} />
        <div className="gcta"><b>Prête à publier ton profil ?</b><Link className="btn" href="/rejoindre">Créer mon profil gratuit</Link></div>
        <h2 className="gmore">À lire aussi</h2>
        <div className="guides">{others.map((o) => <Link key={o.slug} href={`/guides/${o.slug}`} className="gcard"><span className="ge" aria-hidden="true">{o.emoji}</span><b>{o.title}</b></Link>)}</div>
      </article>
    </section>
  );
}
