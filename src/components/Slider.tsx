"use client";
import { useEffect, useRef, useState } from "react";

type Item = { v: boolean; src: string };
/** Photos du profil ; la vidéo (si elle existe) est la première diapositive. Un clic agrandit la photo ou lance la vidéo en grand. */
export default function Slider({ imgs, vip, video }: { imgs: string[]; vip: boolean; video?: string | null }) {
  const [i, setI] = useState(0); const [stop, setStop] = useState(false); const [lb, setLb] = useState(false);
  const hov = useRef(false); const tx = useRef<number | null>(null);
  const items: Item[] = [...(video ? [{ v: true, src: video }] : []), ...imgs.map((src) => ({ v: false, src }))]; const N = items.length;
  const go = (n: number, manual = false) => { setI((c) => (c + n + N) % N); if (manual) setStop(true); };
  useEffect(() => {
    if (N < 2 || stop || lb || (typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion:reduce)").matches)) return;
    const t = setInterval(() => { if (!hov.current) setI((c) => (c + 1) % N); }, 4500);
    return () => clearInterval(t);
  }, [N, stop, lb]);
  if (!N) return null;
  return (
    <>
      <div className="sl" onMouseEnter={() => (hov.current = true)} onMouseLeave={() => (hov.current = false)}>
        <div className="stage" onTouchStart={(e) => (tx.current = e.touches[0].clientX)}
          onTouchEnd={(e) => { if (tx.current === null) return; const d = e.changedTouches[0].clientX - tx.current; tx.current = null; if (Math.abs(d) > 40) go(d < 0 ? 1 : -1, true); }}>
          {vip && <span className="vipb">👑 VIP</span>}
          {items.map((it, k) => it.v
            ? <button key={k} className={`slide vslide${k === i ? " on" : ""}`} aria-label="Agrandir et lire la vidéo" onClick={() => setLb(true)}><video muted playsInline preload="metadata" src={it.src + "#t=0.1"} /><span className="vplay" aria-hidden="true">▶</span></button>
            : <button key={k} className={`slide${k === i ? " on" : ""}`} style={{ backgroundImage: `url('${it.src}')` }} aria-label={`Agrandir la photo ${video ? k : k + 1}`} onClick={() => setLb(true)} />)}
          {N > 1 && <><button className="nv prev" aria-label="Précédent" onClick={() => go(-1, true)}>‹</button><button className="nv next" aria-label="Suivant" onClick={() => go(1, true)}>›</button></>}
          <div className="pc">{i + 1} / {N}</div>
        </div>
        <div className="thumbs">{items.map((it, k) => it.v
          ? <button key={k} className={`th vth${k === i ? " on" : ""}`} aria-label="Voir la vidéo" onClick={() => { setI(k); setStop(true); }}><video muted playsInline preload="metadata" src={it.src + "#t=0.1"} /><span aria-hidden="true">▶</span></button>
          : <button key={k} className={`th${k === i ? " on" : ""}`} style={{ backgroundImage: `url('${it.src}')` }} aria-label={`Voir la photo ${video ? k : k + 1}`} onClick={() => { setI(k); setStop(true); }} />)}</div>
      </div>
      {lb && (
        <dialog id="lb" open style={{ position: "fixed", inset: 0, margin: "auto", zIndex: 60 }} onClick={() => setLb(false)}>
          <button className="x" style={{ position: "absolute", right: 8, top: 8 }} aria-label="Fermer" onClick={() => setLb(false)}>✕</button>
          {items[i].v ? <video controls autoPlay playsInline src={items[i].src} onClick={(e) => e.stopPropagation()} /> : <img id="lbi" src={items[i].src} alt="" />}
          <span className="wm">© HeyPapi</span>
        </dialog>
      )}
    </>
  );
}
