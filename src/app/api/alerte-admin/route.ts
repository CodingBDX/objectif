import { NextResponse } from "next/server";

export const runtime = "nodejs";

/** Prévient l'admin par e-mail (Resend) quand un signalement, un message, une demande de vérification ou une fiche association arrive.
 *  Le message ne contient AUCUN texte saisi par le visiteur (seulement le type d'événement) et un même type n'envoie qu'1 e-mail / 5 min. */
const KINDS: Record<string, { sujet: string; lien: string; texte: string }> = {
  signalement: { sujet: "🚩 Nouveau signalement", lien: "/admin#reports", texte: "Un profil vient d’être signalé." },
  message: { sujet: "✉️ Nouveau message", lien: "/admin#messages", texte: "Un nouveau message est arrivé par le formulaire de contact." },
  verification: { sujet: "✅ Nouvelle demande de vérification", lien: "/admin#verifs", texte: "Une escorte demande la vérification de son profil." },
  paiement: { sujet: "💳 Paiement VIP à vérifier", lien: "/admin#paiements", texte: "Une escorte indique avoir payé son forfait VIP. Vérifie la réception de l’argent puis valide." },
  association: { sujet: "🤝 Nouvelle fiche association", lien: "/admin#assos", texte: "Une fiche association attend ta validation." },
};
const last = new Map<string, number>();

export async function POST(req: Request) {
  const to = process.env.ADMIN_EMAIL; const key = process.env.RESEND_API_KEY;
  if (!to || !key) return NextResponse.json({ sent: 0, reason: "ADMIN_EMAIL ou RESEND_API_KEY manquante" });
  const { kind } = (await req.json().catch(() => ({}))) as { kind?: string };
  const k = kind && KINDS[kind]; if (!k || !kind) return NextResponse.json({ error: "Type inconnu" }, { status: 400 });
  const now = Date.now(); if (now - (last.get(kind) || 0) < 5 * 60_000) return NextResponse.json({ sent: 0, reason: "déjà prévenu récemment" });
  last.set(kind, now);
  const site = (process.env.NEXT_PUBLIC_SITE_URL || "https://sex-escorte.com").replace(/\/$/, "");
  const r = await fetch("https://api.resend.com/emails", { method: "POST", headers: { "content-type": "application/json", authorization: `Bearer ${key}` }, body: JSON.stringify({
    from: "Sex-Escorte <noreply@sex-escorte.com>", to: [to], subject: k.sujet,
    html: `<div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;padding:24px;color:#5c1a43;background:#fff4fa;border-radius:18px"><h2 style="margin:0 0 8px;color:#d63384">${k.sujet}</h2><p>${k.texte}</p><p><a href="${site}${k.lien}" style="display:inline-block;background:#d63384;color:#fff;padding:10px 20px;border-radius:99px;text-decoration:none;font-weight:bold">Ouvrir l’administration</a></p></div>`
  }) });
  return NextResponse.json({ sent: r.ok ? 1 : 0 });
}
