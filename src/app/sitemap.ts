import type { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";
import { GPATH, siteUrl, slug } from "@/lib/site";
import { profilePath } from "@/lib/profilUrl";
import { GUIDES } from "@/lib/guides";

export const dynamic = "force-dynamic";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
  const { data } = await sb.from("profiles").select("id,name,vip,city,more,genre,created_at,friendly_url,url_slug,specialties").eq("paused", false).limit(5000);
  const ps = (data || []) as { id: string; name: string; vip: boolean; city: string; more: string[]; genre: string; created_at: string; friendly_url?: boolean; url_slug?: string | null }[];
  const cities = new Set<string>(); const gc = new Set<string>();
  ps.filter((p) => p.genre !== "livecam").forEach((p) => [p.city, ...(p.more || [])].filter(Boolean).forEach((c) => { cities.add(slug(c)); gc.add(`${GPATH[p.genre]}/${slug(c)}`); }));
  const now = new Date();
  const sp = new Map<string, number>();
  ps.filter((p) => p.genre !== "livecam").forEach((p) => [p.city, ...(p.more || [])].filter(Boolean).forEach((c) => new Set((p as unknown as { specialties?: string[] }).specialties?.map((t) => slug(t)).filter(Boolean)).forEach((t) => { const k = `${slug(c)}/${t}`; sp.set(k, (sp.get(k) || 0) + 1); })));
  return [
    { url: base, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${base}/contact`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/guides`, changeFrequency: "weekly" as const, priority: 0.7 },
    ...GUIDES.map((g) => ({ url: `${base}/guides/${g.slug}`, lastModified: new Date(g.date), changeFrequency: "monthly" as const, priority: 0.6 })),
    ...["mentions-legales", "cgu", "confidentialite", "rejoindre"].map((x) => ({ url: `${base}/${x}`, changeFrequency: "yearly" as const, priority: 0.2 })),
    ...Object.values(GPATH).map((g) => ({ url: `${base}/genre/${g}`, lastModified: now, changeFrequency: "daily" as const, priority: 0.8 })),
    ...[...cities].map((c) => ({ url: `${base}/ville/${c}`, lastModified: now, changeFrequency: "daily" as const, priority: 0.8 })),
    ...[...gc].map((x) => ({ url: `${base}/genre/${x}`, lastModified: now, changeFrequency: "daily" as const, priority: 0.6 })),
    ...[...sp.keys()].slice(0, 3000).map((k) => ({ url: `${base}/ville/${k}`, lastModified: now, changeFrequency: "weekly" as const, priority: 0.5 })),
    ...ps.map((p) => ({ url: `${base}${profilePath(p)}`, lastModified: new Date(p.created_at), changeFrequency: "weekly" as const, priority: 0.7 }))
  ];
}
