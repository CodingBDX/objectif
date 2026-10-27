"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/client";
import { refreshListings } from "@/app/actions";

/** Met l'annonce en pause ou la relance, depuis n'importe quelle page (profils standard et VIP). */
export default function PauseBtn({ id, paused, className = "nl own", full = false }: { id: string; paused: boolean; className?: string; full?: boolean }) {
  const r = useRouter(); const [busy, setBusy] = useState(false);
  const go = async () => {
    setBusy(true); window.dispatchEvent(new CustomEvent("hp-pause", { detail: !paused }));
    const { error } = await supabaseBrowser().from("profiles").update({ paused: !paused }).eq("id", id);
    if (error) window.dispatchEvent(new CustomEvent("hp-pause", { detail: paused }));
    else await refreshListings();
    setBusy(false); r.refresh();
  };
  const t = paused ? "Relancer mon annonce" : "Mettre mon annonce en pause";
  return <button type="button" className={className} onClick={go} disabled={busy} title={t} aria-label={t}>{full ? (paused ? "▶ Relancer mon annonce" : "⏸ Mettre en pause") : <>{paused ? "▶" : "⏸"} <span className="nlt">{paused ? "Relancer" : "Pause"}</span></>}</button>;
}
