import { ImageResponse } from "next/og";
export const alt = "sex-escorte.com : l'annuaire des escortes, profils vérifiés et protégés";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const HEART = "M12 21s-8-5.2-8-11.2A4.6 4.6 0 0 1 12 7a4.6 4.6 0 0 1 8 2.8C20 15.8 12 21 12 21z";
const SPARK = "M12 2l2.2 7.8L22 12l-7.8 2.2L12 22l-2.2-7.8L2 12l7.8-2.2z";

/** Image d'aperçu du site (WhatsApp, SMS, réseaux) : crème et rose poudré, cadre doré. */
export default function Image() {
  const deco = (d: string, x: number, y: number, s: number, c: string, r = 0) => (
    <div style={{ position: "absolute", left: x, top: y, display: "flex", transform: `rotate(${r}deg)` }}>
      <svg width={s} height={s} viewBox="0 0 24 24"><path d={d} fill={c} /></svg>
    </div>
  );
  const pill = (t: string) => (
    <div style={{ display: "flex", padding: "12px 28px", borderRadius: 999, background: "#ffe1ef", border: "2px solid #f4b6d2", color: "#8a1f5c", fontSize: 27, fontWeight: 700 }}>{t}</div>
  );
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", position: "relative", alignItems: "center", justifyContent: "center", background: "linear-gradient(160deg,#fff7ef,#fbd9df)" }}>
        <div style={{ position: "absolute", top: 28, left: 28, right: 28, bottom: 28, borderRadius: 30, border: "4px solid #c9884a", display: "flex" }} />
        <div style={{ position: "absolute", top: 46, left: 46, right: 46, bottom: 46, borderRadius: 22, border: "2px solid rgba(201,136,74,0.55)", display: "flex" }} />
        {deco(HEART, 100, 80, 60, "#e0468f", -10)}
        {deco(HEART, 1040, 450, 60, "#e0468f", 10)}
        {deco(SPARK, 1020, 90, 28, "#c9884a")}
        {deco(SPARK, 150, 440, 24, "#c9884a")}
        <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ display: "flex", fontSize: 108, fontWeight: 700, color: "#c2275f", letterSpacing: -2 }}>
            sex-escorte<span style={{ color: "#ee4f97" }}>.com</span>
          </div>
          <div style={{ display: "flex", width: 280, height: 3, marginTop: 14, background: "linear-gradient(90deg,rgba(201,136,74,0),#c9884a,rgba(201,136,74,0))" }} />
          <div style={{ display: "flex", marginTop: 24, fontSize: 38, color: "#5c1a43" }}>L’annuaire des escortes, près de chez toi</div>
          <div style={{ display: "flex", gap: 16, marginTop: 36 }}>
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
