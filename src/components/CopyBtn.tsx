"use client";
import { useState } from "react";
import { track } from "@/lib/track";
import { useT } from "@/lib/i18n";
export default function CopyBtn({ text, label, className = "btn ghost", trackId }: { text: string; label: string; className?: string; trackId?: string }) {
  const { tr } = useT(); const [ok, setOk] = useState(false);
  return <button className={className} type="button" onClick={async () => { try { await navigator.clipboard.writeText(text || location.href); setOk(true); if (trackId) track(trackId, "copy"); setTimeout(() => setOk(false), 1500); } catch {} }}>{ok ? tr("Copié ✔") : tr(label)}</button>;
}
