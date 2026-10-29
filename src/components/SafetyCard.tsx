"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useT } from "@/lib/i18n";

const DUR: [string, number][] = [["1 h", 1], ["2 h", 2], ["3 h", 3], ["Soirée (5 h)", 5], ["Nuit (10 h)", 10]];
const two = (n: number) => String(n).padStart(2, "0");
const waNum = (s: string) => { const d = s.replace(/\D/g, ""); return d.startsWith("00") ? d.slice(2) : d.startsWith("0") ? "33" + d.slice(1) : d; };

/** Sécurité : prévenir une amie par WhatsApp avant un rendez-vous, puis confirmer que tout va bien. Rien n'est enregistré sur le site. */
export default function SafetyCard() {
  const { tr } = useT();
  const now = new Date(); const [place, setPlace] = useState(""); const [at, setAt] = useState(`${two(now.getHours())}:${two(Math.ceil(now.getMinutes() / 5) % 12 * 5)}`); const [dur, setDur] = useState(1);
  const [client, setClient] = useState(""); const [friend, setFriend] = useState("");
  useEffect(() => { try { setFriend(localStorage.getItem("hp_friend") || ""); } catch {} }, []);
  const [h, m] = at.split(":").map(Number); const endM = ((h || 0) * 60 + (m || 0) + dur * 60) % 1440; const end = `${two(Math.floor(endM / 60))}:${two(endM % 60)}`;
  const ok = waNum(friend).length >= 9 && place.trim().length >= 2;
  const open = (text: string) => { try { localStorage.setItem("hp_friend", friend); } catch {} window.open(`https://wa.me/${waNum(friend)}?text=${encodeURIComponent(text)}`, "_blank", "noopener"); };
  const start = () => open(`🛡️ Alerte sécurité : je vois un client à ${place.trim()} à ${at}. Durée prévue : ${DUR.find((d) => d[1] === dur)?.[0]}.${client.trim() ? ` Client : ${client.trim()}.` : ""}\nJe te confirme que tout va bien vers ${end}. Si tu n’as pas de nouvelles à ${end} + 15 min, appelle-moi ; sans réponse, préviens la police (17 ou 112).`);
  const fine = () => open(`✅ Tout va bien, rendez-vous terminé (${place.trim() || "lieu"}). Merci !`);
  return (
    <section className="dcard">
      <h3>{tr("🛡️ Ma sécurité")}</h3>
      <p className="note" style={{ margin: 0 }}>{tr("Avant un rendez-vous, préviens une amie par WhatsApp : lieu, heure et heure de retour. Rien n’est enregistré sur le site.")}</p>
      <div className="row2"><label className="f">{tr("Lieu (ville, adresse ou hôtel)")}<input value={place} maxLength={120} onChange={(e) => setPlace(e.target.value)} /></label>
        <label className="f">{tr("Heure du rendez-vous")}<input type="time" value={at} onChange={(e) => setAt(e.target.value)} /></label></div>
      <div className="row2"><label className="f">{tr("Durée prévue")}<select value={dur} onChange={(e) => setDur(Number(e.target.value))}>{DUR.map(([l, v]) => <option key={v} value={v}>{tr(l)}</option>)}</select></label>
        <label className="f">{tr("Client (prénom ou numéro, facultatif)")}<input value={client} maxLength={60} onChange={(e) => setClient(e.target.value)} /></label></div>
      <label className="f">{tr("WhatsApp de mon amie")}<input type="tel" inputMode="tel" placeholder="06 12 34 56 78" value={friend} onChange={(e) => setFriend(e.target.value)} autoComplete="off" /></label>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button type="button" className="btn" disabled={!ok} onClick={start}>{tr("Prévenir mon amie")}</button>
        <button type="button" className="btn ghost" disabled={waNum(friend).length < 9} onClick={fine}>{tr("✅ Tout va bien")}</button>
        <Link className="btn ghost" href="/verifier">{tr("Vérifier un numéro client")}</Link>
      </div>
    </section>
  );
}
