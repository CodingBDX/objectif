"use client";
import Link from "next/link";
import { useState } from "react";
import AssoShell from "@/components/AssoShell";
import AssoForm from "@/components/AssoForm";

export default function Page() {
  const [info, setInfo] = useState<{ row: { slug: string; status: string } | null; name: string }>({ row: null, name: "" });
  const { row, name } = info;
  return (
    <AssoShell list={false} title={row ? "Ma fiche association" : "Créer la fiche de mon association"} active="fiche" avatar={(name || "?").slice(0, 1).toUpperCase()} hi={name || "Nouvelle association"}
      top={row?.status === "approved" ? <Link className="btn ghost" href={`/associations/${row.slug}`}>Voir la fiche publique</Link> : undefined}>
      <AssoForm onInfo={(i) => setInfo(i as never)} />
    </AssoShell>
  );
}
