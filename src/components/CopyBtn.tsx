"use client";
import { useState } from "react";
import { track } from "@/lib/track";
export default function CopyBtn({ text, label, className = "btn ghost", trackId }: { text: string; label: string; className?: string; trackId?: string }) {
  const [ok, setOk] = useState(false);
  return <button className={className} type="button" onClick={async () => { try { await navigator.clipboard.writeText(text || location.href); setOk(true); if (trackId) track(trackId, "copy"); setTimeout(() => setOk(false), 1500); } catch {} }}>{ok ? "Copié ✔" : label}</button>;
}
