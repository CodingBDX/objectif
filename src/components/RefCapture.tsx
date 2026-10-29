"use client";
import { useEffect } from "react";

/** Mémorise le code de parrainage du lien (?ref=abc1234) jusqu'à la création du profil. */
export default function RefCapture() {
  useEffect(() => { try { const r = new URLSearchParams(location.search).get("ref"); if (r && /^[a-z0-9]{4,12}$/i.test(r)) localStorage.setItem("hp_ref", r.toLowerCase()); } catch {} }, []);
  return null;
}
