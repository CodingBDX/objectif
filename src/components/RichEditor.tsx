"use client";
import { useRef, useState } from "react";
import { RichText } from "@/lib/rich";

/** Petit éditeur de texte : gras, italique, titre, liste, aperçu. Le texte reste du texte simple (**gras**, *italique*, ## titre, - liste). */
export default function RichEditor({ value, onChange, maxLength = 2000, rows = 8, label }: { value: string; onChange: (v: string) => void; maxLength?: number; rows?: number; label: string }) {
  const ta = useRef<HTMLTextAreaElement>(null); const [prev, setPrev] = useState(false);
  const wrap = (a: string, b = a, ph = "texte") => {
    const el = ta.current; if (!el) return; const s = el.selectionStart, e = el.selectionEnd; const sel = value.slice(s, e) || ph;
    const next = value.slice(0, s) + a + sel + b + value.slice(e); if (next.length > maxLength) return; onChange(next);
    requestAnimationFrame(() => { el.focus(); el.setSelectionRange(s + a.length, s + a.length + sel.length); });
  };
  const line = (prefix: string) => {
    const el = ta.current; if (!el) return; const s = el.selectionStart, e = el.selectionEnd;
    const st = value.lastIndexOf("\n", s - 1) + 1; const en = (() => { const i = value.indexOf("\n", e); return i < 0 ? value.length : i; })();
    const block = value.slice(st, en).split("\n").map((l) => (l.startsWith(prefix) ? l.slice(prefix.length) : prefix + l)).join("\n");
    const next = value.slice(0, st) + block + value.slice(en); if (next.length > maxLength) return; onChange(next);
    requestAnimationFrame(() => { el.focus(); el.setSelectionRange(st, st + block.length); });
  };
  const B = ({ t, title, on, children }: { t?: string; title: string; on: () => void; children: React.ReactNode }) => <button type="button" className="rtb" title={title} aria-label={title} onClick={on} {...(t ? { "data-t": t } : {})}>{children}</button>;
  return (
    <div className="rte">
      <div className="rtt" role="toolbar" aria-label="Mise en forme">
        <B title="Gras" on={() => wrap("**")}><b>G</b></B>
        <B title="Italique" on={() => wrap("*")}><i>I</i></B>
        <B title="Titre" on={() => line("## ")}>Titre</B>
        <B title="Liste à puces" on={() => line("- ")}>• Liste</B>
        <button type="button" className={`rtb pv${prev ? " on" : ""}`} aria-pressed={prev} onClick={() => setPrev(!prev)}>👁 Aperçu</button>
      </div>
      {prev
        ? <div className="rtp bio" aria-label="Aperçu">{value.trim() ? <RichText text={value} /> : <p className="note">Rien à afficher pour le moment.</p>}</div>
        : <textarea ref={ta} aria-label={label} value={value} onChange={(e) => onChange(e.target.value)} maxLength={maxLength} rows={rows} placeholder="Présente-toi : ton style, ce que tu proposes, tes règles…" />}
      <div className="rtc">{value.length}/{maxLength}</div>
    </div>
  );
}
