import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const maxDuration = 30;

/** Après validation d'un logement par l'admin : prévient par e-mail les profils qui ont activé une alerte pour cette ville. */
export async function POST(req: Request) {
  const sb = supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non connecté" }, { status: 401 });
  const { data: adm } = await sb.rpc("is_admin");
  if (!adm) return NextResponse.json({ error: "Accès réservé" }, { status: 403 });
  const key = process.env.RESEND_API_KEY;
  if (!key) return NextResponse.json({ error: "RESEND_API_KEY manquante sur Vercel", sent: 0 }, { status: 501 });
  const { id } = (await req.json().catch(() => ({}))) as { id?: string };
  if (!id) return NextResponse.json({ error: "Logement manquant" }, { status: 400 });

  const { data, error } = await sb.rpc("lodging_alert_recipients", { p_lodging: id });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const rows = (data || []) as { email: string; city: string }[];
  if (!rows.length) return NextResponse.json({ sent: 0 });

  const site = (process.env.NEXT_PUBLIC_SITE_URL || "https://sex-escorte.com").replace(/\/$/, "");
  const esc = (s: string) => s.replace(/[<>&"']/g, "");
  const mails = rows.map((r) => {
    const city = esc(r.city); const url = `${site}/logements?ville=${encodeURIComponent(r.city)}`;
    return {
      from: "Sex-Escorte <noreply@sex-escorte.com>", to: [r.email], subject: `Un logement est disponible à ${city}`,
      html: `<div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;padding:24px;color:#5c1a43;background:#fff4fa;border-radius:18px"><h2 style="margin:0 0 8px;color:#d63384">Un logement est disponible à ${city} 🏠</h2><p style="line-height:1.6">Tu avais activé une alerte pour cette ville. Une nouvelle annonce vient d’être validée.</p><p><a href="${url}" style="display:inline-block;background:#d63384;color:#fff;text-decoration:none;padding:12px 26px;border-radius:999px;font-weight:700">Voir les logements</a></p><p style="font-size:12px;color:#94607f;line-height:1.5">Tu reçois ce message car tu as activé une alerte. Pour l’arrêter, décoche-la sur la page Logements.</p></div>`,
    };
  });
  let sent = 0;
  for (let i = 0; i < mails.length; i += 100) {
    const r = await fetch("https://api.resend.com/emails/batch", { method: "POST", headers: { "content-type": "application/json", authorization: `Bearer ${key}` }, body: JSON.stringify(mails.slice(i, i + 100)) });
    if (r.ok) sent += Math.min(100, mails.length - i);
  }
  return NextResponse.json({ sent, total: mails.length });
}
