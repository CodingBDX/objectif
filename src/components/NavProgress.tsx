"use client";
import { Suspense, useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

/** Fine barre rose en haut de l'écran pendant un changement de page. */
function Bar() {
  const path = usePathname(); const sp = useSearchParams(); const [on, setOn] = useState(false);
  useEffect(() => { setOn(false); }, [path, sp]);
  useEffect(() => {
    const h = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest?.("a"); if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || a.target === "_blank") return;
      const u = new URL(a.href, location.href); if (u.origin !== location.origin || (u.pathname === location.pathname && u.search === location.search)) return;
      setOn(true);
    };
    document.addEventListener("click", h, true); return () => document.removeEventListener("click", h, true);
  }, []);
  return on ? <div className="navbar" role="progressbar" aria-label="Chargement de la page"><i /></div> : null;
}
export default function NavProgress() { return <Suspense fallback={null}><Bar /></Suspense>; }
