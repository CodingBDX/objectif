"use client";
import { useState } from "react";
export default function CopyBtn({ text, label, className = "btn ghost" }: { text: string; label: string; className?: string }) {
  const [ok, setOk] = useState(false);
  return <button className={className} type="button" onClick={async () => { try { await navigator.clipboard.writeText(text || location.href); setOk(true); setTimeout(() => setOk(false), 1500); } catch {} }}>{ok ? "Copié ✔" : label}</button>;
}
