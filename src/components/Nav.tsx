"use client";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import Ic from "./Ic";
import GlobalSearch, { SIndex } from "./GlobalSearch";
import { useFavs } from "@/lib/favs";
import { slug } from "@/lib/site";
import { supabaseBrowser } from "@/lib/supabase/client";

type P = { loggedIn: boolean; hasProfile: boolean; vip: boolean; name: string; userId: string; index: SIndex; isAdmin?: boolean; escort?: boolean };

function Inner({ loggedIn, hasProfile, vip, name, userId, index, isAdmin, escort }: P) {
    const [open, setOpen] = useState(false);
  const r = useRouter(); const sp = useSearchParams(); const { favs } = useFavs();
  const close = () => setOpen(false);
  const path = usePathname();
  return (
    <>
      <nav className={`nav${open ? " open" : ""}`} aria-label="Navigation principale"><div className="gut">
        <Link className="logo" href="/" aria-label="HeyPapi, retour à l’annuaire" onClick={() => { close(); try { localStorage.setItem("objectif_pm", JSON.stringify({ off: true })); } catch {} window.dispatchEvent(new Event("hp-home")); }}>
          <svg className="ic" viewBox="0 0 24 24" width="30" height="30" aria-hidden="true"><path d="M14 7c3.5 0 6 3 5 7.5-1.2 5-6 7.5-13.5 5.5 4-1 6.300-3 7.300-6 .8-2.300.4-4.500 1.200-7z" /><path d="M14 7c-.2-2 1-3.600 3.200-4" /></svg>heypapi
        </Link>
        <button className="burger" aria-label={open ? "Fermer le menu" : "Ouvrir le menu"} aria-expanded={open} onClick={() => setOpen(!open)}>
          <svg className="ic" viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16" /></svg>
        </button>
        <div className="navmenu" onClick={(e) => { if ((e.target as HTMLElement).closest("a,button")) close(); }}>
          <Link className={`nl${!sp.get("fav") && path !== "/carte" ? " on" : ""}`} href="/"><Ic n="grid" />Annuaire</Link>
          <Link className={`nl${path === "/carte" ? " on" : ""}`} href="/carte"><Ic n="pin" />Carte</Link>
          <Link className={`nl${sp.get("fav") ? " on" : ""}`} href="/?fav=1"><Ic n="heart" />Favoris <span className="cn">{favs.length}</span></Link>
          {escort && <Link className={`nl${path?.startsWith("/associations") ? " on" : ""}`} href="/associations" title="Associations et soutien par ville">🤝 <span className="nlt">Associations</span></Link>}
          <Link className="nl" href="/contact" aria-label="Nous contacter" title="Nous contacter">
            <svg className="ic" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="3" /><path d="M4 8l8 6 8-6" /></svg><span className="nlt">Contact</span>
          </Link>
          <Link className="nl" href="/?pm=1" title="Profils près de moi">📍 <span className="nlt">Près de moi</span></Link>
          {loggedIn && hasProfile && !vip && <Link className="nl vipn" href="/contact?s=vip"><span aria-hidden="true">👑</span><span>Devenir VIP</span></Link>}
          <GlobalSearch index={index} onGo={(u) => { close(); r.push(u); }} />
          {isAdmin && <Link className="nl" href="/admin">🛠 Admin</Link>}
          {loggedIn ? (<>
            {hasProfile && <Link className={`nl${path === "/verifier" ? " on" : ""}`} href="/verifier" title="Vérifier un client">🛡️ <span className="nlt">Vérifier un client</span></Link>}
            {hasProfile && <Link className={`nl own${path === "/mon-profil" ? " on" : ""}`} href="/mon-profil" title="Modifier mon profil">✏️ <span className="nlt">Modifier mon profil</span></Link>}
            {hasProfile && <Link className="nl own" href="/mon-profil#stats" title="Mes statistiques">📊 <span className="nlt">Mes statistiques</span></Link>}
            <Link className="nl" href={hasProfile ? `/profil/${userId}` : "/mon-profil"}>Mon profil</Link>
            <button className="nl" onClick={async () => { await supabaseBrowser().auth.signOut(); location.href = "/"; }}>👤 {name || "Moi"} · Quitter</button>
          </>) : (<>
            <Link className="btn login" href="/connexion">Se connecter</Link>
            <Link className="btn" href="/connexion?inscription=1">Créer mon profil</Link>
          </>)}
        </div>
      </div></nav>
    </>
  );
}
export default function Nav(p: P) { return <Suspense fallback={<nav className="nav" />}><Inner {...p} /></Suspense>; }
