import "./globals.css";
import Link from "next/link";
import type { Metadata } from "next";
import { supabaseServer } from "@/lib/supabase/server";
import SignOut from "@/components/SignOut";

export const metadata: Metadata = {
  title: { default: "Objectif — annuaire de créateurs", template: "%s · Objectif" },
  description: "Annuaire de photographes, vidéastes, artistes et livecam. Site fait par et pour les pros, 50 % reversés aux associations."
};

export default async function Root({ children }: { children: React.ReactNode }) {
  const sb = supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  let vip = false;
  if (user) { const { data } = await sb.from("profiles").select("vip").eq("id", user.id).maybeSingle(); vip = !!data?.vip; }
  return (
    <html lang="fr">
      <head>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fredoka:wght@500;700&family=Quicksand:wght@500;600;700&display=swap" />
      </head>
      <body>
        <nav className="nav"><div className="in">
          <Link href="/" className="logo">objectif</Link>
          <Link href="/" className="nl">Annuaire</Link>
          <Link href="/contact" className="nl" aria-label="Contact">✉</Link>
          {user && !vip && <Link href="/contact?s=vip" className="nl">👑 Devenir VIP</Link>}
          {user ? (<>
            <Link href="/mon-profil" className="nl">Mon profil</Link><SignOut />
          </>) : (<>
            <Link href="/connexion" className="nl">Se connecter</Link>
            <Link href="/connexion?inscription=1" className="btn">Créer mon profil</Link>
          </>)}
        </div></nav>
        <main className="wrap">
          <p className="panel" style={{ padding: "10px 16px", margin: "0 0 18px" }}>🛡️ Site fait par et pour les pros, 50 % reversés aux associations</p>
          {children}
        </main>
      </body>
    </html>
  );
}
