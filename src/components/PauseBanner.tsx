"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import PauseBtn from "./PauseBtn";

/** Bandeau « annonce en pause » : s'affiche et disparaît instantanément quand on met en pause ou qu'on relance. */
export default function PauseBanner({ id, name, vip, paused }: { id: string; name: string; vip: boolean; paused: boolean }) {
  const [p, setP] = useState(paused);
  useEffect(() => setP(paused), [paused]);
  useEffect(() => {
    const h = (e: Event) => setP(!!(e as CustomEvent<boolean>).detail);
    window.addEventListener("hp-pause", h); return () => window.removeEventListener("hp-pause", h);
  }, []);
  if (!p) return null;
  return (
    <div className="pbanner" role="status"><span>⏸ Ton annonce « {name} » est en pause{vip ? " (même en VIP)" : ""} : elle n’apparaît plus dans l’annuaire.</span>
      {vip ? <PauseBtn id={id} paused className="" full /> : <Link href="/mon-profil?reactiver=1">▶ Réactiver mon annonce</Link>}</div>
  );
}
