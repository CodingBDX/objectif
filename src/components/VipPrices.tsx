"use client";
import { useT } from "@/lib/i18n";
import { useVipPlans } from "@/lib/vipPlans";


export default function VipPrices({ pay = false }: { pay?: boolean }) {
  const { tr } = useT(); const plans = useVipPlans();
  return (
    <div className="vipp">
      <ul aria-label={tr("Tarifs VIP")}>{plans.map((x) => <li key={x.id}><span>{tr(x.label)}</span><b>{x.price} €</b></li>)}</ul>
      {pay && <p className="note">{tr("Paiement par Wero ou PayPal. Ton VIP est activé à la main dès que ton paiement est reçu. Le décompte s’arrête quand ton profil est en pause.")}</p>}
    </div>
  );
}
