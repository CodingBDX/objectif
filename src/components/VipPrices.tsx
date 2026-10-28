"use client";
import { useT } from "@/lib/i18n";

export const VIP_PLANS: [string, number][] = [["2 jours", 20], ["5 jours", 35], ["1 mois", 150]];

export default function VipPrices({ pay = false }: { pay?: boolean }) {
  const { tr } = useT();
  return (
    <div className="vipp">
      <ul aria-label={tr("Tarifs VIP")}>{VIP_PLANS.map(([d, p]) => <li key={d}><span>{tr(d)}</span><b>{p} €</b></li>)}</ul>
      {pay && <p className="note">{tr("Paiement par Wero ou PayPal. Ton VIP est activé à la main dès que ton paiement est reçu. Le décompte s’arrête quand ton profil est en pause.")}</p>}
    </div>
  );
}
