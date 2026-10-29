"use client";
import { useEffect, useState } from "react";
import { useT } from "@/lib/i18n";

type BIP = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };
declare global { interface Window { __bip?: BIP | null } }
const standalone = () => window.matchMedia("(display-mode: standalone)").matches || (navigator as unknown as { standalone?: boolean }).standalone === true;
const isIos = () => /iphone|ipad|ipod/i.test(navigator.userAgent);

function useInstall() {
  const [can, setCan] = useState(false); const [ios, setIos] = useState(false); const [done, setDone] = useState(false);
  useEffect(() => {
    try { if ("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js").catch(() => {}); } catch {}
    if (standalone()) { setDone(true); return; }
    setIos(isIos()); setCan(!!window.__bip);
    const on = (e: Event) => { e.preventDefault(); window.__bip = e as BIP; setCan(true); };
    const inst = () => { window.__bip = null; setCan(false); setDone(true); };
    window.addEventListener("beforeinstallprompt", on); window.addEventListener("appinstalled", inst);
    return () => { window.removeEventListener("beforeinstallprompt", on); window.removeEventListener("appinstalled", inst); };
  }, []);
  const install = async () => { const p = window.__bip; if (!p) return false; await p.prompt(); try { await p.userChoice; } catch {} window.__bip = null; setCan(false); return true; };
  return { can, ios, done, install };
}

/** Bandeau discret (mobile) : proposé à la 2e visite, une seule fois. */
export default function InstallBanner() {
  const { tr } = useT(); const { can, ios, done, install } = useInstall(); const [show, setShow] = useState(false); const [help, setHelp] = useState(false);
  useEffect(() => {
    try {
      if (localStorage.getItem("hp_pwa_no")) return;
      const n = Number(localStorage.getItem("hp_visits") || "0") + 1; localStorage.setItem("hp_visits", String(n));
      if (n >= 2) { const t = setTimeout(() => setShow(true), 8000); return () => clearTimeout(t); }
    } catch {}
  }, []);
  const close = () => { setShow(false); try { localStorage.setItem("hp_pwa_no", "1"); } catch {} };
  if (!show || done || !(can || ios)) return null;
  return (
    <div className="pwab" role="dialog" aria-label={tr("Installer l’appli")}>
      <span aria-hidden="true">🌶️</span>
      <div>{tr("Ajoute Sex-Escorte à ton écran d’accueil")}{help && <small>{tr("Touche « Partager » puis « Sur l’écran d’accueil ».")}</small>}</div>
      {can ? <button type="button" className="btn" onClick={async () => { await install(); close(); }}>{tr("Installer")}</button>
        : <button type="button" className="btn" onClick={() => { setHelp(true); try { localStorage.setItem("hp_pwa_no", "1"); } catch {} }}>{tr("Comment ?")}</button>}
      <button type="button" className="pwax" onClick={close} aria-label={tr("Fermer")}>✕</button>
    </div>
  );
}

/** Lien permanent « Installer l'appli » (pied de page) : visible seulement si l'installation est possible. */
export function InstallLink({ bare = false }: { bare?: boolean }) {
  const { tr } = useT(); const { can, ios, done, install } = useInstall(); const [help, setHelp] = useState(false);
  if (done || !(can || ios)) return null;
  return <span className="pwal">{bare ? null : " · "}<button type="button" onClick={() => (can ? install() : setHelp(!help))}>📲 {tr("Installer l’appli")}</button>{help && <small> {tr("Touche « Partager » puis « Sur l’écran d’accueil ».")}</small>}</span>;
}
