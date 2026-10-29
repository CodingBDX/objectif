import Link from "next/link";
import { Crumbs } from "@/components/Ld";

/** Structure « tableau de bord » (colonne latérale + zone principale) partagée par les pages associations. */
export default function AssoShell({ title, active, cities, extra, children, avatar = "🤝", hi = "Associations", top, list = true }: {
  title: string; active?: "liste" | "fiche"; cities?: { name: string; n: number; on?: boolean }[]; extra?: React.ReactNode; children: React.ReactNode; avatar?: string; hi?: string; top?: React.ReactNode; list?: boolean;
}) {
  return (
    <div className="dash gut">
      <aside className="dside">
        <div className="dav">{avatar}</div>
        <div className="dhi">{hi}</div>
        <nav>
          {list && <Link className={active === "liste" ? "on" : ""} href="/associations">📋 Toutes les associations</Link>}
          <Link className={active === "fiche" ? "on" : ""} href="/mon-association">✏️ Ma fiche association</Link>
          <Link href="/">📖 Annuaire</Link>
          <Link href="/contact">✉️ Contact</Link>
        </nav>
        {cities && cities.length > 0 && <nav aria-label="Villes">
          <div className="dhi" style={{ fontSize: 13, opacity: 0.85 }}>Par ville</div>
          {cities.slice(0, 20).map((c) => <Link key={c.name} className={c.on ? "on" : ""} href={`/associations?ville=${encodeURIComponent(c.name)}`}>📍 {c.name}<b style={{ marginLeft: "auto", fontSize: 12 }}>{c.n}</b></Link>)}
        </nav>}
        {extra}
        <div className="dvip"><div className="crown">🤝</div><b>Tu es une association ?</b><span>Publie ta fiche : elle est validée avant d’apparaître.</span><Link className="dbtn pink" href="/mon-association">Ma fiche</Link></div>
      </aside>
      <main className="dmain dedit">
        <div className="pbar"><Crumbs inline items={active === "fiche" ? [["Accueil", "/"], ["Mon profil", "/mon-profil"], ["Ma fiche association", "#"]] : title === "Associations et soutien" ? [["Accueil", "/"], ["Associations", "#"]] : [["Accueil", "/"], ["Associations", "/associations"], [title, "#"]]} /></div>
        <div className="dtop"><h1>{title}</h1>{top}</div>
        {children}
      </main>
    </div>
  );
}
