export const SITE_NAME = "Sex-Escorte";
export const siteUrl = () =>
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? "https://" + process.env.VERCEL_PROJECT_PRODUCTION_URL : process.env.VERCEL_URL ? "https://" + process.env.VERCEL_URL : "http://localhost:3000");
export const slug = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
// URL ⇄ genre
export const GPATH: Record<string, string> = { fille: "filles", homme: "hommes", trans: "trans", livecam: "livecam" };
export const GFROM: Record<string, string> = { filles: "fille", hommes: "homme", trans: "trans", livecam: "livecam" };
export const GTITLE: Record<string, string> = { fille: "Filles", homme: "Hommes", trans: "Trans", livecam: "Livecam" };
/** Nombre minimum de profils pour qu'une page ville (ou genre × ville) soit indexée et listée dans le sitemap : en dessous, elle est trop maigre pour Google. */
export const MIN_INDEX = 2;
/** Profils de démonstration créés par les scripts de test (identifiants 00000000-0000-4000-8000-…) : jamais dans le sitemap. */
export const isDemoId = (id: string) => id.startsWith("00000000-0000-4000-8000-");
