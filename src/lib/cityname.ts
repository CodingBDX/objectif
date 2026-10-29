/** Communes homonymes : le nom enregistré peut porter le département, ex. « Saint-Denis (93) ». Ces helpers séparent les deux pour interroger l'API officielle. */
export function splitCity(s: string): { nom: string; dep: string } {
  const m = s.trim().match(/^(.*?)\s*\(([0-9]{2,3}|2[AB])\)$/i);
  return m ? { nom: m[1].trim(), dep: m[2].toUpperCase() } : { nom: s.trim(), dep: "" };
}
/** Paramètres de recherche « nom=… » (+ département s'il est précisé) pour geo.api.gouv.fr. */
export function geoNom(s: string): string {
  const { nom, dep } = splitCity(s);
  return `nom=${encodeURIComponent(nom)}${dep ? `&codeDepartement=${dep}` : ""}`;
}
/** Nom affiché dans les listes : on ajoute le département seulement si plusieurs communes portent le même nom dans la liste. */
export function withDep(nom: string, dep: string | undefined, all: { nom: string }[]): string {
  return dep && all.filter((x) => x.nom.toLowerCase() === nom.toLowerCase()).length > 1 ? `${nom} (${dep})` : nom;
}
