// Sauvegarde : photos du bucket "media" + export JSON des tables -> un stockage compatible S3 (Backblaze B2, Cloudflare R2…).
// Incrémental : une photo déjà sauvegardée n'est pas recopiée. Le bucket "verif" (pièces d'identité) n'est JAMAIS copié.
import { S3Client, PutObjectCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";

const { SUPABASE_URL, SUPABASE_SERVICE_KEY, S3_ENDPOINT, S3_REGION, S3_KEY_ID, S3_SECRET, S3_BUCKET } = process.env;
for (const k of ["SUPABASE_URL", "SUPABASE_SERVICE_KEY", "S3_ENDPOINT", "S3_KEY_ID", "S3_SECRET", "S3_BUCKET"]) if (!process.env[k]) { console.error("Secret manquant :", k); process.exit(1); }

const s3 = new S3Client({ region: S3_REGION || "auto", endpoint: S3_ENDPOINT.startsWith("http") ? S3_ENDPOINT : "https://" + S3_ENDPOINT, credentials: { accessKeyId: S3_KEY_ID, secretAccessKey: S3_SECRET } });
const H = { apikey: SUPABASE_SERVICE_KEY, Authorization: `Bearer ${SUPABASE_SERVICE_KEY}` };
const TABLES = ["profiles", "media", "comments", "favorites", "lodgings", "associations", "members", "specialties", "reports", "client_reports", "messages", "admins", "profile_stats", "vip_until"];

// 1) liste des photos déjà sauvegardées
const have = new Set(); let tok;
do { const r = await s3.send(new ListObjectsV2Command({ Bucket: S3_BUCKET, Prefix: "media/", ContinuationToken: tok })); (r.Contents || []).forEach((o) => have.add(o.Key)); tok = r.NextContinuationToken; } while (tok);

// 2) liste récursive du bucket media
async function list(prefix = "") {
  const out = []; let offset = 0;
  for (;;) {
    const r = await fetch(`${SUPABASE_URL}/storage/v1/object/list/media`, { method: "POST", headers: { ...H, "content-type": "application/json" }, body: JSON.stringify({ prefix, limit: 1000, offset }) });
    if (!r.ok) throw new Error("liste media " + r.status);
    const a = await r.json(); if (!a.length) break;
    for (const f of a) f.id ? out.push(prefix + f.name) : out.push(...(await list(prefix + f.name + "/")));
    if (a.length < 1000) break; offset += 1000;
  }
  return out;
}
const files = await list(); let nw = 0, fail = 0;
for (const f of files) {
  const key = "media/" + f; if (have.has(key)) continue;
  try {
    const r = await fetch(`${SUPABASE_URL}/storage/v1/object/media/${encodeURI(f)}`, { headers: H });
    if (!r.ok) throw new Error(String(r.status));
    await s3.send(new PutObjectCommand({ Bucket: S3_BUCKET, Key: key, Body: Buffer.from(await r.arrayBuffer()), ContentType: r.headers.get("content-type") || undefined })); nw++;
  } catch (e) { fail++; console.error("échec", f, e.message); }
}
console.log(`Photos : ${files.length} au total, ${nw} nouvelles, ${fail} échecs`);

// 3) export JSON des tables (daté, on garde les anciens)
const day = new Date().toISOString().slice(0, 10);
for (const t of TABLES) {
  const rows = []; let from = 0;
  for (;;) {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/${t}?select=*`, { headers: { ...H, Range: `${from}-${from + 999}` } });
    if (!r.ok) { console.error("table ignorée", t, r.status); break; }
    const a = await r.json(); rows.push(...a); if (a.length < 1000) break; from += 1000;
  }
  await s3.send(new PutObjectCommand({ Bucket: S3_BUCKET, Key: `db/${day}/${t}.json`, Body: JSON.stringify(rows), ContentType: "application/json" }));
  console.log("table", t, rows.length);
}
if (fail) process.exit(1);
