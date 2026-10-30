"use client";
import { useCallback, useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import { DEFAULT_PLANS, loadPlans } from "@/lib/vipPlans";

type Row = { id: string; label: string; days: number; price: number; position: number; active: boolean };

/** Éditeur des tarifs VIP (admin) : libellé, durée en jours, prix en €, ordre, actif. */
export default function VipPlansAdmin() {
  const sb = supabaseBrowser();
  const [rows, setRows] = useState<Row[]>([]); const [msg, setMsg] = useState(""); const [busy, setBusy] = useState(false); const [ok, setOk] = useState(true);
  const load = useCallback(async () => {
    const { data, error } = await sb.from("vip_plans").select("*").order("position").order("price");
    if (error) { setOk(false); setMsg("Table vip_plans absente : lance supabase/migration-vip-tarifs.sql."); setRows(DEFAULT_PLANS.map((p, i) => ({ ...p, position: i + 1, active: true }))); return; }
    setRows((data as Row[]) || []);
  }, [sb]);
  useEffect(() => { load(); }, [load]);
  const set = (i: number, k: keyof Row, v: string | number | boolean) => setRows((r) => r.map((x, j) => (j === i ? { ...x, [k]: v } : x)));
  const add = () => setRows((r) => [...r, { id: "p" + Date.now().toString(36), label: "Nouveau forfait", days: 7, price: 50, position: r.length + 1, active: true }]);
  async function save() {
    setBusy(true); setMsg("");
    const bad = rows.find((r) => !r.label.trim() || !(r.days > 0) || !(r.price >= 0));
    if (bad) { setBusy(false); setOk(false); setMsg("Chaque forfait doit avoir un nom, une durée > 0 et un prix."); return; }
    const { error } = await sb.from("vip_plans").upsert(rows.map((r, i) => ({ ...r, label: r.label.trim(), days: Math.round(r.days), price: Math.round(r.price), position: i + 1 })));
    setBusy(false);
    if (error) { setOk(false); setMsg("Erreur : " + error.message); return; }
    await loadPlans(true); setOk(true); setMsg("Tarifs enregistrés. Ils s’appliquent tout de suite sur le site."); load();
  }
  async function del(i: number) {
    const r = rows[i];
    if (!r) return;
    const { error } = await sb.from("vip_plans").delete().eq("id", r.id);
    if (error) { setOk(false); setMsg("Erreur : " + error.message); return; }
    setRows((x) => x.filter((_, j) => j !== i)); await loadPlans(true);
  }
  return (
    <section className="card" style={{ padding: 14, display: "grid", gap: 10 }}>
      <h3 style={{ margin: 0 }}>Tarifs VIP</h3>
      <p className="note" style={{ margin: 0 }}>Modifie le nom, la durée (jours) et le prix (€). Décoche « Actif » pour masquer un forfait sans le supprimer.</p>
      {rows.map((r, i) => (
        <div key={r.id} style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
          <input aria-label="Nom du forfait" value={r.label} onChange={(e) => set(i, "label", e.target.value)} style={{ flex: "1 1 120px", minWidth: 0 }} />
          <input aria-label="Durée en jours" type="number" min={1} value={r.days} onChange={(e) => set(i, "days", Number(e.target.value))} style={{ width: 70 }} /> <span className="note">j</span>
          <input aria-label="Prix en euros" type="number" min={0} value={r.price} onChange={(e) => set(i, "price", Number(e.target.value))} style={{ width: 80 }} /> <span className="note">€</span>
          <label className="note" style={{ display: "flex", gap: 4, alignItems: "center" }}><input type="checkbox" checked={r.active} onChange={(e) => set(i, "active", e.target.checked)} />Actif</label>
          <button type="button" className="btn ghost" onClick={() => del(i)} aria-label="Supprimer le forfait">✕</button>
        </div>
      ))}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button type="button" className="btn ghost" onClick={add}>+ Ajouter un forfait</button>
        <button type="button" className="btn" disabled={busy} onClick={save}>{busy ? "…" : "Enregistrer les tarifs"}</button>
      </div>
      {msg && <p className="note" role="status" style={{ margin: 0, fontWeight: 700, color: ok ? "inherit" : "var(--btn)" }}>{msg}</p>}
    </section>
  );
}
