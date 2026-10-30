import { createClient } from "@supabase/supabase-js";
import { createHmac, timingSafeEqual } from "crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Lien de désabonnement présent dans chaque e-mail : désactive l'alerte sans avoir à se connecter. */
const page = (t: string, s = 200) => new Response(`<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width"><meta name="robots" content="noindex"><title>Alertes</title><body style="font-family:Arial,sans-serif;background:#fff4fa;color:#5c1a43;display:grid;place-items:center;min-height:100vh;margin:0"><div style="max-width:420px;padding:28px;text-align:center"><h2 style="color:#d63384">${t}</h2><p><a href="/" style="color:#d63384">Retour au site</a></p></div></body>`, { status: s, headers: { "content-type": "text/html; charset=utf-8" } });

export async function GET(req: Request) {
  const u = new URL(req.url); const uid = u.searchParams.get("u") || ""; const t = u.searchParams.get("t") || "";
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL; const sk = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!/^[0-9a-f-]{36}$/i.test(uid) || !process.env.CRON_SECRET || !url || !sk) return page("Lien invalide", 400);
  const ok = createHmac("sha256", process.env.CRON_SECRET).update("dispo:" + uid).digest("hex").slice(0, 32);
  if (t.length !== ok.length || !timingSafeEqual(Buffer.from(t), Buffer.from(ok))) return page("Lien invalide", 400);
  await createClient(url, sk, { auth: { persistSession: false } }).from("fav_alerts").upsert({ user_id: uid, enabled: false, updated_at: new Date().toISOString() });
  return page("Alertes désactivées");
}
