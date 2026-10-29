// Envoie TOUTES les adresses du plan du site à IndexNow. Réservé à l'admin connecté : ouvre /api/indexnow dans ton navigateur.
import { supabaseServer } from "@/lib/supabase/server";
import { pingIndexNow } from "@/lib/indexnow";
import sitemap from "@/app/sitemap";

export const dynamic = "force-dynamic";
export async function GET() {
  const sb = supabaseServer(); const { data: { user } } = await sb.auth.getUser();
  const isAdmin = user ? !!(await sb.from("admins").select("id").eq("id", user.id).maybeSingle()).data : false;
  if (!isAdmin) return new Response("Réservé à l’admin", { status: 403 });
  if (!process.env.INDEXNOW_KEY) return Response.json({ ok: false, erreur: "Variable INDEXNOW_KEY absente sur Vercel" }, { status: 400 });
  const urls = (await sitemap()).map((e) => e.url);
  const ok = await pingIndexNow(urls);
  return Response.json({ ok, envoyees: urls.length });
}
