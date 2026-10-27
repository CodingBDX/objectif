"use client";
import { useEffect, useState } from "react";

/** Nombre qui monte de 0 à sa valeur (≈ 1 s). Sans animation si l'appareil demande de réduire les mouvements. */
export default function CountUp({ to, ms = 900 }: { to: number; ms?: number }) {
  const [v, setV] = useState(to);
  useEffect(() => {
    if (to <= 0 || (typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches)) { setV(to); return; }
    let raf = 0; const t0 = performance.now(); setV(0);
    const tick = (t: number) => { const k = Math.min(1, (t - t0) / ms); setV(Math.round(to * (1 - Math.pow(1 - k, 3)))); if (k < 1) raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [to, ms]);
  return <>{v.toLocaleString("fr-FR")}</>;
}
