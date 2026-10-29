import type { Metadata } from "next";
import { ProfileView, profileMetadata } from "../view";

export const dynamic = "force-dynamic";
export const generateMetadata = ({ params }: { params: { id: string } }): Promise<Metadata> => profileMetadata({ param: params.id });
export default async function Page({ params }: { params: { id: string } }) {
  return ProfileView({ r: { param: params.id }, path: `/profil/${params.id}` });
}
