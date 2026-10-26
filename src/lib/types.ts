export type Genre = "fille" | "homme" | "trans" | "livecam";
export const GENRES: { id: Genre; label: string; icon: string }[] = [
  { id: "fille", label: "Filles", icon: "♀" },
  { id: "homme", label: "Hommes", icon: "♂" },
  { id: "trans", label: "Trans", icon: "⚧" },
  { id: "livecam", label: "Livecam", icon: "📹" }
];
export const SPECIALTIES = ["Portrait","Mode","Mariage","Studio","Lifestyle","Boudoir","Glamour","Artistique","Nu artistique","Urbain","Nature","Voyage","Événementiel","Produit","Culinaire","Sport","Danse","Musique","Vidéo clip","Court-métrage","Drone","Retouche","Illustration","Peinture","Maquillage","Stylisme","Tatouage","Livecam","Streaming","Réseaux sociaux"];
export type Trip = { city: string; from: string; to: string };
export type Profile = {
  id: string; name: string; genre: Genre; city: string; specialties: string[]; bio: string;
  phone: string | null; instagram: string | null; snapchat: string | null; tiktok: string | null; site: string | null;
  h24: boolean; hours: Record<string, [string, string] | null>; trips: Trip[];
  photos: string[]; video: string | null; vip: boolean; verified: boolean; paused: boolean; created_at: string;
};
export const isNew = (p: Profile) => Date.now() - new Date(p.created_at).getTime() < 30 * 864e5;
