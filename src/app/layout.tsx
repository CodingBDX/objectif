import "./globals.css";
import type { Metadata } from "next";
import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";
import Nav from "@/components/Nav";

export const metadata: Metadata = {
  title: { default: "Objectif, annuaire des créateurs", template: "%s · Objectif" },
  description: "Annuaire de photographes, vidéastes, artistes et livecam. Site fait par et pour les pros, 50 % reversés aux associations."
};
export const dynamic = "force-dynamic";

export default async function Root({ children }: { children: React.ReactNode }) {
  const sb = supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  let me: { name: string; vip: boolean; paused: boolean } | null = null;
  if (user) { const { data } = await sb.from("profiles").select("name,vip,paused").eq("id", user.id).maybeSingle(); me = data; }
  const { data: cs } = await sb.from("profiles").select("city,more").eq("paused", false);
  const cities = Array.from(new Set((cs || []).flatMap((c: any) => [c.city, ...(c.more || [])]).filter(Boolean))).sort((a: any, b: any) => a.localeCompare(b, "fr")) as string[];
  return (
    <html lang="fr">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600;700&family=Quicksand:wght@500;600;700&display=swap" />
      </head>
      <body>
        <Nav loggedIn={!!user} hasProfile={!!me} vip={!!me?.vip} name={me?.name || ""} userId={user?.id || ""} cities={cities} />
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
