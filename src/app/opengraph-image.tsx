import { ImageResponse } from "next/og";
export const alt = "sex-escorte.com : l'annuaire des escortes. Discrétion, respect, sécurité.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const HEART = "M12 21s-8-5.2-8-11.2A4.6 4.6 0 0 1 12 7a4.6 4.6 0 0 1 8 2.8C20 15.8 12 21 12 21z";
const SPARK = "M12 2l2.2 7.8L22 12l-7.8 2.2L12 22l-2.2-7.8L2 12l7.8-2.2z";
const SHIELD = "M12 3l8 3v6c0 4.6-3.2 8-8 9-4.8-1-8-4.4-8-9V6z";
const EYE = "M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12zM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z";

/** Image d'aperçu du site (WhatsApp, SMS, réseaux) : mise en page validée, aux couleurs exactes du site (rose clair, prune, rose vif, lilas). */
export default function Image() {
  const deco = (d: string, x: number, y: number, s: number, o: number, c: string, r = 0) => (
    <div style={{ position: "absolute", left: x, top: y, display: "flex", opacity: o, transform: `rotate(${r}deg)` }}>
      <svg width={s} height={s} viewBox="0 0 24 24"><path d={d} fill={c} /></svg>
    </div>
  );
  const pill = (p: string, t: string) => (
    <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "10px 28px 10px 12px", borderRadius: 999, background: "#ffe1ef", border: "2px solid #f9cde2", color: "#5c1a43", fontSize: 28, fontWeight: 700 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 48, height: 48, borderRadius: 999, background: "#d63384" }}>
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={p} /></svg>
      </div>
      {t}
    </div>
  );
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", position: "relative", alignItems: "center", justifyContent: "center", background: "linear-gradient(165deg,#fff4fa,#ffdcec)" }}>
        <div style={{ position: "absolute", top: -200, left: -120, width: 620, height: 620, borderRadius: 999, background: "rgba(154,92,200,0.13)", display: "flex" }} />
        <div style={{ position: "absolute", bottom: -260, right: -140, width: 700, height: 700, borderRadius: 999, background: "rgba(238,79,151,0.2)", display: "flex" }} />
        {deco(HEART, 96, 78, 64, 0.4, "#ee4f97", -14)}
        {deco(HEART, 1030, 460, 84, 0.35, "#d63384", 12)}
        {deco(HEART, 960, 70, 42, 0.5, "#ee4f97", 18)}
        {deco(HEART, 130, 470, 48, 0.45, "#d63384", 10)}
        {deco(SPARK, 250, 120, 30, 0.7, "#9a5cc8")}
        {deco(SPARK, 900, 160, 22, 0.6, "#9a5cc8")}
        {deco(SPARK, 1060, 330, 28, 0.6, "#ee4f97")}
        {deco(SPARK, 150, 330, 20, 0.6, "#ee4f97")}
        <div style={{ position: "absolute", top: 30, left: 30, right: 30, bottom: 30, borderRadius: 44, border: "3px solid #f9cde2", display: "flex" }} />
        <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <div style={{ display: "flex", width: 120, height: 3, background: "linear-gradient(90deg,rgba(238,79,151,0),#ee4f97)" }} />
            <svg width="40" height="40" viewBox="0 0 24 24"><path d={HEART} fill="#d63384" /></svg>
            <div style={{ display: "flex", width: 120, height: 3, background: "linear-gradient(90deg,#ee4f97,rgba(238,79,151,0))" }} />
          </div>
          <div style={{ display: "flex", marginTop: 22, fontSize: 112, fontWeight: 700, color: "#d63384", letterSpacing: -3 }}>
            sex-escorte<span style={{ color: "#ee4f97" }}>.com</span>
          </div>
          <div style={{ display: "flex", marginTop: 10, fontSize: 38, color: "#5c1a43", letterSpacing: 1 }}>L’annuaire des escortes, près de chez toi</div>
          <div style={{ display: "flex", gap: 18, marginTop: 40 }}>
            {pill(EYE, "Discrétion")}
            {pill(HEART, "Respect")}
            {pill(SHIELD, "Sécurité")}
          </div>
        </div>
      </div>
    ),
    size
  );
}
