import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

/** Robots d'entraînement d'IA et de copie de contenu : refusés partout. Les moteurs de recherche classiques (Google, Bing…) restent autorisés. */
const AI_BOTS = [
  "GPTBot", "ChatGPT-User", "OAI-SearchBot", "ClaudeBot", "Claude-Web", "anthropic-ai", "CCBot", "Google-Extended", "GoogleOther",
  "PerplexityBot", "Perplexity-User", "Bytespider", "Amazonbot", "Applebot-Extended", "FacebookBot", "meta-externalagent", "cohere-ai",
  "Diffbot", "ImagesiftBot", "Omgilibot", "Timpibot", "YouBot", "AI2Bot", "Scrapy", "PetalBot", "DataForSeoBot", "SemrushBot", "AhrefsBot", "MJ12bot", "DotBot", "BLEXBot", "img2dataset"
];
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: AI_BOTS, disallow: "/" },
      { userAgent: "*", allow: "/", disallow: ["/api/", "/mon-profil", "/connexion", "/admin", "/statistiques", "/verifier"] }
    ],
    sitemap: `${siteUrl()}/sitemap.xml`
  };
}
