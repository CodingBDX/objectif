import type { Metadata } from "next";
import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import { canSeeLodgings } from "@/lib/lodgingServer";
import LodgingEditor from "@/components/LodgingEditor";
import { Tr } from "@/lib/i18n";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Mon logement", robots: { index: false, follow: false } };

export default async function Page() {
  const { data: { user } } = await supabaseServer().auth.getUser();
  if (!user) redirect("/connexion");
  if (!(await canSeeLodgings())) notFound();
  return (
    <section className="gut">
      <div className="pbar"><Link className="btn ghost" href="/mon-profil"><Tr k="← Modifier mon profil" /></Link><h1 className="pbn"><Tr k="🏠 Mon logement" /></h1></div>
      <div className="pfc" style={{ maxWidth: 720 }}><LodgingEditor uid={user.id} /></div>
    </section>
  );
}
