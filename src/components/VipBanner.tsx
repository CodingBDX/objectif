"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useT } from "@/lib/i18n";
import { useVipPlans } from "@/lib/vipPlans";

/** Bandeau (même style que « annonce en pause ») qui propose le VIP aux profils standard. Peut être fermé pour la session. */
export default function VipBanner({ paused }: { paused: boolean }) {
  const plans = useVipPlans();
  const { tr } = useT(); const [hide, setHide] = useState(true);
  useEffect(() => { try { setHide(!!sessionStorage.getItem("hp_vipb")); } catch { setHide(false); } }, []);
  if (hide || paused) return null;
  const close = () => { setHide(true); try { sessionStorage.setItem("hp_vipb", "1"); } catch {} };
  return (
    <div className="pbanner" role="status"><span>👑 {tr("Passe devant dans ta ville : en VIP, ton profil s’affiche en tête, montre tes tarifs et peut avoir jusqu’à 20 photos.")}</span>
      <Link href="/contact?s=vip">{tr("Devenir VIP, dès {p} €", { p: plans.length ? Math.min(...plans.map((x) => x.price)) : 20 })}</Link>
      <button type="button" onClick={close} aria-label={tr("Fermer")}>✕</button></div>
  );
}
