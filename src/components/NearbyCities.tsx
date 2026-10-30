"use client";
import { useEffect, useState } from "react";
import { useT } from "@/lib/i18n";
import Link from "next/link";
import { coordsOf, km } from "@/lib/geo";
import { slug } from "@/lib/site";
import { cityList, Profile } from "@/lib/types";

/** Bulles des villes voisines (≤ 100 km) qui ont le plus de profils. Jusqu'à 60 calculées ; le CSS en montre 3 / 6 / 9 selon l'écran, « Voir plus » les montre toutes. */
export default function NearbyCities({ profiles, city, type }: { profiles: Profile[]; city: string; type: string }) {
  const { tr } = useT(); const [all, setAll] = useState(false);
  const [out, setOut] = useState<{ c: string; n: number; d: number }[]>([]);
  useEffect(() => {
    let dead = false; setOut([]); setAll(false);
    (async () => {
      const cnt: Record<string, number> = {};
      profiles.forEach((p) => { if (type === "tous" || p.genre === type) cityList(p).forEach((c) => { cnt[c] = (cnt[c] || 0) + 1; }); });
      const me = await coordsOf(city); if (!me) return;
      const cand = Object.entries(cnt).filter(([c]) => c !== city).sort((a, b) => b[1] - a[1]).slice(0, 80);
      const res = await Promise.all(cand.map(async ([c, n]) => { const k = await coordsOf(c); return k ? { c, n, d: km(me, k) } : null; }));
      const near = res.filter((x): x is { c: string; n: number; d: number } => !!x && x.d <= 100).sort((a, b) => b.n - a.n || a.d - b.d).slice(0, 60);
      if (!dead) setOut(near);
    })();
    return () => { dead = true; };
  }, [profiles, city, type]);
  if (!out.length) return null;
  return (
    <section className={`nearc${all ? " all" : ""}`} aria-label={`Villes proches de ${city}`}>
      <p className="nearct"><span>📍 {tr("Près de {c}", { c: city })}</span>{out.length > 6 && <button type="button" className="nbmore" aria-expanded={all} onClick={() => setAll(!all)}>{all ? tr("Voir moins") : tr("Voir plus ({n})", { n: out.length })}</button>}</p>
      <div className="nearl">
        {out.map((x) => (
          <Link key={x.c} className="ncity" href={`/ville/${slug(x.c)}`}>
            <i aria-hidden="true">📍</i>
            <span><b>{x.c}</b><small>{x.n} {x.n > 1 ? tr("profils") : tr("profil")} · {x.d < 1 ? "<1" : Math.round(x.d)} km</small></span>
            <u aria-hidden="true">→</u>
          </Link>
        ))}
      </div>
    </section>
  );
}
