import Link from "next/link";
import { Crumbs } from "@/components/Ld";
export default function Legal({ title, updated, children }: { title: string; updated: string; children: React.ReactNode }) {
  return (
    <section className="gut">
      <div className="pbar"><Crumbs inline items={[["Accueil", "/"], [title, "#"]]} /></div>
      <div className="pfc" style={{ maxWidth: 820 }}>
        <article className="panel regp legal">
          <h1 className="regh">{title}</h1>
          <p className="note">Dernière mise à jour : {updated}</p>
          {children}
        </article>
      </div>
    </section>
  );
}
