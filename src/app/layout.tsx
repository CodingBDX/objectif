import "./globals.css";
import type { Metadata } from "next";
import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";
import Nav from "@/components/Nav";
import { siteUrl } from "@/lib/site";

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
  let isAdmin = false;
  let me: { name: string; vip: boolean; paused: boolean } | null = null;
  if (user) { const { data } = await sb.from("profiles").select("name,vip,paused").eq("id", user.id).maybeSingle(); me = data; }
  if (user) { const { data: ad } = await sb.from("admins").select("id").eq("id", user.id).maybeSingle(); isAdmin = !!ad; }
  const { data: cs } = await sb.from("profiles").select("city,more").eq("paused", false);
  const cities = Array.from(new Set((cs || []).flatMap((c: any) => [c.city, ...(c.more || [])]).filter(Boolean))).sort((a: any, b: any) => a.localeCompare(b, "fr")) as string[];
  return (
    <html lang="fr" data-theme="light">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600;700&family=Quicksand:wght@500;600;700&display=swap" />
      </head>
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@type": "WebSite", name: "HeyPapi", url: siteUrl(), inLanguage: "fr" }) }} />
        <Nav loggedIn={!!user} hasProfile={!!me} vip={!!me?.vip} name={me?.name || ""} userId={user?.id || ""} cities={cities} isAdmin={isAdmin} />
        {me?.paused && (
          <div className="pbanner" role="status"><span>⏸ Ton annonce « {me.name} » est en pause{me.vip ? " (même en VIP)" : ""} : elle n’apparaît plus dans l’annuaire.</span>
            <Link href="/mon-profil?reactiver=1">▶ Réactiver mon annonce</Link></div>
        )}
        {children}
        <footer className="gut" id="foot">Contenus professionnels uniquement. Les profils sont réservés aux personnes majeures qui détiennent les droits de leurs images et vidéos.</footer>
      </body>
    </html>
  );
}
