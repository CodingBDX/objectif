/** Villes qui ne sont pas des communes françaises (donc absentes de l'API geo.api.gouv.fr) mais que l'annuaire accepte. [nom, longitude, latitude, région, département voisin] */
export const EXTRA_CITIES: { nom: string; lon: number; lat: number; region: string; near: string }[] = [
  { nom: "Monaco", lon: 7.4246, lat: 43.7384, region: "Monaco", near: "06" }
];
const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
export const extraCity = (name: string) => EXTRA_CITIES.find((c) => norm(c.nom) === norm(name));
export const extraMatches = (q: string) => (q.trim().length >= 2 ? EXTRA_CITIES.filter((c) => norm(c.nom).startsWith(norm(q))) : []);
