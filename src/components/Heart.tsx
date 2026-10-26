"use client";
import Ic from "./Ic";
import { useFavs } from "@/lib/favs";
export default function Heart({ id }: { id: string }) {
  const { favs, toggle } = useFavs(); const on = favs.includes(id);
  return (
    <button className="fav" aria-pressed={on} aria-label="Ajouter aux favoris" onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggle(id); }}>
      <Ic n="heart" s={22} /><span className="fc">{on ? 1 : 0}</span>
    </button>
  );
}
