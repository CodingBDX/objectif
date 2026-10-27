"use client";
import { useEffect, useRef, useState } from "react";

type Commune = { nom: string; departement?: { code: string; nom: string } };
const cache = new Map<string, Commune[]>();

/** Champ ville avec suggestions de toutes les communes de France (API officielle geo.api.gouv.fr).
 *  Aucune liste n'est chargée à l'avance : on interroge l'API pendant la frappe (≥ 2 lettres, avec délai). */
export default function CityInput({ value, onChange, required, placeholder, label, onPick, suggest }: { value: string; onChange: (v: string) => void; required?: boolean; placeholder?: string; label?: string; onPick?: (v: string) => void; suggest?: string[] }) {
  const [list, setList] = useState<Commune[]>([]); const [open, setOpen] = useState(false); const [hi, setHi] = useState(-1);
  const seq = useRef(0); const box = useRef<HTMLDivElement>(null); const inp = useRef<HTMLInputElement>(null);
  const [text, setText] = useState(value); // texte tapé : la valeur n'est validée que si on choisit une suggestion
  useEffect(() => { setText(value); }, [value]);
  useEffect(() => { inp.current?.setCustomValidity(text && text !== value ? "Choisis la ville dans la liste de suggestions." : required && !value ? "Choisis une ville dans la liste de suggestions." : ""); }, [text, value, required]);
  const revert = () => { setOpen(false); setHi(-1); setText(value); };
  useEffect(() => {
    const q = text.trim();
    if (!open) { setList([]); return; }
    if (q.length < 2) { setList((suggest || []).map((nom) => ({ nom }))); return; }
    if (cache.has(q.toLowerCase())) { setList(cache.get(q.toLowerCase())!); return; }
    const id = ++seq.current;
    const t = setTimeout(async () => {
      try {
        const r = await fetch(`https://geo.api.gouv.fr/communes?nom=${encodeURIComponent(q)}&fields=nom,departement&boost=population&limit=8`);
        if (!r.ok) return; const j = (await r.json()) as Commune[];
        cache.set(q.toLowerCase(), j); if (id === seq.current) setList(j);
      } catch {}
    }, 250);
    return () => clearTimeout(t);
  }, [text, open, suggest]);
  useEffect(() => {
    const h = (e: MouseEvent) => { if (box.current && !box.current.contains(e.target as Node)) revert(); };
    document.addEventListener("mousedown", h); return () => document.removeEventListener("mousedown", h);
  }, [value]);
  const pick = (c: Commune) => { setText(c.nom); onChange(c.nom); onPick?.(c.nom); setOpen(false); setHi(-1); };
  return (
    <div className="cityin" ref={box} onBlur={(e) => { if (!box.current?.contains(e.relatedTarget as Node)) revert(); }}>
      <input ref={inp} value={text} required={required} maxLength={40} placeholder={placeholder} aria-label={label} autoComplete="off" role="combobox" aria-expanded={open && list.length > 0}
        onChange={(e) => { setText(e.target.value); if (!e.target.value.trim()) onChange(""); setOpen(true); setHi(-1); }} onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && open) { e.preventDefault(); const ex = list.find((c) => c.nom.toLowerCase() === text.trim().toLowerCase()); if (hi < 0 && ex) { pick(ex); return; } }
          if (!open || !list.length) return;
          if (e.key === "ArrowDown") { e.preventDefault(); setHi((hi + 1) % list.length); }
          else if (e.key === "ArrowUp") { e.preventDefault(); setHi((hi - 1 + list.length) % list.length); }
          else if (e.key === "Enter" && hi >= 0) { e.preventDefault(); pick(list[hi]); }
          else if (e.key === "Escape") setOpen(false);
        }} />
      {open && list.length > 0 && <ul className="citylist" role="listbox">{list.map((c, i) => <li key={c.nom + (c.departement?.code || "")} role="option" aria-selected={i === hi} className={i === hi ? "on" : ""} onMouseDown={(e) => { e.preventDefault(); pick(c); }}>{c.nom}<small>{c.departement ? ` · ${c.departement.nom} (${c.departement.code})` : ""}</small></li>)}</ul>}
    </div>
  );
}
