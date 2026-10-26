"use client";
import { supabaseBrowser } from "@/lib/supabase/client";
export default function SignOut() {
  return <button className="nl" onClick={async () => { await supabaseBrowser().auth.signOut(); location.href = "/"; }}>Quitter</button>;
}
