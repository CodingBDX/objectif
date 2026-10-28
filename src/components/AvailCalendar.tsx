import { Busy, busyList } from "@/lib/lodging";

const MN = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
const DN = ["L", "M", "M", "J", "V", "S", "D"];
const pad = (n: number) => String(n).padStart(2, "0");

/** Calendrier des 3 prochains mois : les jours occupés sont barrés. */
export default function AvailCalendar({ busy, today }: { busy: Busy[]; today: string }) {
  const b = busyList({ busy }); const [y0, m0] = today.split("-").map(Number);
  const months = [0, 1, 2].map((k) => { const m = m0 - 1 + k; return { y: y0 + Math.floor(m / 12), m: ((m % 12) + 12) % 12 }; });
  return (
    <div className="cals" role="group" aria-label="Calendrier">
      {months.map(({ y, m }) => {
        const first = (new Date(y, m, 1).getDay() + 6) % 7; const days = new Date(y, m + 1, 0).getDate();
        return (
          <div className="cal" key={`${y}-${m}`}><b>{MN[m]} {y}</b>
            <div className="cg">{DN.map((d, i) => <span key={i} className="ch">{d}</span>)}
              {Array.from({ length: first }, (_, i) => <span key={"e" + i} />)}
              {Array.from({ length: days }, (_, i) => { const iso = `${y}-${pad(m + 1)}-${pad(i + 1)}`; const occ = b.some((x) => iso >= x.from && iso <= (x.to || x.from)); const past = iso < today;
                return <span key={iso} className={occ ? "occ" : past ? "past" : "free"} title={occ ? "Occupé" : past ? "" : "Libre"} aria-label={`${i + 1} ${MN[m]} ${occ ? "occupé" : past ? "" : "libre"}`}>{i + 1}</span>; })}</div></div>);
      })}
    </div>
  );
}
