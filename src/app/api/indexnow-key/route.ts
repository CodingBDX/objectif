// Fichier de preuve demandé par IndexNow : /<clé>.txt (redirigé ici par next.config.mjs), uniquement si la clé correspond à INDEXNOW_KEY.
export const dynamic = "force-dynamic";
export function GET(req: Request) {
  const key = process.env.INDEXNOW_KEY; const k = new URL(req.url).searchParams.get("k");
  if (!key || k !== key) return new Response("Not found", { status: 404 });
  return new Response(key, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
