"use client";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/client";
export default function OwnerBar({ id, paused, vip }: { id: string; paused: boolean; vip: boolean }) {
  const r = useRouter();
  const toggle = async () => { await supabaseBrowser().from("profiles").update({ paused: !paused }).eq("id", id); r.refresh(); };
  return (
    <div className="ownbar">
      {paused && <div className="pnote">⏸ Ton annonce est en pause : elle n’apparaît plus dans l’annuaire{vip ? ", même en VIP" : ""}.</div>}
      <div className="acts">
        <button className="btn ghost" onClick={toggle}>{paused ? "▶ Réactiver mon annonce" : "⏸ Mettre mon annonce en pause"}</button>
      </div>
    </div>
  );
}
