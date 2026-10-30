"use client";
import { useEffect, useState } from "react";

export type VipPlan = { id: string; label: string; days: number; price: number };
/** Tarifs par défaut (utilisés tant que la table vip_plans n'existe pas ou n'est pas lue) ; l'admin les modifie dans « Paiements VIP ». */
export const DEFAULT_PLANS: VipPlan[] = [{ id: "2j", label: "2 jours", days: 2, price: 20 }, { id: "5j", label: "5 jours", days: 5, price: 35 }, { id: "1m", label: "1 mois", days: 30, price: 150 }];
let cache: Promise<VipPlan[]> | null = null;
export const loadPlans = (force = false): Promise<VipPlan[]> => {
  if (force) cache = null;
  if (!cache) cache = (async () => { try { const { supabaseBrowser } = await import("./supabase/client"); const { data, error } = await supabaseBrowser().from("vip_plans").select("id,label,days,price").eq("active", true).order("position").order("price"); return !error && data && data.length ? (data as VipPlan[]) : DEFAULT_PLANS; } catch { return DEFAULT_PLANS; } })();
  return cache;
};
export function useVipPlans() {
  const [plans, set] = useState<VipPlan[]>(DEFAULT_PLANS);
  useEffect(() => { let on = true; loadPlans().then((p) => { if (on) set(p); }); return () => { on = false; }; }, []);
  return plans;
}
