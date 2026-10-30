import Link from "next/link";
import { Crumbs } from "@/components/Ld";
import { Tr } from "@/lib/i18n";

/** Structure « tableau de bord » (colonne latérale + zone principale) de la page Logements, calquée sur celle des associations. */
export default function LodgingShell({ title, cities, children }: { title: string; cities?: { name: string; n: number; on?: boolean }[]; children: React.ReactNode }) {
  return (
    <div className="dash gut">
      <aside className="dside">
        <div className="dav" aria-hidden="true">🏠</div>
        <div className="dhi"><Tr k="Logements" /></div>
        <nav>
          <Link className="on" href="/logements"><span aria-hidden="true">📋</span> <Tr k="Tous les logements" /></Link>
          <Link href="/mon-logement"><span aria-hidden="true">✏️</span> <Tr k="Mon logement" /></Link>
          <Link href="/"><span aria-hidden="true">📖</span> <Tr k="Annuaire" /></Link>
          <Link href="/contact"><span aria-hidden="true">✉️</span> <Tr k="Contact" /></Link>
        </nav>
        {cities && cities.length > 0 && <nav aria-label="Villes">
          <div className="dhi" style={{ fontSize: 13, opacity: 0.85 }}><Tr k="Par ville" /></div>
          {cities.slice(0, 20).map((c) => <Link key={c.name} className={c.on ? "on" : ""} href={`/logements?ville=${encodeURIComponent(c.name)}`}><span aria-hidden="true">📍</span> {c.name}<b style={{ marginLeft: "auto", fontSize: 12 }}>{c.n}</b></Link>)}
        </nav>}
        <div className="dvip"><div className="crown" aria-hidden="true">🏠</div><b><Tr k="Tu as un logement ?" /></b><span><Tr k="Publie ton annonce : elle est validée avant d’apparaître." /></span><Link className="dbtn pink" href="/mon-logement"><Tr k="Mon logement" /></Link></div>
      </aside>
      <main className="dmain dedit">
        <div className="pbar"><Crumbs inline items={[["Accueil", "/"], [title.replace(/^\P{L}+/u, ""), "#"]]} /></div>
        <div className="dtop"><h1>{title}</h1></div>
        {children}
      </main>
    </div>
  );
}
