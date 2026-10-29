import Ic from "@/components/Ic";
import { CROWNS } from "@/lib/types";

/** Petite couronne de niveau (Bronze, Argent, Or, Diamant) : récompense de fidélité (points + temps de VIP). */
export default function CrownBadge({ level, size = 16 }: { level?: number | null; size?: number }) {
  const c = level ? CROWNS[level] : null; if (!c) return null;
  return <span className="crownl" role="img" aria-label={`Niveau ${c.n}`} title={`Niveau ${c.n}`} style={{ color: c.c }}><Ic n="crown" s={size} /></span>;
}
