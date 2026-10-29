"use client";
import { Children, useState } from "react";
import { useT } from "@/lib/i18n";

// Montre les n premiers éléments, puis un bouton « Voir tout » (comme l'encart Top)
export default function Collapse({ n, className, as = "div", children }: { n: number; className: string; as?: "div" | "ul"; children: React.ReactNode }) {
  const { tr } = useT();
  const [all, setAll] = useState(false);
  const items = Children.toArray(children);
  const extra = items.length - n;
  return (
    <>
      {as === "ul" ? <ul className={className}>{all || extra <= 0 ? items : items.slice(0, n)}</ul> : <div className={className}>{all || extra <= 0 ? items : items.slice(0, n)}</div>}
      {extra > 0 && <button type="button" className="btn ghost cmore" aria-expanded={all} onClick={() => setAll(!all)}>{all ? tr("Voir moins") : tr("Voir tout ({n})", { n: items.length })}</button>}
    </>
  );
}
