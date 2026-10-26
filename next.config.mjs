const host = process.env.NEXT_PUBLIC_SUPABASE_URL ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname : "localhost";
export default {
  images: { remotePatterns: [{ protocol: "https", hostname: host }] },
  experimental: { serverActions: { bodySizeLimit: "10mb" } }
};
