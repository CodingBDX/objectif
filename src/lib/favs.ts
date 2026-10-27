"use client";
import { useEffect, useState } from "react";
import { supabaseBrowser } from "./supabase/client";
const K = "objectif_favoris";
const read = (): string[] => { try { return JSON.parse(localStorage.getItem(K) || "[]"); } catch { return []; } };
export function useFavs() {
  const [favs, set] = useState<string[]>([]);
  useEffect(() => {
    const sync = () => set(read());
    sync();
    // connecté : fusionne les cœurs de l'appareil avec ceux du compte (une fois par visite)
    (async () => {
      try {
        if (sessionStorage.getItem("favs_synced")) return;
        const sb = supabaseBrowser(); const { data: { user } } = await sb.auth.getUser(); if (!user) return;
        const { data, error } = await sb.from("favorites").select("profile_id"); if (error) return;
        const remote = (data || []).map((r: { profile_id: string }) => r.profile_id); const local = read();
        const all = Array.from(new Set([...local, ...remote]));
        const add = local.filter((x) => !remote.includes(x));
        if (add.length) await sb.from("favorites").upsert(add.map((profile_id) => ({ user_id: user.id, profile_id })), { onConflict: "user_id,profile_id", ignoreDuplicates: true });
        localStorage.setItem(K, JSON.stringify(all)); sessionStorage.setItem("favs_synced", "1"); window.dispatchEvent(new Event("favs"));
      } catch {}
    })();
    window.addEventListener("favs", sync); window.addEventListener("storage", sync);
    return () => { window.removeEventListener("favs", sync); window.removeEventListener("storage", sync); };
  }, []);
  const toggle = (id: string) => {
    const c = read(); const n = c.includes(id) ? c.filter((x) => x !== id) : [...c, id];
    try { localStorage.setItem(K, JSON.stringify(n)); } catch {}
    window.dispatchEvent(new Event("favs"));
    (async () => { // connecté : enregistre aussi le cœur dans le compte
      try { const sb = supabaseBrowser(); const { data: { user } } = await sb.auth.getUser(); if (!user) return;
        if (n.includes(id)) await sb.from("favorites").upsert({ user_id: user.id, profile_id: id }, { onConflict: "user_id,profile_id", ignoreDuplicates: true });
        else await sb.from("favorites").delete().eq("user_id", user.id).eq("profile_id", id); } catch {}
    })();
  };
  return { favs, toggle };
}
