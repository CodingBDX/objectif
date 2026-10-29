import { ImageResponse } from "next/og";
export const alt = "Sex-Escorte : l'annuaire des escortes, profils vérifiés et protégés";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Image d'aperçu du site (WhatsApp, SMS, réseaux) : aux couleurs du site, rose et prune. */
export default function Image() {
  const pill = (t: string) => (
    <div style={{ display: "flex", padding: "12px 26px", borderRadius: 999, background: "#ffe1ef", color: "#8a1f5c", fontSize: 28, fontWeight: 700 }}>{t}</div>
  );
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", position: "relative", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg,#fff4fa,#ffdcec 55%,#ffb3d1)", color: "#5c1a43" }}>
        <div style={{ position: "absolute", top: -140, right: -100, width: 520, height: 520, borderRadius: 999, background: "rgba(238,79,151,0.22)", display: "flex" }} />
        <div style={{ position: "absolute", bottom: -180, left: -120, width: 560, height: 560, borderRadius: 999, background: "rgba(154,92,200,0.18)", display: "flex" }} />
        <div style={{ position: "absolute", top: 70, left: 90, width: 36, height: 36, borderRadius: 999, background: "rgba(238,79,151,0.5)", display: "flex" }} />
        <div style={{ position: "absolute", bottom: 90, right: 120, width: 60, height: 60, borderRadius: 999, background: "rgba(214,51,132,0.35)", display: "flex" }} />
        <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", padding: "56px 84px", borderRadius: 56, background: "#ffffff", boxShadow: "0 24px 60px rgba(214,51,132,0.28)", border: "3px solid #f9cde2" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 128, height: 128, borderRadius: 999, background: "#d63384", boxShadow: "0 12px 30px rgba(214,51,132,0.4)" }}>
            <svg width="68" height="68" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z" />
              <circle cx="12" cy="10" r="2.6" />
            </svg>
          </div>
          <div style={{ display: "flex", marginTop: 26, fontSize: 96, fontWeight: 700, color: "#d63384", letterSpacing: -2 }}>Sex-Escorte</div>
          <div style={{ display: "flex", marginTop: 6, fontSize: 38, color: "#5c1a43" }}>L’annuaire des escortes, près de chez toi</div>
          <div style={{ display: "flex", gap: 16, marginTop: 34 }}>
            {pill("Profils vérifiés")}
            {pill("Clients signalés")}
            {pill("Gratuit")}
          </div>
        </div>
      </div>
    ),
    size
  );
}
