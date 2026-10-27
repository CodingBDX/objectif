"use client";
import { useMemo, useRef, useState, useEffect } from "react";
import Ic from "./Ic";
import { cap, cityList, lab, Profile } from "@/lib/types";

type Sug = { k: "ville" | "profil" | "spec"; label: string; sub?: string; v: string };
const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

/** Champ de recherche avec suggestions : villes, profils, spécialités. */
export default function SearchBox({ profiles, q, setQ, onCity, onProfile, onTag }: { profiles: Profile[]; q: string; setQ: (v: string) => void; onCity: (c: string) => void; onProfile: (id: string) => void; onTag: (t: string) => void }) {
  const [open, setOpen] = useState(false); const [hi, setHi] = useState(-1); const box = useRef<HTMLDivElement>(null);
  useEffect(() => { const h = (e: MouseEvent) => { if (box.current && !box.current.contains(e.target as Node)) setOpen(false); }; document.addEventListener("mousedown", h); return () => document.removeEventListener("mousedown", h); }, []);
  const idx = useMemo(() => {
    const c: Record<string, number> = {}, t: Record<string, number> = {};
    profiles.forEach((p) => { cityList(p).forEach((x) => { c[x] = (c[x] || 0) + 1; }); p.specialties.forEach((s) => { const k = s.toLowerCase(); t[k] = (t[k] || 0) + 1; }); });
    return { c: Object.entries(c), t: Object.entries(t) };
  }, [profiles]);
  const list = useMemo<Sug[]>(() => {
    const n = norm(q.trim()); if (n.length < 1) return [];
    const has = (s: string) => norm(s).includes(n);
    const starts = (s: string) => (norm(s).startsWith(n) ? 0 : 1);
    const v = idx.c.filter(([x]) => has(x)).sort((a, b) => starts(a[0]) - starts(b[0]) || b[1] - a[1]).slice(0, 3).map(([x, k]) => ({ k: "ville" as const, label: x, sub: `${k} profil${k > 1 ? "s" : ""}`, v: x }));
    const s = idx.t.filter(([x]) => has(x)).sort((a, b) => starts(a[0]) - starts(b[0]) || b[1] - a[1]).slice(0, 3).map(([x, k]) => ({ k: "spec" as const, label: cap(x), sub: `${k} profil${k > 1 ? "s" : ""}`, v: x }));
    const p = profiles.filter((x) => has(x.name)).sort((a, b) => starts(a.name) - starts(b.name)).slice(0, 4).map((x) => ({ k: "profil" as const, label: x.name, sub: [lab(x), x.city].filter(Boolean).join(" · "), v: x.id }));
    return [...v, ...p, ...s];
  }, [q, idx, profiles]);
  const pick = (x: Sug) => { setOpen(false); setHi(-1); if (x.k === "ville") { setQ(""); onCity(x.v); } else if (x.k === "profil") onProfile(x.v); else { setQ(""); onTag(x.v); } };
  const T = { ville: "📍 Ville", profil: "👤 Profil", spec: "🏷 Spécialité" };
  return (
    <div className="sp sbox" ref={box} style={{ maxWidth: "none", margin: 0 }}>
      <input type="search" placeholder="Nom, style, ville…" aria-label="Rechercher" value={q} autoComplete="off" role="combobox" aria-expanded={open && list.length > 0}
        onChange={(e) => { setQ(e.target.value); setOpen(true); setHi(-1); }} onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (!open || !list.length) return;
          if (e.key === "ArrowDown") { e.preventDefault(); setHi((hi + 1) % list.length); }
          else if (e.key === "ArrowUp") { e.preventDefault(); setHi((hi - 1 + list.length) % list.length); }
          else if (e.key === "Enter" && hi >= 0) { e.preventDefault(); pick(list[hi]); }
          else if (e.key === "Escape") setOpen(false);
        }} />
      <Ic n="search" />
      {open && list.length > 0 && <ul className="citylist sugl" role="listbox">{list.map((x, i) => <li key={x.k + x.v} role="option" aria-selected={i === hi} className={i === hi ? "on" : ""} onMouseDown={(e) => { e.preventDefault(); pick(x); }}>
        <em>{T[x.k]}</em><span>{x.label}</span>{x.sub && <small>{x.sub}</small>}</li>)}</ul>}
    </div>
  );
}
