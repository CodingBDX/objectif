"use client";
import { useEffect, useState } from "react";

/** Vidéo de présentation : aperçu cliquable qui s'agrandit en plein écran (Échap ou clic à côté pour fermer). */
export default function VideoBox({ src }: { src: string }) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!open) return;
    const k = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", k); const prev = document.body.style.overflow; document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", k); document.body.style.overflow = prev; };
  }, [open]);
  return (
    <>
      <button type="button" className="video vbtn" aria-label="Agrandir la vidéo" onClick={() => setOpen(true)}>
        <video muted playsInline preload="metadata" src={src + "#t=0.1"} />
        <span className="vplay" aria-hidden="true">▶</span>
        <span className="vhint">Clique pour agrandir</span>
      </button>
      {open && (
        <div className="vlb" role="dialog" aria-modal="true" aria-label="Vidéo agrandie" onClick={() => setOpen(false)}>
          <button className="x" style={{ position: "absolute", right: 12, top: 12 }} aria-label="Fermer" onClick={() => setOpen(false)}>✕</button>
          <div className="vlbw" onClick={(e) => e.stopPropagation()}>
            <video controls autoPlay playsInline src={src} />
            <span className="wm">© HeyPapi</span>
          </div>
        </div>
      )}
    </>
  );
}
