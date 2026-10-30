"use client";
import { useState } from "react";
import Link from "next/link";
import { GUIDES } from "@/lib/guides";
import { useT } from "@/lib/i18n";

/** Slide de vidéos du blog (celles qui expliquent le site) : un clic lance la vidéo à la place de l'image. */
export default function GuideVideos() {
  const { tr } = useT(); const [on, setOn] = useState("");
  const items = GUIDES.filter((g) => g.video).sort((a, b) => b.date.localeCompare(a.date));
  if (!items.length) return null;
  return (
    <section className="arrs gvs" aria-label={tr("Vidéos pour bien utiliser le site")}>
      <p className="arrh"><span>🎬 {tr("Comprendre le site en vidéo")}</span><Link href="/guides">{tr("Tout le blog →")}</Link></p>
      <div className="arrl">
        {items.map((g) => { const v = g.video!; return (
          <figure key={g.slug} className="gvc">
            {on === g.slug
              ? <video src={v.src} poster={v.poster} controls autoPlay playsInline preload="auto" onEnded={() => setOn("")} />
              : <button type="button" className="gvp" onClick={() => setOn(g.slug)} aria-label={tr("Lire la vidéo : {t}", { t: g.title })}>
                  <img src={v.poster} alt="" loading="lazy" decoding="async" /><span aria-hidden="true">▶</span><small>{v.seconds} s</small></button>}
            <figcaption><b>{g.emoji} {g.title.split(":")[0]}</b><Link href={`/guides/${g.slug}`}>{tr("Lire l’article")}</Link></figcaption>
          </figure>); })}
      </div>
    </section>
  );
}
