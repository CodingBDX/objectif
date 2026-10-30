"use client";
import Link from "next/link";
import { useEffect, useRef } from "react";
import Ic from "@/components/Ic";
import { useT } from "@/lib/i18n";
import { dShort, MS, todayP } from "@/lib/avail";
import { slug } from "@/lib/site";

type T = { city: string; from: string; to: string };
/** Prochains passages : slide horizontal (comme « Mis en avant »), il défile seul sur mobile jusqu'au premier toucher. */
export default function TripsSlide({ trips }: { trips: T[] }) {
  const { tr } = useT(); const box = useRef<HTMLDivElement>(null); const td = todayP();
  useEffect(() => {
    const el = box.current; if (!el || trips.length < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let stop = false; const halt = () => { stop = true; }; el.addEventListener("pointerdown", halt); el.addEventListener("touchstart", halt, { passive: true });
    const t = setInterval(() => { if (stop) return; const w = el.clientWidth * 0.7; el.scrollTo({ left: el.scrollLeft + w >= el.scrollWidth - el.clientWidth - 4 ? 0 : el.scrollLeft + w, behavior: "smooth" }); }, 3200);
    return () => { clearInterval(t); el.removeEventListener("pointerdown", halt); el.removeEventListener("touchstart", halt); };
  }, [trips.length]);
  return (
    <section className="tsl" aria-label={tr("Prochains passages")}>
      <h2 className="pres"><Ic n="pin" s={18} /> {tr("Prochains passages")}</h2>
      <div className="tsl-l" ref={box}>
        {trips.map((x, i) => { const [, m, d] = x.from.split("-"); const now = x.from <= td;
          return (
            <Link key={i} href={`/ville/${slug(x.city)}`} className={`tcd${now ? " now" : ""}`}>
              <span className="tcal"><b>{MS[+m - 1]}</b><span>{+d}</span></span>
              <span className="tin"><b>{x.city}</b>
                {now && <small className="tnow">{tr("En ce moment")}</small>}
                <em>{x.to !== x.from ? tr("du {a} au {b}", { a: dShort(x.from), b: dShort(x.to) }) : tr("le {a}", { a: dShort(x.from) })}</em></span>
            </Link>); })}
      </div>
    </section>
  );
}
