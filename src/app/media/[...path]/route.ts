import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/** Photos et vidéos des profils et des logements, servies via sex-escorte.com/media/… (donc derrière Cloudflare et le robots.txt).
 *  Le bucket Supabase « media » peut ainsi être privé : chaque demande reçoit un lien temporaire (1 h) vers le fichier,
 *  et les anciennes adresses publiques ne marchent plus. Les vidéos (jusqu'à 20 Mo) ne passent pas par une fonction Vercel,
 *  limitée à 4,5 Mo par réponse : on redirige donc vers le lien temporaire au lieu de copier le fichier. */

const TTL = 3600; // durée de validité du lien temporaire (secondes)
const cache = new Map<string, { url: string; until: number }>(); // garde le même lien ~50 min : le navigateur réutilise son cache d'image
const SAFE = /^[A-Za-z0-9_-]{1,64}\/[A-Za-z0-9._-]{1,128}$/;

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: { path: string[] } }) {
  const path = (params.path || []).join("/");
  if (!SAFE.test(path) || path.includes("..")) return new NextResponse("Introuvable", { status: 404 });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!; const sk = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const headers = { "Cache-Control": "private, max-age=1800", "X-Robots-Tag": "noindex, noimageindex, noai, noimageai" };

  // Sans clé de service (bucket encore public) : on renvoie vers l'adresse publique, comme avant.
  if (!sk) return NextResponse.redirect(`${url.replace(/\/$/, "")}/storage/v1/object/public/media/${path}`, { status: 302, headers });

  const now = Date.now(); const hit = cache.get(path);
  if (hit && hit.until > now) return NextResponse.redirect(hit.url, { status: 302, headers });

  const sb = createClient(url, sk, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data, error } = await sb.storage.from("media").createSignedUrl(path, TTL);
  if (error || !data?.signedUrl) return new NextResponse("Introuvable", { status: 404, headers: { "X-Robots-Tag": "noindex" } });

  if (cache.size > 5000) cache.clear();
  cache.set(path, { url: data.signedUrl, until: now + (TTL - 600) * 1000 });
  return NextResponse.redirect(data.signedUrl, { status: 302, headers });
}
