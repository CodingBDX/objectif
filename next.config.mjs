const host = process.env.NEXT_PUBLIC_SUPABASE_URL ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname : "localhost";
export default {
  images: { remotePatterns: [{ protocol: "https", hostname: host }] },
  /* Refus de l'entraînement d'IA sur les images et textes (les moteurs de recherche ne sont pas touchés). */
  async headers() {
    return [{ source: "/:path*", headers: [{ key: "X-Robots-Tag", value: "noai, noimageai" }, { key: "Rating", value: "RTA-5042-1996-1400-1577-RTA" }] }];
  },
  /* IndexNow : le fichier de preuve /<clé>.txt est servi par une route (la clé est dans la variable INDEXNOW_KEY). */
  async rewrites() {
    return [{ source: "/:k([a-f0-9]{16,64})\\.txt", destination: "/api/indexnow-key?k=:k" }];
  },
  experimental: { serverActions: { bodySizeLimit: "10mb" } }
};
