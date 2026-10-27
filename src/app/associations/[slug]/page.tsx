import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { publicAssos } from "@/lib/public";
import { assoCities } from "@/lib/assos";

export const dynamic = "force-dynamic";
const find = async (s: string) => (await publicAssos()).find((a) => a.slug === s);
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const a = await find(params.slug); if (!a) return {};
  return { title: `${a.name} · ${a.city}`, description: a.description.slice(0, 155) || `Association à ${a.city}`, alternates: { canonical: `/associations/${a.slug}` } };
}
const web = (u: string | null) => (u && /^https?:\/\//i.test(u) ? u : null);
export default async function Page({ params }: { params: { slug: string } }) {
  const a = await find(params.slug); if (!a) notFound();
  const site = web(a.site);
  return (
    <section className="gut">
      <div className="pbar"><Link className="btn ghost" href={`/associations?ville=${encodeURIComponent(a.city)}`}>← Associations à {a.city}</Link></div>
      <div className="pfc" style={{ maxWidth: 760 }}>
        <div className="panel regp" style={{ display: "grid", gap: 14 }}>
          <div><h1 className="regh">{a.name}</h1><div className="note">📍 {assoCities(a).join(" · ")}{a.region ? ` · ${a.region}` : ""}</div></div>
          {a.description && <p style={{ margin: 0, whiteSpace: "pre-wrap" }}>{a.description}</p>}
          {a.services.length > 0 && <div><b>Ce qu’elle propose</b><div className="tags" style={{ marginTop: 6 }}>{a.services.map((s) => <span className="tag" key={s}>{s}</span>)}</div></div>}
          <div className="dcard" style={{ display: "grid", gap: 6 }}>
            <h3>Contact</h3>
            {a.phone && <div>📞 <a href={`tel:${a.phone.replace(/[^+\d]/g, "")}`}>{a.phone}</a></div>}
            {a.email && <div>✉️ <a href={`mailto:${a.email}`}>{a.email}</a></div>}
            {site && <div>🌐 <a href={site} target="_blank" rel="noopener noreferrer nofollow">{site.replace(/^https?:\/\//i, "")}</a></div>}
            {a.address && <div>🏠 {a.address}</div>}
            {a.hours && <div>🕐 {a.hours}</div>}
            {!a.phone && !a.email && !site && !a.address && <p className="note" style={{ margin: 0 }}>Aucun contact renseigné.</p>}
          </div>
          <p className="note" style={{ margin: 0 }}>Une information est fausse ou une fiche pose problème ? <Link href="/contact">Écris-nous</Link>.</p>
        </div>
      </div>
    </section>
  );
}
