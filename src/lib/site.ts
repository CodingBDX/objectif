export const SITE_NAME = "HeyPapi";
export const siteUrl = () =>
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? "https://" + process.env.VERCEL_PROJECT_PRODUCTION_URL : process.env.VERCEL_URL ? "https://" + process.env.VERCEL_URL : "http://localhost:3000");
export const slug = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
// URL ⇄ genre
export const GPATH: Record<string, string> = { fille: "filles", homme: "hommes", trans: "trans", livecam: "livecam" };
export const GFROM: Record<string, string> = { filles: "fille", hommes: "homme", trans: "trans", livecam: "livecam" };
export const GTITLE: Record<string, string> = { fille: "Filles", homme: "Hommes", trans: "Trans", livecam: "Livecam" };
