import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";
import { AI_BOTS } from "@/lib/aiBots";

/** Robots d'entraînement d'IA et de copie de contenu : refusés partout. Les moteurs de recherche classiques (Google, Bing…) restent autorisés.
 *  /connexion et /statistiques ne sont pas bloquées ici : elles portent une balise noindex, que Google doit pouvoir lire. */

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: AI_BOTS, disallow: "/" },
      /* Les photos des escortes ne vont pas dans Google Images (protection contre la recherche d'image inversée). */
      { userAgent: "Googlebot-Image", disallow: "/media/" },
      { userAgent: "*", allow: "/", disallow: ["/api/", "/mon-profil", "/admin", "/verifier", "/media/", "/*?fav=", "/*?pm=", "/*?tag="] }
    ],
    sitemap: `${siteUrl()}/sitemap.xml`
  };
}
