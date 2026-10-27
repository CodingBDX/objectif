"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/client";
export default function OwnerBar({ id, paused, vip }: { id: string; paused: boolean; vip: boolean }) {
  const r = useRouter();
  const toggle = async () => { await supabaseBrowser().from("profiles").update({ paused: !paused }).eq("id", id); r.refresh(); };
  return (
    <div className="ownbar">
      {paused && <div className="pnote">⏸ Ton annonce est en pause : elle n’apparaît plus dans l’annuaire{vip ? ", même en VIP" : ""}.</div>}
      <div className="acts">
        <Link className="btn" href="/mon-profil">✏️ Modifier mon profil</Link>
        <Link className="btn ghost" href="/mon-profil#stats">📊 Mes statistiques</Link>
        <button className="btn ghost" onClick={toggle}>{paused ? "▶ Réactiver mon annonce" : "⏸ Mettre mon annonce en pause"}</button>
      </div>
    </div>
  );
}
