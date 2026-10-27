"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const KEY = "objectif_18";
const FREE = ["/mentions-legales", "/cgu", "/confidentialite"]; // pages lisibles sans confirmer

export default function AgeGate() {
  const path = usePathname();
  const [ok, setOk] = useState<boolean | null>(null);
  useEffect(() => { try { setOk(localStorage.getItem(KEY) === "1"); } catch { setOk(false); } }, []);
  const open = ok !== true && !FREE.includes(path);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);
  if (!open) return null;
  return (
    <div role="dialog" aria-modal="true" aria-labelledby="ag-t" style={{ position: "fixed", inset: 0, zIndex: 1000, display: "grid", placeItems: "center", padding: 16, background: "var(--bg)", overflowY: "auto" }}>
      <div className="panel" style={{ maxWidth: 460, width: "100%", textAlign: "center", display: "grid", gap: 14, padding: 24 }}>
        <div style={{ font: "700 40px var(--fd)", color: "var(--btn)" }}>heypapi</div>
        <h1 id="ag-t" style={{ font: "700 26px/1.2 var(--fd)", margin: 0 }}>Site réservé aux adultes</h1>
        <p style={{ margin: 0 }}>Ce site s’adresse uniquement aux personnes <b>majeures (18 ans ou plus)</b>. En entrant, tu confirmes avoir l’âge légal et tu acceptes nos <Link href="/cgu" style={{ textDecoration: "underline" }}>conditions d’utilisation</Link>.</p>
        <button className="btn" autoFocus onClick={() => { try { localStorage.setItem(KEY, "1"); } catch {} setOk(true); }}>J’ai 18 ans ou plus · Entrer</button>
        <a className="btn ghost" href="https://www.google.fr" rel="noopener noreferrer">J’ai moins de 18 ans · Quitter</a>
        <p className="note" style={{ margin: 0 }}>Cette confirmation est déclarative.</p>
      </div>
    </div>
  );
}
