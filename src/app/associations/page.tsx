import type { Metadata } from "next";
import Link from "next/link";
import { publicAssos, type Asso } from "@/lib/public";
import { assoCities } from "@/lib/assos";
import { slug } from "@/lib/site";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Associations et soutien par ville", description: "Associations d’écoute, d’accompagnement juridique, social et de santé, classées par ville.", alternates: { canonical: "/associations" } };

function AssoCard({ a }: { a: Asso }) {
  return (
    <article className="dcard" style={{ display: "grid", gap: 8 }}>
      <h3 style={{ margin: 0 }}><Link href={`/associations/${a.slug}`}>{a.name}</Link></h3>
      <div className="note">📍 {assoCities(a).join(" · ")}</div>
      {a.description && <p style={{ margin: 0 }}>{a.description.length > 160 ? a.description.slice(0, 160).trimEnd() + "…" : a.description}</p>}
      {a.services.length > 0 && <div className="tags">{a.services.slice(0, 4).map((s) => <span className="tag" key={s}>{s}</span>)}</div>}
      <div><Link className="btn ghost" href={`/associations/${a.slug}`}>Voir la fiche</Link></div>
    </article>
  );
}

export default async function Page({ searchParams }: { searchParams: { ville?: string } }) {
  const all = await publicAssos();
  const counts = new Map<string, number>();
  all.forEach((a) => assoCities(a).forEach((c) => counts.set(c, (counts.get(c) || 0) + 1)));
  const cities = [...counts.keys()].sort((x, y) => x.localeCompare(y, "fr"));
  const want = (searchParams.ville || "").trim();
  const ws = slug(want);
  const shown = ws ? all.filter((a) => assoCities(a).some((c) => slug(c) === ws)) : all;
  return (
    <section className="gut">
      <div className="pbar"><Link className="btn ghost" href="/">← Retour à l’annuaire</Link></div>
      <div className="pfc" style={{ maxWidth: 900 }}>
        <div className="panel regp">
          <h1 className="regh">Associations et soutien</h1>
          <p className="note" style={{ margin: "0 0 14px" }}>Des associations qui écoutent, informent et accompagnent, classées par ville. Chaque fiche est vérifiée avant d’être publiée.</p>
          <form action="/associations" method="get" style={{ display: "flex", gap: 8, flexWrap: "wrap", margin: "0 0 12px" }}>
            <input name="ville" list="assoc-villes" defaultValue={want} placeholder="Ma ville (ex. Lyon)" aria-label="Ville" maxLength={80} style={{ flex: "1 1 220px", minWidth: 0 }} autoComplete="off" />
            <datalist id="assoc-villes">{cities.map((c) => <option key={c} value={c} />)}</datalist>
            <button className="btn" type="submit">Rechercher</button>
            {want && <Link className="btn ghost" href="/associations">Toutes les villes</Link>}
          </form>
          {cities.length > 0 && <div className="tags" style={{ marginBottom: 16 }}>{cities.slice(0, 40).map((c) => <Link key={c} className="chip" aria-pressed={slug(c) === ws} href={`/associations?ville=${encodeURIComponent(c)}`}>{c} <span className="note">({counts.get(c)})</span></Link>)}</div>}
          {shown.length === 0
            ? <p className="note" role="status">{want ? `Aucune association n’est encore listée à ${want}.` : "Aucune association n’est encore listée."} Si tu connais une association utile, invite-la à créer sa fiche.</p>
            : <div style={{ display: "grid", gap: 12 }}>{shown.map((a) => <AssoCard key={a.id} a={a} />)}</div>}
          <hr style={{ border: 0, borderTop: "1px solid var(--line)", margin: "20px 0" }} />
          <p style={{ margin: 0 }}><b>Tu représentes une association ?</b> Crée un compte et remplis ta fiche : elle sera publiée après vérification. <Link className="btn" href="/mon-association">Créer ou gérer ma fiche</Link></p>
        </div>
      </div>
    </section>
  );
}
