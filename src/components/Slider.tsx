"use client";
import { useEffect, useRef, useState } from "react";

export default function Slider({ imgs, vip }: { imgs: string[]; vip: boolean }) {
  const [i, setI] = useState(0); const [stop, setStop] = useState(false); const [lb, setLb] = useState(false);
  const hov = useRef(false); const tx = useRef<number | null>(null); const N = imgs.length;
  const go = (n: number, manual = false) => { setI((c) => (c + n + N) % N); if (manual) setStop(true); };
  useEffect(() => {
    if (N < 2 || stop || (typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion:reduce)").matches)) return;
    const t = setInterval(() => { if (!hov.current) setI((c) => (c + 1) % N); }, 4500);
    return () => clearInterval(t);
  }, [N, stop]);
  if (!N) return null;
  return (
    <>
      <div className="sl" onMouseEnter={() => (hov.current = true)} onMouseLeave={() => (hov.current = false)}>
        <div className="stage" onTouchStart={(e) => (tx.current = e.touches[0].clientX)}
          onTouchEnd={(e) => { if (tx.current === null) return; const d = e.changedTouches[0].clientX - tx.current; tx.current = null; if (Math.abs(d) > 40) go(d < 0 ? 1 : -1, true); }}>
          {vip && <span className="vipb">👑 VIP</span>}
          {imgs.map((u, k) => <button key={k} className={`slide${k === i ? " on" : ""}`} style={{ backgroundImage: `url('${u}')` }} aria-label={`Agrandir la photo ${k + 1}`} onClick={() => setLb(true)} />)}
          {N > 1 && <><button className="nv prev" aria-label="Photo précédente" onClick={() => go(-1, true)}>‹</button><button className="nv next" aria-label="Photo suivante" onClick={() => go(1, true)}>›</button></>}
          <div className="pc">{i + 1} / {N}</div>
        </div>
        <div className="thumbs">{imgs.map((u, k) => <button key={k} className={`th${k === i ? " on" : ""}`} style={{ backgroundImage: `url('${u}')` }} aria-label={`Voir la photo ${k + 1}`} onClick={() => { setI(k); setStop(true); }} />)}</div>
      </div>
      {lb && (
        <dialog id="lb" open style={{ position: "fixed", inset: 0, margin: "auto", zIndex: 60 }} onClick={() => setLb(false)}>
          <button className="x" style={{ position: "absolute", right: 8, top: 8 }} aria-label="Fermer" onClick={() => setLb(false)}>✕</button>
          <img id="lbi" src={imgs[i]} alt="" />
          <span className="wm">© Objectif</span>
        </dialog>
      )}
    </>
  );
}
