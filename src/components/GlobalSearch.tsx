"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import Ic from "./Ic";
import { slug } from "@/lib/site";

export type SIndex = { c: [string, number][]; t: [string, number][]; p: { id: string; name: string; sub: string }[] };
type Sug = { k: "ville" | "profil" | "spec" | "fr"; label: string; sub?: string; url: string };
type Commune = { nom: string; departement?: { code: string; nom: string } };
const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
const cap = (s: string) => (s ? s[0].toUpperCase() + s.slice(1) : s);
const cache = new Map<string, Commune[]>();

/** Recherche du menu du haut : villes (de l'annuaire et de toute la France), profils, spécialités, ou texte libre. */
export default function GlobalSearch({ index, onGo }: { index: SIndex; onGo: (url: string) => void }) {
  const [q, setQ] = useState(""); const [open, setOpen] = useState(false); const [hi, setHi] = useState(-1); const [api, setApi] = useState<Commune[]>([]);
  const box = useRef<HTMLDivElement>(null); const seq = useRef(0);
  useEffect(() => { const h = (e: MouseEvent) => { if (box.current && !box.current.contains(e.target as Node)) setOpen(false); }; document.addEventListener("mousedown", h); return () => document.removeEventListener("mousedown", h); }, []);
  useEffect(() => {
    const t = q.trim(); if (!open || t.length < 2) { setApi([]); return; }
    if (cache.has(t.toLowerCase())) { setApi(cache.get(t.toLowerCase())!); return; }
    const id = ++seq.current;
    const tm = setTimeout(async () => { try {
      const r = await fetch(`https://geo.api.gouv.fr/communes?nom=${encodeURIComponent(t)}&fields=nom,departement&boost=population&limit=5`); if (!r.ok) return;
      const j = (await r.json()) as Commune[]; cache.set(t.toLowerCase(), j); if (id === seq.current) setApi(j);
    } catch {} }, 250);
    return () => clearTimeout(tm);
  }, [q, open]);
  const list = useMemo<Sug[]>(() => {
    const n = norm(q.trim());
    if (!n) return index.c.slice(0, 8).map(([c, k]) => ({ k: "ville" as const, label: c, sub: `${k} profil${k > 1 ? "s" : ""}`, url: `/ville/${slug(c)}` }));
    const has = (s: string) => norm(s).includes(n); const st = (s: string) => (norm(s).startsWith(n) ? 0 : 1);
    const v = index.c.filter(([c]) => has(c)).sort((a, b) => st(a[0]) - st(b[0]) || b[1] - a[1]).slice(0, 3).map(([c, k]) => ({ k: "ville" as const, label: c, sub: `${k} profil${k > 1 ? "s" : ""}`, url: `/ville/${slug(c)}` }));
    const known = new Set(index.c.map(([c]) => slug(c)));
    const fr = api.filter((x) => !known.has(slug(x.nom))).slice(0, 3).map((x) => ({ k: "fr" as const, label: x.nom, sub: x.departement ? `${x.departement.nom} (${x.departement.code})` : "", url: `/?ville=${encodeURIComponent(x.nom)}` }));
    const p = index.p.filter((x) => has(x.name)).sort((a, b) => st(a.name) - st(b.name)).slice(0, 4).map((x) => ({ k: "profil" as const, label: x.name, sub: x.sub, url: `/profil/${x.id}` }));
    const s = index.t.filter(([t]) => has(t)).sort((a, b) => st(a[0]) - st(b[0]) || b[1] - a[1]).slice(0, 3).map(([t, k]) => ({ k: "spec" as const, label: cap(t), sub: `${k} profil${k > 1 ? "s" : ""}`, url: `/?tag=${encodeURIComponent(t)}` }));
    return [...v, ...fr, ...p, ...s];
  }, [q, index, api]);
  const go = (u: string) => { setOpen(false); setHi(-1); setQ(""); onGo(u); };
  const T = { ville: "📍 Ville", fr: "📍 Ville", profil: "👤 Profil", spec: "🏷 Spécialité" };
  return (
    <div className="sp sbox gsearch" ref={box}>
      <Ic n="search" />
      <input type="search" value={q} placeholder="Ville, profil, spécialité…" aria-label="Rechercher une ville, un profil ou une spécialité" autoComplete="off" role="combobox" aria-expanded={open && list.length > 0}
        onChange={(e) => { setQ(e.target.value); setOpen(true); setHi(-1); }} onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === "Escape") { setOpen(false); return; }
          if (e.key === "ArrowDown" && list.length) { e.preventDefault(); setOpen(true); setHi((hi + 1) % list.length); }
          else if (e.key === "ArrowUp" && list.length) { e.preventDefault(); setHi((hi - 1 + list.length) % list.length); }
          else if (e.key === "Enter") { e.preventDefault(); if (hi >= 0 && list[hi]) go(list[hi].url); else if (q.trim()) go(`/?q=${encodeURIComponent(q.trim())}`); }
        }} />
      {open && list.length > 0 && <ul className="citylist sugl" role="listbox">{list.map((x, i) => <li key={x.k + x.url} role="option" aria-selected={i === hi} className={i === hi ? "on" : ""} onMouseDown={(e) => { e.preventDefault(); go(x.url); }}>
        <em>{T[x.k]}</em><span>{x.label}</span>{x.sub && <small>{x.sub}</small>}</li>)}</ul>}
    </div>
  );
}
