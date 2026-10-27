import { Fragment, type ReactNode } from "react";

/** Mise en forme simple et sûre (aucun HTML stocké) : **gras**, *italique*, « ## titre », « - liste ». */
const inline = (t: string, k = 0): ReactNode[] =>
  t.split(/(\*\*[^*\n]+\*\*|\*[^*\n]+\*)/g).filter(Boolean).map((x, i) =>
    x.startsWith("**") && x.endsWith("**") && x.length > 4 ? <strong key={k + i}>{x.slice(2, -2)}</strong>
    : x.startsWith("*") && x.endsWith("*") && x.length > 2 ? <em key={k + i}>{x.slice(1, -1)}</em> : <Fragment key={k + i}>{x}</Fragment>);

export function RichText({ text }: { text: string }) {
  const lines = (text || "").replace(/\r/g, "").split("\n"); const out: ReactNode[] = []; let list: string[] = []; let para: string[] = [];
  const flushP = () => { if (para.length) { out.push(<p key={out.length}>{para.map((l, i) => <Fragment key={i}>{i > 0 && <br />}{inline(l, i * 100)}</Fragment>)}</p>); para = []; } };
  const flushL = () => { if (list.length) { out.push(<ul key={out.length}>{list.map((l, i) => <li key={i}>{inline(l)}</li>)}</ul>); list = []; } };
  for (const raw of lines) {
    const l = raw.trimEnd();
    if (/^(- |• )/.test(l)) { flushP(); list.push(l.slice(2)); }
    else if (/^## /.test(l)) { flushP(); flushL(); out.push(<h3 key={out.length}>{inline(l.slice(3))}</h3>); }
    else if (!l.trim()) { flushP(); flushL(); }
    else { flushL(); para.push(l); }
  }
  flushP(); flushL();
  return <>{out}</>;
}

/** Texte brut (pour les descriptions de page, la recherche…) : retire les marques de mise en forme. */
export const plain = (t: string) => (t || "").replace(/^## /gm, "").replace(/^(- |• )/gm, "").replace(/\*\*([^*]+)\*\*/g, "$1").replace(/\*([^*]+)\*/g, "$1");
