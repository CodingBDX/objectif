import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";
import { GENRES, Profile } from "@/lib/types";
import Card from "@/components/Card";

export const dynamic = "force-dynamic";
const PAGE = 10;

export default async function Home({ searchParams }: { searchParams: { genre?: string; ville?: string; n?: string } }) {
  const sb = supabaseServer();
  const n = Math.min(Math.max(parseInt(searchParams.n || "") || PAGE, PAGE), 200);
  let q = sb.from("profiles").select("*").eq("paused", false).order("vip", { ascending: false }).order("created_at", { ascending: false }).limit(n + 1);
  if (searchParams.genre) q = q.eq("genre", searchParams.genre);
  if (searchParams.ville) q = q.ilike("city", searchParams.ville);
  const { data } = await q;
  const rows = (data || []) as Profile[];
  const more = rows.length > n;
  const { data: cities } = await sb.from("profiles").select("city").eq("paused", false);
  const list = Array.from(new Set((cities || []).map((c) => c.city))).sort();
  const href = (o: Record<string, string | undefined>) => {
    const u = new URLSearchParams(); const m = { ...searchParams, n: undefined, ...o };
    Object.entries(m).forEach(([k, v]) => v && u.set(k, v)); const s = u.toString(); return s ? `/?${s}` : "/";
  };
  return (<>
    <h1>Annuaire des créateurs</h1>
    <div className="chips">
      <Link href={href({ genre: undefined })} className={`chip ${!searchParams.genre ? "on" : ""}`}>Tous</Link>
      {GENRES.map((g) => <Link key={g.id} href={href({ genre: g.id })} className={`chip ${searchParams.genre === g.id ? "on" : ""}`}>{g.icon} {g.label}</Link>)}
    </div>
    <div className="chips">
      <Link href={href({ ville: undefined })} className={`chip ${!searchParams.ville ? "on" : ""}`}>📍 Toutes les villes</Link>
      {list.map((c) => <Link key={c} href={href({ ville: c })} className={`chip ${searchParams.ville?.toLowerCase() === c.toLowerCase() ? "on" : ""}`}>{c}</Link>)}
    </div>
    {rows.length === 0 ? <p className="mut">Aucun profil pour le moment.</p> :
      <div className="grid">{rows.slice(0, n).map((p) => <Card key={p.id} p={p} />)}</div>}
    {more && <p style={{ textAlign: "center", marginTop: 24 }}><Link className="btn" href={href({ n: String(n + PAGE) })} scroll={false}>Voir plus de profils</Link></p>}
  </>);
}
