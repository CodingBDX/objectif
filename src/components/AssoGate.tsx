import Link from "next/link";

/** Message affiché aux visiteurs, membres et livecams : l'annuaire des associations est réservé aux profils escortes. */
export default function AssoGate() {
  return (
    <section className="dcard">
      <h3>🔒 Réservé aux profils escortes</h3>
      <p className="note" style={{ marginTop: 0 }}>Les associations et leurs coordonnées ne sont visibles que par les profils escortes connectés.</p>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}><Link className="btn" href="/connexion">Se connecter</Link><Link className="btn ghost" href="/connexion?inscription=1">Créer mon profil</Link></div>
    </section>
  );
}
