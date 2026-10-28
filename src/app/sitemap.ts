import type { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";
import { GPATH, siteUrl, slug } from "@/lib/site";

export const dynamic = "force-dynamic";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
  const { data } = await sb.from("profiles").select("id,city,more,genre,created_at").eq("paused", false).limit(5000);
  const ps = (data || []) as { id: string; city: string; more: string[]; genre: string; created_at: string }[];
  const cities = new Set<string>(); const gc = new Set<string>();
  ps.filter((p) => p.genre !== "livecam").forEach((p) => [p.city, ...(p.more || [])].filter(Boolean).forEach((c) => { cities.add(slug(c)); gc.add(`${GPATH[p.genre]}/${slug(c)}`); }));
  const now = new Date();
  return [
    { url: base, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${base}/contact`, changeFrequency: "yearly", priority: 0.3 },
    ...["mentions-legales", "cgu", "confidentialite"].map((x) => ({ url: `${base}/${x}`, changeFrequency: "yearly" as const, priority: 0.2 })),
    ...Object.values(GPATH).map((g) => ({ url: `${base}/genre/${g}`, lastModified: now, changeFrequency: "daily" as const, priority: 0.8 })),
    ...[...cities].map((c) => ({ url: `${base}/ville/${c}`, lastModified: now, changeFrequency: "daily" as const, priority: 0.8 })),
    ...[...gc].map((x) => ({ url: `${base}/genre/${x}`, lastModified: now, changeFrequency: "daily" as const, priority: 0.6 })),
    ...ps.map((p) => ({ url: `${base}/profil/${p.id}`, lastModified: new Date(p.created_at), changeFrequency: "weekly" as const, priority: 0.7 }))
  ];
}
