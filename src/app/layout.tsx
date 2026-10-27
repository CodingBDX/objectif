import "./globals.css";
import type { Metadata } from "next";
import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";
import Nav from "@/components/Nav";
import AgeGate from "@/components/AgeGate";
import Splash from "@/components/Splash";
import NavProgress from "@/components/NavProgress";
import { siteUrl } from "@/lib/site";
import { publicProfiles } from "@/lib/public";
import { lab } from "@/lib/types";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  openGraph: { siteName: "HeyPapi", locale: "fr_FR", type: "website" },
  twitter: { card: "summary_large_image" },
  title: { default: "HeyPapi, annuaire des escortes populaire, sexy, numéro un", template: "%s · HeyPapi" },
  description: "Annuaire des escortes : profils vérifiés, photos, disponibilités et villes visitées. 50 % reversés aux associations."
};
export const dynamic = "force-dynamic";

export default async function Root({ children }: { children: React.ReactNode }) {
  const sb = supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  const [me, isAdmin, all] = await Promise.all([
    user ? sb.from("profiles").select("name,vip,paused,genre").eq("id", user.id).maybeSingle().then((r: any) => r.data as { name: string; vip: boolean; paused: boolean; genre: string } | null) : Promise.resolve(null),
    user ? sb.from("admins").select("id").eq("id", user.id).maybeSingle().then((r: any) => !!r.data) : Promise.resolve(false),
    publicProfiles()
  ]);
  const escort = isAdmin || (!!me && me.genre !== "livecam");
  const cc: Record<string, number> = {}, tc: Record<string, number> = {};
  all.forEach((p) => { cc[p.city] = (cc[p.city] || 0) + 1; p.specialties.forEach((x) => { const k = x.toLowerCase(); tc[k] = (tc[k] || 0) + 1; }); });
  const index = { c: Object.entries(cc).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "fr")) as [string, number][], t: Object.entries(tc).sort((a, b) => b[1] - a[1]) as [string, number][], p: all.map((p) => ({ id: p.id, name: p.name, sub: [lab(p), p.city].filter(Boolean).join(" · ") })) };
  return (
    <html lang="fr" data-theme="light">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600;700&family=Quicksand:wght@500;600;700&display=swap" />
      </head>
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@type": "WebSite", name: "HeyPapi", url: siteUrl(), inLanguage: "fr" }) }} />
        <Splash /><NavProgress />
        <AgeGate />
        <Nav loggedIn={!!user} hasProfile={!!me} vip={!!me?.vip} name={me?.name || ""} userId={user?.id || ""} index={index} isAdmin={isAdmin} escort={escort} />
        {me?.paused && (
          <div className="pbanner" role="status"><span>⏸ Ton annonce « {me.name} » est en pause{me.vip ? " (même en VIP)" : ""} : elle n’apparaît plus dans l’annuaire.</span>
            <Link href="/mon-profil?reactiver=1">▶ Réactiver mon annonce</Link></div>
        )}
        {children}
        <footer className="gut" id="foot">Contenus professionnels uniquement. Les profils sont réservés aux personnes majeures qui détiennent les droits de leurs images et vidéos.<br /><Link href="/mentions-legales">Mentions légales</Link> · <Link href="/cgu">Conditions d’utilisation</Link> · <Link href="/confidentialite">Confidentialité</Link> · {escort && <><Link href="/associations">Associations</Link> · </>}<Link href="/contact">Contact</Link></footer>
      </body>
    </html>
  );
}
