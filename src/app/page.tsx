import { Suspense } from "react";
import { supabaseServer } from "@/lib/supabase/server";
import { Profile } from "@/lib/types";
import Home from "@/components/Home";

export const dynamic = "force-dynamic";
export default async function Page() {
  const { data } = await supabaseServer().from("profiles").select("*").eq("paused", false).order("created_at", { ascending: false }).limit(1000);
  return <Suspense><Home profiles={(data || []) as Profile[]} /></Suspense>;
}
