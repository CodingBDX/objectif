"use client";
import { useEffect, useState } from "react";
const K = "objectif_favoris";
const read = (): string[] => { try { return JSON.parse(localStorage.getItem(K) || "[]"); } catch { return []; } };
export function useFavs() {
  const [favs, set] = useState<string[]>([]);
  useEffect(() => {
    const sync = () => set(read());
    sync(); window.addEventListener("favs", sync); window.addEventListener("storage", sync);
    return () => { window.removeEventListener("favs", sync); window.removeEventListener("storage", sync); };
  }, []);
  const toggle = (id: string) => {
    const c = read(); const n = c.includes(id) ? c.filter((x) => x !== id) : [...c, id];
    try { localStorage.setItem(K, JSON.stringify(n)); } catch {}
    window.dispatchEvent(new Event("favs"));
  };
  return { favs, toggle };
}
