import Link from "next/link";
import { GENRES, isNew, Profile } from "@/lib/types";
export default function Card({ p }: { p: Profile }) {
  const g = GENRES.find((x) => x.id === p.genre);
  return (
    <Link href={`/profil/${p.id}`} className="card">
      <div className="ph wm" data-wm={process.env.NEXT_PUBLIC_SITE_NAME ? `© ${process.env.NEXT_PUBLIC_SITE_NAME}` : "© Objectif"}>
        {p.photos[0] && <img src={p.photos[0]} alt={p.name} loading="lazy" />}
      </div>
      <div className="meta">
        <h3>{p.name} {p.verified && "✔"}</h3>
        <div className="mut">{p.city}</div>
        <div style={{ marginTop: 6 }}>
          <span className="badge">{g?.icon} {g?.label.replace(/s$/, "")}</span>
          {p.vip && <span className="badge vip">👑 VIP</span>}
          {isNew(p) && <span className="badge new">✨ NEW</span>}
        </div>
      </div>
    </Link>
  );
}
