"use client";
import { useEffect, useState } from "react";

/** Code propre à ce navigateur (gardé localement). Si une capture d'écran fuite, le code qu'elle porte permet de remonter au visiteur. */
function code(): string {
  try {
    let c = localStorage.getItem("se_vc");
    if (!c || !/^[A-Z0-9]{6}$/.test(c)) { c = Array.from(crypto.getRandomValues(new Uint8Array(6)), (b) => "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"[b % 32]).join(""); localStorage.setItem("se_vc", c); }
    return c;
  } catch { return Math.random().toString(36).slice(2, 8).toUpperCase().padEnd(6, "X"); }
}

/** Filigrane discret en diagonale, répété sur toute l'image : site + code visiteur + date. Il se retrouve dans toute capture d'écran. */
export default function ViewerMark() {
  const [bg, setBg] = useState("");
  useEffect(() => {
    const t = `sex-escorte.com · ${code()} · ${new Date().toISOString().slice(0, 10)}`;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="170"><text x="150" y="85" text-anchor="middle" transform="rotate(-24 150 85)" font-family="Arial,sans-serif" font-size="9" font-weight="700" fill="#fff" fill-opacity=".16" stroke="#000" stroke-opacity=".08" stroke-width=".6">${t}</text></svg>`;
    setBg(`url("data:image/svg+xml,${encodeURIComponent(svg)}")`);
  }, []);
  if (!bg) return null;
  return <div className="vmark" aria-hidden="true" style={{ backgroundImage: bg }} />;
}
