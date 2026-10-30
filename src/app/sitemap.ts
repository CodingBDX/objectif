import type { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";
import { GPATH, isDemoId, MIN_INDEX, siteUrl, slug } from "@/lib/site";
import { profilePath } from "@/lib/profilUrl";
import { GUIDES } from "@/lib/guides";

type Row = { id: string; name: string; vip: boolean; city: string; more: string[]; genre: string; created_at: string; bumped_at?: string | null; friendly_url?: boolean; url_slug?: string | null };

/** Sitemap volontairement court : seulement les pages qui ont assez de contenu pour être classées.
 *  Les pages ville × spécialité et les villes avec moins de MIN_INDEX profils sont en noindex et n'y figurent pas. */
export const dynamic = "force-dynamic";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
  const { data } = await sb.from("profiles").select("*").eq("paused", false).limit(5000);
  const ps = ((data || []) as Row[]).filter((p) => !isDemoId(p.id));

  /** Vraie date de dernière modification : la plus récente entre création et dernière remontée du profil. */
  const lm = (p: Row) => new Date(Math.max(Date.parse(p.created_at) || 0, Date.parse(p.bumped_at || "") || 0));
  const latest = (l: Row[]) => l.length ? new Date(Math.max(...l.map((p) => lm(p).getTime()))) : undefined;

  const city = new Map<string, Row[]>(); const gcity = new Map<string, Row[]>();
  const push = (m: Map<string, Row[]>, k: string, p: Row) => { const l = m.get(k) || []; if (!l.includes(p)) l.push(p); m.set(k, l); };
  ps.filter((p) => p.genre !== "livecam").forEach((p) => [p.city, ...(p.more || [])].filter(Boolean).forEach((c) => {
    push(city, slug(c), p); push(gcity, `${GPATH[p.genre]}/${slug(c)}`, p);
  }));
  const byGenre = (g: string) => ps.filter((p) => p.genre === g);
  const enough = (m: Map<string, Row[]>) => [...m].filter(([, l]) => l.length >= MIN_INDEX);

  return [
    { url: base, lastModified: latest(ps), priority: 1 },
    { url: `${base}/rejoindre`, priority: 0.8 },
    { url: `${base}/guides`, lastModified: new Date(Math.max(...GUIDES.map((g) => Date.parse(g.date)))), priority: 0.7 },
    ...GUIDES.map((g) => ({ url: `${base}/guides/${g.slug}`, lastModified: new Date(g.date), priority: 0.6 })),
    ...Object.entries(GPATH).filter(([g]) => byGenre(g).length > 0).map(([g, path]) => ({ url: `${base}/genre/${path}`, lastModified: latest(byGenre(g)), priority: 0.8 })),
    ...enough(city).map(([c, l]) => ({ url: `${base}/ville/${c}`, lastModified: latest(l), priority: 0.8 })),
    ...enough(gcity).map(([x, l]) => ({ url: `${base}/genre/${x}`, lastModified: latest(l), priority: 0.6 })),
    ...ps.map((p) => ({ url: `${base}${profilePath(p)}`, lastModified: lm(p), priority: 0.7 })),
    ...["contact", "mentions-legales", "cgu", "confidentialite"].map((x) => ({ url: `${base}/${x}`, priority: 0.2 }))
  ];
}
