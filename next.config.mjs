const host = process.env.NEXT_PUBLIC_SUPABASE_URL ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname : "localhost";
export default {
  images: { remotePatterns: [{ protocol: "https", hostname: host }] },
  /* Refus de l'entraînement d'IA sur les images et textes (les moteurs de recherche ne sont pas touchés). */
  async headers() {
    return [{ source: "/:path*", headers: [{ key: "X-Robots-Tag", value: "noai, noimageai" }] }];
  },
  experimental: { serverActions: { bodySizeLimit: "10mb" } }
};
