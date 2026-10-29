import { ImageResponse } from "next/og";
export const alt = "sex-escorte.com : l'annuaire des escortes, profils vérifiés et protégés";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const HEART = "M12 21s-8-5.2-8-11.2A4.6 4.6 0 0 1 12 7a4.6 4.6 0 0 1 8 2.8C20 15.8 12 21 12 21z";
const SPARK = "M12 2l2.2 7.8L22 12l-7.8 2.2L12 22l-2.2-7.8L2 12l7.8-2.2z";

/** Image d'aperçu du site (WhatsApp, SMS, réseaux) : prune et rose profond, dorures douces. */
export default function Image() {
  const deco = (d: string, x: number, y: number, s: number, o: number, c: string, r = 0) => (
    <div style={{ position: "absolute", left: x, top: y, display: "flex", opacity: o, transform: `rotate(${r}deg)` }}>
      <svg width={s} height={s} viewBox="0 0 24 24"><path d={d} fill={c} /></svg>
    </div>
  );
  const pill = (t: string) => (
    <div style={{ display: "flex", padding: "12px 28px", borderRadius: 999, border: "2px solid rgba(255,214,236,0.55)", background: "rgba(255,255,255,0.1)", color: "#ffe1ef", fontSize: 27, fontWeight: 700 }}>{t}</div>
  );
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", position: "relative", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg,#2e0b24 0%,#7a1a53 48%,#e0468f 100%)" }}>
        <div style={{ position: "absolute", top: -200, left: -120, width: 620, height: 620, borderRadius: 999, background: "rgba(255,160,205,0.16)", display: "flex" }} />
        <div style={{ position: "absolute", bottom: -260, right: -140, width: 700, height: 700, borderRadius: 999, background: "rgba(255,214,236,0.18)", display: "flex" }} />
        {deco(HEART, 96, 78, 64, 0.35, "#ffb8da", -14)}
        {deco(HEART, 1030, 460, 84, 0.3, "#ffd6ec", 12)}
        {deco(HEART, 960, 70, 42, 0.45, "#ff8fc3", 18)}
        {deco(HEART, 130, 470, 48, 0.4, "#ffb8da", 10)}
        {deco(SPARK, 250, 120, 30, 0.7, "#ffe8a8")}
        {deco(SPARK, 900, 160, 22, 0.6, "#ffe8a8")}
        {deco(SPARK, 1060, 330, 28, 0.6, "#ffe8a8")}
        {deco(SPARK, 150, 330, 20, 0.6, "#ffe8a8")}
        <div style={{ position: "absolute", top: 30, left: 30, right: 30, bottom: 30, borderRadius: 44, border: "2px solid rgba(255,214,236,0.4)", display: "flex" }} />
        <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <div style={{ display: "flex", width: 120, height: 3, background: "linear-gradient(90deg,rgba(255,232,168,0),#ffe8a8)" }} />
            <svg width="40" height="40" viewBox="0 0 24 24"><path d={HEART} fill="#ffe8a8" /></svg>
            <div style={{ display: "flex", width: 120, height: 3, background: "linear-gradient(90deg,#ffe8a8,rgba(255,232,168,0))" }} />
          </div>
          <div style={{ display: "flex", marginTop: 22, fontSize: 112, fontWeight: 700, color: "#ffffff", letterSpacing: -3, textShadow: "0 6px 30px rgba(46,11,36,0.55)" }}>
            sex-escorte<span style={{ color: "#ffb8da" }}>.com</span>
          </div>
          <div style={{ display: "flex", marginTop: 10, fontSize: 38, color: "#ffe1ef", letterSpacing: 1 }}>L’annuaire des escortes, près de chez toi</div>
          <div style={{ display: "flex", gap: 16, marginTop: 40 }}>
            {pill("Profils vérifiés")}
            {pill("Clients signalés")}
            {pill("Inscription gratuite")}
          </div>
        </div>
      </div>
    ),
    size
  );
}
