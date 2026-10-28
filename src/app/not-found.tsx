import Link from "next/link";

export const metadata = { title: "Page introuvable", robots: { index: false } };

export default function NotFound() {
  return (
    <section className="gut nf" aria-labelledby="nfh">
      <div className="nfw" aria-hidden="true">
        <svg className="nflogo" viewBox="0 0 24 24" width="120" height="120"><path d="M14 7c3.5 0 6 3 5 7.5-1.2 5-6 7.5-13.5 5.5 4-1 6.300-3 7.300-6 .8-2.300.4-4.500 1.200-7z" /><path d="M14 7c-.2-2 1-3.600 3.200-4" /></svg>
        <div className="nf4"><span>4</span><span>0</span><span>4</span></div>
        <i className="nfh1" /><i className="nfh2" /><i className="nfh3" />
      </div>
      <h1 id="nfh" className="nft">{"sex-escorte.com".split("").map((c, i) => <span key={i} style={{ animationDelay: `${i * 90}ms` }}>{c === " " ? " " : c}</span>)}</h1>
      <p className="note">Cette page s’est faite la belle. Elle n’existe pas ou plus.</p>
      <div className="acts" style={{ justifyContent: "center" }}>
        <Link className="btn" href="/">Retour à l’annuaire</Link>
        <Link className="btn ghost" href="/recherche">Rechercher</Link>
      </div>
    </section>
  );
}
