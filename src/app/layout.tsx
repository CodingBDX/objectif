import "./globals.css";
import type { Metadata } from "next";
import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";
import Nav from "@/components/Nav";
import AgeGate from "@/components/AgeGate";
import { siteUrl } from "@/lib/site";
import { publicCities } from "@/lib/public";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  openGraph: { siteName: "HeyPapi", locale: "fr_FR", type: "website" },
  twitter: { card: "summary_large_image" },
  title: { default: "HeyPapi, annuaire des créateurs", template: "%s · HeyPapi" },
  description: "Annuaire de photographes, vidéastes, artistes et livecam. Site fait par et pour les pros, 50 % reversés aux associations."
};
export const dynamic = "force-dynamic";

export default async function Root({ children }: { children: React.ReactNode }) {
  const sb = supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  const [me, isAdmin, cities] = await Promise.all([
    user ? sb.from("profiles").select("name,vip,paused").eq("id", user.id).maybeSingle().then((r: any) => r.data as { name: string; vip: boolean; paused: boolean } | null) : Promise.resolve(null),
    user ? sb.from("admins").select("id").eq("id", user.id).maybeSingle().then((r: any) => !!r.data) : Promise.resolve(false),
    publicCities()
  ]);
  return (
    <html lang="fr" data-theme="light">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600;700&family=Quicksand:wght@500;600;700&display=swap" />
      </head>
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@type": "WebSite", name: "HeyPapi", url: siteUrl(), inLanguage: "fr" }) }} />
        <AgeGate />
        <Nav loggedIn={!!user} hasProfile={!!me} vip={!!me?.vip} name={me?.name || ""} userId={user?.id || ""} cities={cities} isAdmin={isAdmin} />
        {me?.paused && (
          <div className="pbanner" role="status"><span>⏸ Ton annonce « {me.name} » est en pause{me.vip ? " (même en VIP)" : ""} : elle n’apparaît plus dans l’annuaire.</span>
            <Link href="/mon-profil?reactiver=1">▶ Réactiver mon annonce</Link></div>
        )}
        {children}
        <footer className="gut" id="foot">Contenus professionnels uniquement. Les profils sont réservés aux personnes majeures qui détiennent les droits de leurs images et vidéos.<br /><Link href="/mentions-legales">Mentions légales</Link> · <Link href="/cgu">Conditions d’utilisation</Link> · <Link href="/confidentialite">Confidentialité</Link> · <Link href="/contact">Contact</Link></footer>
      </body>
    </html>
  );
}
