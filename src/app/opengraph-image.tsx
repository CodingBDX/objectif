import { ImageResponse } from "next/og";
export const alt = "sex-escorte.com : l'annuaire des escortes. Discrétion, respect, sécurité.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const HEART = "M12 21s-8-5.2-8-11.2A4.6 4.6 0 0 1 12 7a4.6 4.6 0 0 1 8 2.8C20 15.8 12 21 12 21z";
const SHIELD = "M12 3l8 3v6c0 4.6-3.2 8-8 9-4.8-1-8-4.4-8-9V6z";
const EYE = "M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12zM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z";

/** Image d'aperçu du site (WhatsApp, SMS, réseaux) : exactement les couleurs du site (rose clair, prune, rose vif). */
export default function Image() {
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
        <div style={{ position: "absolute", top: -170, right: -110, width: 540, height: 540, borderRadius: 999, background: "rgba(238,79,151,0.16)", display: "flex" }} />
        <div style={{ position: "absolute", bottom: -220, left: -130, width: 580, height: 580, borderRadius: 999, background: "rgba(154,92,200,0.13)", display: "flex" }} />
        <div style={{ position: "absolute", top: 80, left: 100, width: 34, height: 34, borderRadius: 999, background: "rgba(238,79,151,0.45)", display: "flex" }} />
        <div style={{ position: "absolute", bottom: 80, right: 110, width: 56, height: 56, borderRadius: 999, background: "rgba(214,51,132,0.3)", display: "flex" }} />
        <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", padding: "50px 76px 52px", borderRadius: 52, background: "#ffffff", border: "3px solid #f9cde2", boxShadow: "0 24px 60px rgba(238,79,151,0.22)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 104, height: 104, borderRadius: 999, background: "#d63384", boxShadow: "0 10px 26px rgba(238,79,151,0.4)" }}>
            <svg width="56" height="56" viewBox="0 0 24 24" fill="#ffffff"><path d={HEART} /></svg>
          </div>
          <div style={{ display: "flex", marginTop: 22, fontSize: 100, fontWeight: 700, color: "#d63384", letterSpacing: -2 }}>
            sex-escorte<span style={{ color: "#ee4f97" }}>.com</span>
          </div>
          <div style={{ display: "flex", marginTop: 8, fontSize: 36, color: "#5c1a43" }}>L’annuaire des escortes, près de chez toi</div>
          <div style={{ display: "flex", gap: 16, marginTop: 34 }}>
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
