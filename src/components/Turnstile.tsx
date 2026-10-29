"use client";
import { useEffect, useRef } from "react";

/** Clé publique Cloudflare Turnstile (la clé secrète est dans Supabase > Authentication > Attack Protection). */
export const TURNSTILE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "0x4AAAAAAFrO2KNsoRHLxINh";

declare global { interface Window { turnstile?: { render: (el: HTMLElement, o: Record<string, unknown>) => string; reset: (id?: string) => void; remove: (id?: string) => void } } }

/** Contrôle anti-robots. onToken reçoit le jeton (ou "" s'il expire). `resetKey` : change la valeur pour relancer le contrôle. */
export default function Turnstile({ onToken, resetKey = 0 }: { onToken: (t: string) => void; resetKey?: number }) {
  const box = useRef<HTMLDivElement>(null); const id = useRef<string | undefined>();
  const cb = useRef(onToken); cb.current = onToken;
  useEffect(() => {
    let dead = false;
    const draw = () => {
      if (dead || !box.current || !window.turnstile || id.current) return;
      id.current = window.turnstile.render(box.current, { sitekey: TURNSTILE_KEY, theme: "auto", language: "fr", callback: (t: string) => cb.current(t), "expired-callback": () => cb.current(""), "error-callback": () => cb.current("") });
    };
    if (window.turnstile) draw();
    else {
      let s = document.getElementById("cf-turnstile") as HTMLScriptElement | null;
      if (!s) { s = document.createElement("script"); s.id = "cf-turnstile"; s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"; s.async = true; document.head.appendChild(s); }
      s.addEventListener("load", draw);
    }
    return () => { dead = true; try { if (id.current) window.turnstile?.remove(id.current); } catch {} id.current = undefined; };
  }, []);
  useEffect(() => { if (resetKey && id.current) { try { window.turnstile?.reset(id.current); } catch {} cb.current(""); } }, [resetKey]);
  return <div ref={box} style={{ minHeight: 65, display: "flex", justifyContent: "center" }} />;
}
