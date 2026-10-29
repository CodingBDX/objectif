/** Quartiers proposés pour la carte « zone » (escorte de rue). Aucune coordonnée précise n'est jamais enregistrée :
 *  seul le NOM du quartier est stocké ; le centre ci-dessous est le même pour toutes les escortes du quartier. */
export type Quartier = { n: string; lat: number; lon: number };
export const ZONE_RADIUS = 700; // mètres
export const QUARTIERS: Record<string, Quartier[]> = {
  Paris: [
    { n: "Pigalle", lat: 48.8822, lon: 2.3377 }, { n: "Strasbourg-Saint-Denis", lat: 48.869, lon: 2.354 }, { n: "Gare du Nord", lat: 48.8809, lon: 2.3553 },
    { n: "Châtelet-Les Halles", lat: 48.8606, lon: 2.347 }, { n: "Bastille", lat: 48.8531, lon: 2.3691 }, { n: "Belleville", lat: 48.872, lon: 2.385 },
    { n: "Montparnasse", lat: 48.8422, lon: 2.3219 }, { n: "Ternes", lat: 48.878, lon: 2.298 }
  ],
  Lyon: [
    { n: "Perrache", lat: 45.749, lon: 4.826 }, { n: "Guillotière", lat: 45.7545, lon: 4.842 }, { n: "Part-Dieu", lat: 45.7605, lon: 4.859 },
    { n: "Presqu’île", lat: 45.764, lon: 4.835 }, { n: "Croix-Rousse", lat: 45.774, lon: 4.832 }, { n: "Vieux Lyon", lat: 45.7625, lon: 4.827 }
  ],
  Marseille: [
    { n: "Belsunce / Noailles", lat: 43.2965, lon: 5.379 }, { n: "Saint-Charles", lat: 43.3025, lon: 5.38 }, { n: "Vieux-Port", lat: 43.295, lon: 5.374 },
    { n: "La Plaine", lat: 43.293, lon: 5.383 }, { n: "Joliette", lat: 43.305, lon: 5.367 }, { n: "Prado", lat: 43.273, lon: 5.39 }
  ],
  Bordeaux: [
    { n: "Chartrons", lat: 44.852, lon: -0.574 }, { n: "Saint-Michel", lat: 44.8325, lon: -0.556 }, { n: "Gare Saint-Jean", lat: 44.826, lon: -0.556 },
    { n: "Victoire", lat: 44.83, lon: -0.573 }, { n: "Gambetta", lat: 44.8415, lon: -0.5805 }, { n: "Bastide", lat: 44.842, lon: -0.559 }
  ],
  Toulouse: [
    { n: "Capitole", lat: 43.6045, lon: 1.444 }, { n: "Matabiau", lat: 43.611, lon: 1.454 }, { n: "Saint-Cyprien", lat: 43.599, lon: 1.429 },
    { n: "Carmes", lat: 43.598, lon: 1.447 }, { n: "Arnaud-Bernard", lat: 43.61, lon: 1.441 }, { n: "Compans-Caffarelli", lat: 43.613, lon: 1.434 }
  ]
};
const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
export const quartiersOf = (city: string): Quartier[] => { const k = Object.keys(QUARTIERS).find((c) => norm(c) === norm(city)); return k ? QUARTIERS[k] : []; };
export const quartierOf = (city: string, name: string | null | undefined): Quartier | null => (name ? quartiersOf(city).find((q) => q.n === name) || null : null);
