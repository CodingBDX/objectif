import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ProfileView, profileMetadata } from "@/app/profil/view";
import { GENRES } from "@/lib/profilUrl";

export const dynamic = "force-dynamic";
type Params = { params: { genre: string; ville: string; pseudo: string } };
export const generateMetadata = ({ params }: Params): Promise<Metadata> | Metadata => (GENRES.includes(params.genre) ? profileMetadata({ slug: params.pseudo }) : {});
export default async function Page({ params }: Params) {
  if (!GENRES.includes(params.genre)) notFound();
  return ProfileView({ r: { slug: params.pseudo }, path: `/${params.genre}/${params.ville}/${params.pseudo}` });
}
