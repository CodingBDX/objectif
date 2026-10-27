"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { coordsOf, km } from "@/lib/geo";
import { slug } from "@/lib/site";
import { cityList, Profile } from "@/lib/types";

/** Bulles des villes voisines (≤ 100 km) qui ont le plus de profils. 9 calculées ; le CSS en montre 3 / 6 / 9 selon l'écran. */
export default function NearbyCities({ profiles, city, type }: { profiles: Profile[]; city: string; type: string }) {
  const [out, setOut] = useState<{ c: string; n: number }[]>([]);
  useEffect(() => {
    let dead = false; setOut([]);
    (async () => {
      const cnt: Record<string, number> = {};
      profiles.forEach((p) => { if (type === "tous" || p.genre === type) cityList(p).forEach((c) => { cnt[c] = (cnt[c] || 0) + 1; }); });
      const me = await coordsOf(city); if (!me) return;
      const cand = Object.entries(cnt).filter(([c]) => c !== city).sort((a, b) => b[1] - a[1]).slice(0, 40);
      const res = await Promise.all(cand.map(async ([c, n]) => { const k = await coordsOf(c); return k ? { c, n, d: km(me, k) } : null; }));
      const near = res.filter((x): x is { c: string; n: number; d: number } => !!x && x.d <= 100).sort((a, b) => b.n - a.n || a.d - b.d).slice(0, 9);
      if (!dead) setOut(near.map(({ c, n }) => ({ c, n })));
    })();
    return () => { dead = true; };
  }, [profiles, city, type]);
  if (!out.length) return null;
  return (
    <nav className="nearb" aria-label={`Villes proches de ${city}`}>
      <span className="nearh">📍 Près de {city} :</span>
      {out.map((x) => <Link key={x.c} className="nbub" href={`/ville/${slug(x.c)}`}>{x.c}<b>{x.n}</b></Link>)}
    </nav>
  );
}
