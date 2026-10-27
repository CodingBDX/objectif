import { supabaseServer } from "./supabase/server";
import { ASSO_COLS, type Asso } from "./public";

/** Les associations ne sont visibles que des profils escortes connectés (et des admins). Sinon `allowed` est faux et la liste vide. */
export async function assosForViewer(): Promise<{ allowed: boolean; list: Asso[] }> {
  const sb = supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return { allowed: false, list: [] };
  const [e, a] = await Promise.all([sb.rpc("is_escort"), sb.rpc("is_admin")]);
  if (!e.data && !a.data) return { allowed: false, list: [] };
  const { data } = await sb.from("associations").select(ASSO_COLS).eq("status", "approved").order("featured", { ascending: false }).order("name").limit(1000);
  return { allowed: true, list: (data || []) as Asso[] };
}
