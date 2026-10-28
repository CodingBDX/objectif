"use client";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import Ic from "./Ic";
import PauseBtn from "./PauseBtn";
import GlobalSearch, { SIndex } from "./GlobalSearch";
import { useT, LangSwitch } from "@/lib/i18n";
import { useFavs } from "@/lib/favs";
import { slug } from "@/lib/site";
import { sbLazy } from "@/lib/supabase/lazy";

type P = { loggedIn: boolean; hasProfile: boolean; vip: boolean; name: string; userId: string; index: SIndex; isAdmin?: boolean; escort?: boolean; paused?: boolean; lodg?: boolean };

function Inner({ loggedIn, hasProfile, vip, name, userId, index, isAdmin, escort, paused, lodg }: P) {
    const [open, setOpen] = useState(false);
  const { tr } = useT(); const r = useRouter(); const sp = useSearchParams(); const { favs } = useFavs();
  const close = () => setOpen(false);
  useEffect(() => { if (!hasProfile) return; try { if (sessionStorage.getItem("hp_seen")) return; sessionStorage.setItem("hp_seen", "1"); } catch {} sbLazy().then((sb) => sb.rpc("touch_last_seen")).then(() => {}, () => {}); }, [hasProfile]);
  const path = usePathname();
  return (
    <>
      <nav className={`nav${open ? " open" : ""}`} aria-label={tr("Navigation principale")}><div className="gut">
        <Link className="logo" href={loggedIn ? "/" : "/rejoindre"} aria-label={loggedIn ? "Sex-Escorte, retour à l’annuaire" : "Sex-Escorte, rejoindre le site"} onClick={() => { close(); try { localStorage.setItem("objectif_pm", JSON.stringify({ off: true })); } catch {} window.dispatchEvent(new Event("hp-home")); }}>
          <svg className="ic" viewBox="0 0 24 24" width="26" height="26" aria-hidden="true"><path d="M14 7c3.5 0 6 3 5 7.5-1.2 5-6 7.5-13.5 5.5 4-1 6.300-3 7.300-6 .8-2.300.4-4.500 1.200-7z" /><path d="M14 7c-.2-2 1-3.600 3.200-4" /></svg><span className="lt">sex-escorte<small>.com</small></span>
        </Link>
        <div className="lang-bar"><LangSwitch /></div>
        <button className="burger" aria-label={open ? tr("Fermer le menu") : tr("Ouvrir le menu")} aria-expanded={open} onClick={() => setOpen(!open)}>
          <svg className="ic" viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16" /></svg>
        </button>
        <div className="navmenu" onClick={(e) => { if ((e.target as HTMLElement).closest("a,button")) close(); }}>
          <div className="gs-mob"><GlobalSearch index={index} onGo={(u) => { close(); r.push(u); }} /></div>
          <Link className={`nl${!sp.get("fav") && path !== "/carte" ? " on" : ""}`} href="/"><Ic n="grid" /><span className="nlx">{tr("Annuaire")}</span></Link>
          <Link className={`nl${path === "/carte" ? " on" : ""}`} href="/carte" aria-label={tr("Carte")} title={tr("Carte")}><Ic n="pin" /><span className="nlt">{tr("Carte")}</span></Link>
          <Link className={`nl${sp.get("fav") ? " on" : ""}`} href="/?fav=1" aria-label={tr("Favoris")} title={tr("Favoris")}><Ic n="heart" /><span className="nlt">{tr("Favoris")}</span> <span className="cn">{favs.length}</span></Link>
          {lodg && <Link className={`nl${path?.startsWith("/logements") ? " on" : ""}`} href="/logements" title={tr("Logements")} aria-label={tr("Logements")}><span className="em" aria-hidden="true">🏠</span><span className="nlt">{tr("Logements")}</span></Link>}
          {escort && <Link className={`nl${path?.startsWith("/associations") ? " on" : ""}`} href="/associations" title={tr("Associations et soutien par ville")}><span className="em" aria-hidden="true">🤝</span><span className="nlt">{tr("Associations")}</span></Link>}
          <Link className="nl" href="/contact" aria-label={tr("Nous contacter")} title={tr("Nous contacter")}>
            <svg className="ic" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="3" /><path d="M4 8l8 6 8-6" /></svg><span className="nlt">{tr("Contact")}</span>
          </Link>
          <Link className="nl" href="/?pm=1" title={tr("Profils près de moi")} aria-label={tr("Près de moi")}><span className="em" aria-hidden="true">📍</span><span className="nlt">{tr("Près de moi")}</span></Link>
          {loggedIn && hasProfile && !vip && <Link className="nl vipn" href="/contact?s=vip"><span aria-hidden="true">👑</span><span>{tr("Devenir VIP")}</span></Link>}
          <div className="gs-desk"><LangSwitch /><GlobalSearch index={index} onGo={(u) => { close(); r.push(u); }} /></div>
          {isAdmin && <Link className="nl" href="/admin" title="Admin" aria-label="Admin"><span className="em" aria-hidden="true">🛠</span><span className="nlt">Admin</span></Link>}
          {loggedIn ? (<>
            {hasProfile && vip && <PauseBtn id={userId} paused={!!paused} />}
            {hasProfile && <Link className={`nl${path === "/verifier" ? " on" : ""}`} href="/verifier" title={tr("Vérifier un client")}><span className="em" aria-hidden="true">🛡️</span><span className="nlt">{tr("Vérifier un client")}</span></Link>}
            {hasProfile && <Link className={`nl own${path === "/mon-profil" ? " on" : ""}`} href="/mon-profil" title={tr("Modifier mon profil")}><span className="em" aria-hidden="true">✏️</span><span className="nlt">{tr("Modifier mon profil")}</span></Link>}
            {hasProfile && lodg && <Link className={`nl own${path === "/mon-logement" ? " on" : ""}`} href="/mon-logement" title={tr("Mon logement")}><span className="em" aria-hidden="true">🏠</span><span className="nlt">{tr("Mon logement")}</span></Link>}
            {hasProfile && <Link className="nl own" href="/mon-profil#stats" title={tr("Mes statistiques")}><span className="em" aria-hidden="true">📊</span><span className="nlt">{tr("Mes statistiques")}</span></Link>}
            <Link className="nl" href={hasProfile ? `/profil/${userId}` : "/mon-profil"} title={tr("Mon profil")} aria-label={tr("Mon profil")}><span className="em" aria-hidden="true">👤</span><span className="nlt">{tr("Mon profil")}</span></Link>
            <button className="nl" title={tr("Quitter")} aria-label={tr("Quitter")} onClick={async () => { await (await sbLazy()).auth.signOut(); location.href = "/"; }}><span className="em" aria-hidden="true">🚪</span><span className="nlt">{name || tr("Moi")} · {tr("Quitter")}</span></button>
          </>) : (<>
            <Link className="btn login" href="/connexion">{tr("Se connecter")}</Link>
            <Link className="btn" href="/connexion?inscription=1">{tr("Créer mon profil")}</Link>
          </>)}
        </div>
      </div></nav>
    </>
  );
}
export default function Nav(p: P) { return <Suspense fallback={<nav className="nav" />}><Inner {...p} /></Suspense>; }
