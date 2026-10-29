import type { MetadataRoute } from "next";

/** Site installable (écran d'accueil du téléphone) : nom, couleurs du site et icône piment. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Sex-Escorte", short_name: "Sex-Escorte", description: "Annuaire des escortes en France (18+).",
    start_url: "/?source=pwa", scope: "/", display: "standalone", orientation: "portrait",
    background_color: "#ffeef6", theme_color: "#d63384", lang: "fr",
    icons: [
      { src: "/pwa-icon/192", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/pwa-icon/512", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/pwa-icon/512?m=1", sizes: "512x512", type: "image/png", purpose: "maskable" }
    ]
  };
}
