import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";
import { AI_BOTS } from "@/lib/aiBots";

/** Robots d'entraînement d'IA et de copie de contenu : refusés partout. Les moteurs de recherche classiques (Google, Bing…) restent autorisés. */

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: AI_BOTS, disallow: "/" },
      { userAgent: "*", allow: "/", disallow: ["/api/", "/mon-profil", "/connexion", "/admin", "/statistiques", "/verifier"] }
    ],
    sitemap: `${siteUrl()}/sitemap.xml`
  };
}
