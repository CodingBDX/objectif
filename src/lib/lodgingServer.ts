import { supabaseServer } from "./supabase/server";

/** Logements visibles par tout le monde : approuvés ET propriétaire VIP, vérifié et non en pause.
 *  Filtré ici en plus des règles Supabase (un compte admin ou propriétaire voit tout via RLS). */
export async function publicLodgings(cols: string, withGeo = false) {
  const sb = supabaseServer();
  let q = sb.from("lodgings").select(cols).eq("status", "approved");
  if (withGeo) q = q.not("lat", "is", null);
  const { data } = await q.order("updated_at", { ascending: false }).limit(300);
  const rows = ((data || []) as unknown as any[]);
  const ids = rows.map((l) => l.profile_id);
  const { data: owners } = ids.length ? await sb.from("profiles").select("id,name,vip,verified,paused").in("id", ids) : { data: [] as any[] };
  const ok = new Map((owners || []).filter((o: any) => o.vip && o.verified && !o.paused).map((o: any) => [o.id, o.name as string]));
  return rows.filter((l) => ok.has(l.profile_id)).map((l) => ({ ...l, owner: ok.get(l.profile_id) as string }));
}

/** Seuls les profils VIP ET vérifiés (et les admins) peuvent voir les logements. */
export async function canSeeLodgings(): Promise<boolean> {
  const sb = supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return false;
  const a = await sb.rpc("is_admin");
  if (a.data) return true;
  const { data: p } = await sb.from("profiles").select("vip,verified").eq("id", user.id).maybeSingle();
  return !!(p && p.vip && p.verified);
}
