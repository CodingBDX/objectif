export type Busy = { from: string; to: string };
export type Lodging = {
  profile_id: string; title: string; description: string; city: string; area: string | null; lat: number | null; lon: number | null;
  photos: string[]; price_day: number | null; price_week: number | null; price_month: number | null; busy: Busy[]; status: "pending" | "approved" | "rejected";
};
/** Une annonce n’est visible que si sa propriétaire est VIP, vérifiée et pas en pause (même règle partout). */
export const ownerVisible = (o: { vip?: boolean | null; verified?: boolean | null; paused?: boolean | null } | null | undefined) => !!(o && o.vip && o.verified && !o.paused);
export const busyList = (l: { busy?: Busy[] | null }) => (Array.isArray(l.busy) ? l.busy : []).filter((b) => b && /^\d{4}-\d{2}-\d{2}$/.test(b.from) && /^\d{4}-\d{2}-\d{2}$/.test(b.to || b.from));
export const isBusy = (l: { busy?: Busy[] | null }, iso: string) => busyList(l).some((b) => iso >= b.from && iso <= (b.to || b.from));
export const WARNING = "Les propriétaires de logements sont des profils VIP et vérifiés par Sex-Escorte. Ce qui se passe ensuite (visite, prix, paiement, conditions) ne regarde que les personnes concernées : Sex-Escorte n’intervient pas dans la location et ne perçoit aucune commission. Reste prudent(e) : ne verse jamais d’acompte avant d’avoir vu le logement.";
