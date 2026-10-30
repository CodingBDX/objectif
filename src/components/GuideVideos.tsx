"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { GUIDES } from "@/lib/guides";
import { useT } from "@/lib/i18n";

/** Slide de vidéos du blog (celles qui expliquent le site) : un clic ouvre la vidéo en grand. */
export default function GuideVideos() {
  const { tr } = useT(); const [on, setOn] = useState("");
  const items = GUIDES.filter((g) => g.video).sort((a, b) => b.date.localeCompare(a.date));
  useEffect(() => {
    if (!on) return;
    const k = (e: KeyboardEvent) => { if (e.key === "Escape") setOn(""); };
    window.addEventListener("keydown", k); const o = document.body.style.overflow; document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", k); document.body.style.overflow = o; };
  }, [on]);
  if (!items.length) return null;
  const cur = items.find((g) => g.slug === on);
  return (
    <section className="arrs gvs" aria-label={tr("Vidéos pour bien utiliser le site")}>
      <p className="arrh"><span>🎬 {tr("Comprendre le site en vidéo")}</span><Link href="/guides">{tr("Tout le blog →")}</Link></p>
      <div className="arrl">
        {items.map((g) => { const v = g.video!; return (
          <figure key={g.slug} className="gvc">
            <button type="button" className="gvp" onClick={() => setOn(g.slug)} aria-label={tr("Lire la vidéo : {t}", { t: g.title })}>
              <img src={v.poster} alt="" loading="lazy" decoding="async" /><span aria-hidden="true">▶</span><small>{v.seconds} s</small></button>
            <figcaption><b>{g.emoji} {g.title.split(":")[0]}</b><Link href={`/guides/${g.slug}`}>{tr("Lire l’article")}</Link></figcaption>
          </figure>); })}
      </div>
      {cur && cur.video && (
        <div className="gvm" role="dialog" aria-modal="true" aria-label={cur.title} onClick={() => setOn("")}>
          <div className="gvmb" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="gvx" onClick={() => setOn("")} aria-label={tr("Fermer")}>✕</button>
            <video src={cur.video.src} poster={cur.video.poster} controls autoPlay playsInline preload="auto" onEnded={() => setOn("")} />
            <Link href={`/guides/${cur.slug}`} className="btn ghost">{tr("Lire l’article")}</Link>
          </div>
        </div>)}
    </section>
  );
}
