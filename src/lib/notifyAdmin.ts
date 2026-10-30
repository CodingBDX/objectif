/** Prévient l'admin par e-mail (sans bloquer l'utilisateur, sans jamais échouer). */
export function notifyAdmin(kind: "signalement" | "message" | "verification" | "association" | "paiement") {
  try { fetch("/api/alerte-admin", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ kind }), keepalive: true }).catch(() => {}); } catch {}
}
