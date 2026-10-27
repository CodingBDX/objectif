import { redirect } from "next/navigation";

/** Les statistiques sont maintenant un onglet de « Mon espace » (/mon-profil#stats) : on garde l'ancienne adresse qui redirige. */
export default function Page() { redirect("/mon-profil#stats"); }
