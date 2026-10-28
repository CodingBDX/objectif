import { Profile } from "./types";
export const DAYS = ["lun.","mar.","mer.","jeu.","ven.","sam.","dim."];
export const DAYL = ["Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi","Dimanche"];
export const MS = ["janv.","févr.","mars","avr.","mai","juin","juil.","août","sept.","oct.","nov.","déc."];
const mins = (t: string) => { const [a, b] = String(t).split(":"); return +a * 60 + +b; };
export function nowP() {
  const o: Record<string, string> = {};
  new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Paris", weekday: "short", hour: "2-digit", minute: "2-digit", hour12: false }).formatToParts(new Date()).forEach((x) => (o[x.type] = x.value));
  const d = ({ Mon: 0, Tue: 1, Wed: 2, Thu: 3, Fri: 4, Sat: 5, Sun: 6 } as Record<string, number>)[o.weekday];
  return { d, m: (+o.hour % 24) * 60 + +o.minute };
}
export type Av = { on: boolean; until?: string; h24?: boolean; next?: string | null } | null;
export function avail(p: Profile): Av {
  if (!p.hours || (!p.h24 && !Object.keys(p.hours).length)) return null;
  if (p.h24) return { on: true, until: "24h/24", h24: true };
  const n = nowP(), h = p.hours[n.d];
  if (h && mins(h[0]) <= n.m && n.m < mins(h[1])) return { on: true, until: h[1] };
  for (let i = 0; i <= 7; i++) {
    const d = (n.d + i) % 7, hh = p.hours[d];
    if (!hh) continue;
    if (i === 0 && mins(hh[0]) <= n.m) continue;
    return { on: false, next: (i === 0 ? "aujourd’hui" : i === 1 ? "demain" : DAYS[d]) + " à " + hh[0] };
  }
  return { on: false, next: null };
}
export const todayP = () => new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Paris" }).format(new Date());
export const dShort = (iso: string) => { const [, m, d] = iso.split("-"); return +d + " " + MS[+m - 1]; };
export const tripsOf = (p: Profile) => { const t = todayP(); return (p.trips || []).filter((x) => x && x.city && x.from && (x.to || x.from) >= t).map((x) => ({ ...x, to: x.to || x.from })).sort((a, b) => (a.from < b.from ? -1 : 1)); };

/** Prochaine ouverture : date (AAAA-MM-JJ) et heure, ou null si aucun horaire. */
export function nextOpen(p: Profile): { iso: string; time: string } | null {
  if (!p.hours || p.h24 || !Object.keys(p.hours).length) return null;
  const n = nowP();
  for (let i = 0; i <= 7; i++) {
    const hh = p.hours[(n.d + i) % 7];
    if (!hh) continue;
    if (i === 0 && mins(hh[0]) <= n.m) continue;
    const t = new Date(todayP() + "T12:00:00Z"); t.setUTCDate(t.getUTCDate() + i);
    return { iso: t.toISOString().slice(0, 10), time: hh[0] };
  }
  return null;
}
