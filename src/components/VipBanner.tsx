"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useT } from "@/lib/i18n";
import { VIP_PLANS } from "@/components/VipPrices";

/** Bandeau (même style que « annonce en pause ») qui propose le VIP aux profils standard. Peut être fermé pour la session. */
export default function VipBanner({ paused }: { paused: boolean }) {
  const { tr } = useT(); const [hide, setHide] = useState(true);
  useEffect(() => { try { setHide(!!sessionStorage.getItem("hp_vipb")); } catch { setHide(false); } }, []);
  if (hide || paused) return null;
  const close = () => { setHide(true); try { sessionStorage.setItem("hp_vipb", "1"); } catch {} };
  return (
    <div className="pbanner" role="status"><span>👑 {tr("Passe en VIP : tarifs, réseaux sociaux, 20 photos et plus de visibilité.")} {VIP_PLANS.map(([d, p]) => `${tr(d)} ${p} €`).join(" · ")}</span>
      <Link href="/contact?s=vip">{tr("Devenir VIP")}</Link>
      <button type="button" onClick={close} aria-label={tr("Fermer")}>✕</button></div>
  );
}
