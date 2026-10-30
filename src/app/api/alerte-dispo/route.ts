import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createHmac } from "crypto";
import { avail, todayP } from "@/lib/avail";
import { profilePath } from "@/lib/profilUrl";
import type { Profile } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Appelé toutes les 15 minutes par GitHub Actions (en-tête x-cron-secret).
 *  Envoie UN e-mail groupé aux visiteurs qui ont activé l'alerte quand un de leurs favoris devient disponible.
 *  Une même alerte n'est jamais renvoyée le même jour ; 6 profils maximum par personne et par jour ; les profils 24h/24 sont ignorés. */
const MAX_PER_DAY = 6;
export const unsubToken = (uid: string) => createHmac("sha256", process.env.CRON_SECRET || "").update("dispo:" + uid).digest("hex").slice(0, 32);

export async function POST(req: Request) {
  const secret = process.env.CRON_SECRET; const url = process.env.NEXT_PUBLIC_SUPABASE_URL; const sk = process.env.SUPABASE_SERVICE_ROLE_KEY; const rk = process.env.RESEND_API_KEY;
  if (!secret || req.headers.get("x-cron-secret") !== secret) return NextResponse.json({ error: "interdit" }, { status: 401 });
  if (!url || !sk || !rk) return NextResponse.json({ sent: 0, reason: "SUPABASE_SERVICE_ROLE_KEY ou RESEND_API_KEY manquante" });
  const sb = createClient(url, sk, { auth: { persistSession: false } });
  const site = (process.env.NEXT_PUBLIC_SITE_URL || "https://sex-escorte.com").replace(/\/$/, "");

  const { data: al } = await sb.from("fav_alerts").select("user_id").eq("enabled", true).limit(5000);
  const users = (al || []).map((x: { user_id: string }) => x.user_id); if (!users.length) return NextResponse.json({ sent: 0 });
  const { data: fv } = await sb.from("favorites").select("user_id,profile_id").in("user_id", users).limit(50000);
  const byUser = new Map<string, string[]>(); (fv || []).forEach((f: { user_id: string; profile_id: string }) => byUser.set(f.user_id, [...(byUser.get(f.user_id) || []), f.profile_id]));
  const ids = Array.from(new Set((fv || []).map((f: { profile_id: string }) => f.profile_id))); if (!ids.length) return NextResponse.json({ sent: 0 });
  const { data: ps } = await sb.from("profiles").select("id,name,city,genre,vip,friendly_url,url_slug,hours,h24,paused").in("id", ids).eq("paused", false);
  const on = new Map<string, Profile>(); (ps || []).forEach((p) => { const a = avail(p as unknown as Profile); if (a?.on && !a.h24) on.set(p.id as string, p as unknown as Profile); });
  if (!on.size) return NextResponse.json({ sent: 0 });
  const day = todayP();
  const { data: sd } = await sb.from("dispo_sent").select("user_id,profile_id").eq("day", day).in("user_id", users).limit(50000);
  const done = new Map<string, Set<string>>(); (sd || []).forEach((s: { user_id: string; profile_id: string }) => { if (!done.has(s.user_id)) done.set(s.user_id, new Set()); done.get(s.user_id)!.add(s.profile_id); });

  let sent = 0;
  for (const uid of users) {
    const seen = done.get(uid) || new Set<string>(); const room = MAX_PER_DAY - seen.size; if (room <= 0) continue;
    const fresh = (byUser.get(uid) || []).filter((id) => on.has(id) && !seen.has(id)).slice(0, room); if (!fresh.length) continue;
    const email = (await sb.auth.admin.getUserById(uid)).data.user?.email; if (!email) continue;
    const stop = `${site}/api/alerte-dispo/stop?u=${uid}&t=${unsubToken(uid)}`;
    const li = fresh.map((id) => { const p = on.get(id)!; return `<li style="margin:6px 0"><a href="${site}${profilePath(p)}" style="color:#d63384;font-weight:700;text-decoration:none">${String(p.name).replace(/[<>&"]/g, "")}</a> · ${String(p.city).replace(/[<>&"]/g, "")}</li>`; }).join("");
    const r = await fetch("https://api.resend.com/emails", { method: "POST", headers: { "content-type": "application/json", authorization: `Bearer ${rk}` }, body: JSON.stringify({
      from: "Sex-Escorte <noreply@sex-escorte.com>", to: [email], subject: "Du nouveau dans tes favoris", headers: { "List-Unsubscribe": `<${stop}>` },
      html: `<div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;padding:24px;color:#5c1a43;background:#fff4fa;border-radius:18px"><h2 style="margin:0 0 8px;color:#d63384">Du nouveau dans tes favoris</h2><p>${fresh.length > 1 ? "Ces favoris sont disponibles" : "Un de tes favoris est disponible"} maintenant :</p><ul style="padding-left:18px">${li}</ul><p style="font-size:12px;color:#94607f;margin-top:20px">Tu reçois ce message car tu as activé les alertes. <a href="${stop}" style="color:#94607f">Me désabonner</a></p></div>`
    }) });
    if (r.ok) { sent++; await sb.from("dispo_sent").upsert(fresh.map((profile_id) => ({ user_id: uid, profile_id, day })), { onConflict: "user_id,profile_id,day", ignoreDuplicates: true }); }
  }
  return NextResponse.json({ sent });
}
