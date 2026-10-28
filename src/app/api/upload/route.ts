import { NextResponse } from "next/server";
import sharp from "sharp";
import { randomUUID } from "crypto";
import { supabaseServer } from "@/lib/supabase/server";

export const runtime = "nodejs";
const SITE = "Sex-Escorte";
const esc = (s: string) => s.replace(/[<>&"']/g, "");

export async function POST(req: Request) {
  const sb = supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non connecté" }, { status: 401 });
  const file = (await req.formData()).get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "Fichier manquant" }, { status: 400 });
  if (file.size > 20 * 1024 * 1024) return NextResponse.json({ error: "20 Mo maximum" }, { status: 413 });
  const buf = Buffer.from(await file.arrayBuffer());
  let body: Buffer, ext: string, type: string, thumb: Buffer | null = null;

  if (file.type.startsWith("image/")) {
    // Redimensionne, supprime les métadonnées (EXIF/GPS) et incruste le filigrane au centre
    const base = await sharp(buf).rotate().resize({ width: 1600, height: 2000, fit: "inside", withoutEnlargement: true }).toBuffer({ resolveWithObject: true });
    const { width = 1000, height = 1000 } = base.info;
    const fs = Math.max(24, Math.round(width / 14));
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" font-family="Arial,Helvetica,sans-serif" font-weight="700" font-size="${fs}" letter-spacing="${Math.round(fs / 8)}" fill="rgba(255,255,255,0.55)" stroke="rgba(0,0,0,0.35)" stroke-width="${Math.max(1, fs / 24)}">© ${esc(SITE).toUpperCase()}</text></svg>`;
    body = await sharp(base.data).composite([{ input: Buffer.from(svg) }]).webp({ quality: 80 }).toBuffer();
    thumb = await sharp(body).resize({ width: 640, height: 800, fit: "inside", withoutEnlargement: true }).webp({ quality: 72 }).toBuffer(); // miniature pour les cartes
    ext = "webp"; type = "image/webp";
  } else if (["video/mp4", "video/webm", "video/quicktime"].includes(file.type)) {
    body = buf; ext = file.type === "video/webm" ? "webm" : file.type === "video/mp4" ? "mp4" : "mov"; type = file.type;
  } else return NextResponse.json({ error: "Format non accepté" }, { status: 415 });

  const id = randomUUID(); const path = `${user.id}/${id}.${ext}`;
  const { error } = await sb.storage.from("media").upload(path, body, { contentType: type });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (thumb) await sb.storage.from("media").upload(`${user.id}/${id}-t.webp`, thumb, { contentType: "image/webp" });
  return NextResponse.json({ url: sb.storage.from("media").getPublicUrl(path).data.publicUrl });
}
