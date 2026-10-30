const host = process.env.NEXT_PUBLIC_SUPABASE_URL ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname : "localhost";
export default {
  images: { remotePatterns: [{ protocol: "https", hostname: host }] },
  /* Refus de l'entraînement d'IA sur les images et textes (les moteurs de recherche ne sont pas touchés). */
  async headers() {
    return [{ source: "/:path*", headers: [
      { key: "X-Robots-Tag", value: "noai, noimageai" }, { key: "Rating", value: "RTA-5042-1996-1400-1577-RTA" },
      /* Sécurité : pas de cadre sur un autre site, pas de détection de type, référent limité, caméra/micro/position coupés, HTTPS forcé. */
      { key: "X-Frame-Options", value: "SAMEORIGIN" }, { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), payment=(), usb=(), geolocation=(self)" },
      { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
      { key: "Content-Security-Policy", value: "frame-ancestors 'self'; base-uri 'self'; object-src 'none'; form-action 'self'" }
    ] }, {
      /* Photos et vidéos des profils : jamais dans Google Images ni réutilisées par une IA. */
      source: "/media/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, noimageindex, noai, noimageai" }]
    }];
  },
  /* IndexNow : le fichier de preuve /<clé>.txt est servi par une route (la clé est dans la variable INDEXNOW_KEY). */
  async rewrites() {
    return [
      { source: "/:k([a-f0-9]{16,64})\\.txt", destination: "/api/indexnow-key?k=:k" }
    ];
  },
  experimental: { serverActions: { bodySizeLimit: "10mb" } }
};
