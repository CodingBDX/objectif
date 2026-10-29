"use client";
import { useEffect, useState } from "react";
import { useT } from "@/lib/i18n";
import { sbLazy } from "@/lib/supabase/lazy";

type Req = { status: "pending" | "approved" | "rejected"; note: string } | null;
const today = () => new Date().toLocaleDateString("fr-FR");

/** Demande de vérification : photo de soi avec un papier "sex-escorte.com" + la date du jour. Visible seulement par l'admin, supprimée après décision. */
export default function VerifRequest({ uid, verified, embedded }: { uid: string; verified: boolean; embedded?: boolean }) {
  const { tr } = useT();
  const [req, setReq] = useState<Req>(null); const [busy, setBusy] = useState(false); const [msg, setMsg] = useState("");
  useEffect(() => { (async () => { const sb = await sbLazy(); const { data } = await sb.from("verif_requests").select("status,note").eq("profile_id", uid).maybeSingle(); setReq((data as Req) || null); })(); }, [uid]);
  async function send(f: File | undefined) {
    if (!f) return; setMsg("");
    if (!/^image\/(jpeg|png|webp)$/.test(f.type)) { setMsg(tr("Choisis une photo (JPG, PNG ou WebP).")); return; }
    if (f.size > 8 * 1024 * 1024) { setMsg(tr("8 Mo maximum.")); return; }
    if (f.lastModified && Date.now() - f.lastModified > 48 * 36e5) { setMsg(tr("Cette photo date de plus de 2 jours. Prends-en une nouvelle, aujourd’hui, avec le papier daté.")); return; }
    try { const bmp = await createImageBitmap(f); const ok = Math.min(bmp.width, bmp.height) >= 600; bmp.close(); if (!ok) { setMsg(tr("Photo trop petite : prends-la en meilleure qualité (600 px minimum).")); return; } } catch { setMsg(tr("Image illisible, essaie une autre photo.")); return; }
    setBusy(true);
    const sb = await sbLazy(); const path = `${uid}/${Date.now()}.${f.type === "image/png" ? "png" : f.type === "image/webp" ? "webp" : "jpg"}`;
    const up = await sb.storage.from("verif").upload(path, f, { contentType: f.type });
    if (up.error) { setBusy(false); setMsg(up.error.message); return; }
    const { error } = await sb.rpc("submit_verif", { p_path: path });
    setBusy(false); if (error) { setMsg(error.message); return; }
    setReq({ status: "pending", note: "" });
  }
  if (verified) return <div className="subcard"><h4 className="subh">{tr("✔ Profil vérifié")}</h4><p className="note" style={{ margin: 0 }}>{tr("Ton profil est vérifié : le badge est visible sur ta fiche.")}</p></div>;
  return (
    <div className="subcard" id="verif"><h4 className="subh">{tr("Faire vérifier mon profil")}</h4>
      {req?.status === "pending" ? <p className="note" style={{ margin: 0 }}>{tr("⏳ Ta photo est en cours de vérification. Tu seras vérifiée dès qu’elle est validée.")}</p> : <>
        <p className="note" style={{ margin: "0 0 8px" }}>{tr("Le badge vérifié rassure les visiteurs. Prends une photo de toi en tenant un papier avec écrit à la main :")}</p>
        <p style={{ margin: "0 0 8px", font: "700 17px var(--fd)" }}>sex-escorte.com · {today()}</p>
        <p className="note" style={{ margin: "0 0 10px" }}>{tr("Ton visage et le papier doivent être bien visibles. Seule l’équipe voit cette photo, elle n’est jamais publiée et elle est supprimée dès qu’on a répondu.")}</p>
        {req?.status === "rejected" && <p role="alert" style={{ color: "var(--btn)", fontWeight: 700, margin: "0 0 8px" }}>{tr("Ta dernière demande a été refusée.")}{req.note ? " " + req.note : ""} {tr("Tu peux en envoyer une nouvelle.")}</p>}
        <label className="btn ghost" style={{ cursor: "pointer", justifySelf: "start" }}>{busy ? tr("Envoi en cours…") : tr("📷 Envoyer ma photo")}<input type="file" accept="image/jpeg,image/png,image/webp" hidden disabled={busy} onChange={(e) => { send(e.target.files?.[0]); e.target.value = ""; }} /></label>
        {msg && <p role="alert" style={{ color: "var(--btn)", fontWeight: 700, margin: "8px 0 0" }}>{msg}</p>}
      </>}
    </div>
  );
}
