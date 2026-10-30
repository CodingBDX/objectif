"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase/client";
import { useT } from "@/lib/i18n";
import Ic from "@/components/Ic";
import LodgingSearch, { LItem } from "@/components/LodgingSearch";

/** Encart « Logements » de Mon espace (sous les statistiques) : recherche par ville + résultats en bandeau, comme « Mis en avant ». Réservé aux profils VIP + vérifiés. */
export default function LodgingFinder() {
  const { tr } = useT(); const [ready, setReady] = useState(false); const [ok, setOk] = useState(false); const [items, setItems] = useState<LItem[]>([]);
  useEffect(() => { (async () => {
    const sb = supabaseBrowser(); const { data: { user } } = await sb.auth.getUser();
    if (!user) { setReady(true); return; }
    const { data: me } = await sb.from("profiles").select("vip,verified").eq("id", user.id).maybeSingle();
    const allowed = !!(me?.vip && me?.verified); setOk(allowed);
    if (allowed) {
      const { data } = await sb.from("lodgings").select("profile_id,title,city,area,lat,lon,photos,price_day,price_week,price_month").eq("status", "approved").order("updated_at", { ascending: false }).limit(300);
      const ids = (data || []).map((l: any) => l.profile_id);
      const { data: ow } = ids.length ? await sb.from("profiles").select("id,name,vip,verified,paused").in("id", ids) : { data: [] as any[] };
      const nm = new Map((ow || []).filter((o: any) => o.vip && o.verified && !o.paused).map((o: any) => [o.id, o.name as string]));
      setItems((data || []).filter((l: any) => nm.has(l.profile_id)).map((l: any) => ({ id: l.profile_id, title: l.title, city: l.city, area: l.area, lat: l.lat, lon: l.lon, photo: l.photos?.[0] || "", day: l.price_day, week: l.price_week, month: l.price_month, owner: nm.get(l.profile_id) as string })));
    }
    setReady(true);
  })(); /* eslint-disable-next-line */ }, []);
  if (!ready || !ok) return null;
  return (
    <details className="dcard actbox" id="logements">
      <summary><Ic n="star" s={20} />{tr("🏠 Logements")}<small>{tr("Chercher un logement · Mon logement")}</small></summary>
      <div style={{ display: "grid", gap: 12, padding: "16px 18px" }}>
        <LodgingSearch items={items} strip />
        <div className="acts"><Link className="btn ghost" href="/mon-logement">{tr("Mon logement")}</Link><Link className="btn ghost" href="/logements">{tr("Voir tous les logements")}</Link></div>
      </div>
    </details>
  );
}
