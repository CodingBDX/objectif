import { ImageResponse } from "next/og";
export const alt = "Sex-Escorte, annuaire des escortes populaire, sexy, numéro un";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export default function Image() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg,#ffdcec,#ffb3d1)", color: "#5c1a43" }}>
        <div style={{ fontSize: 100, fontWeight: 700, color: "#d63384" }}>sex-escorte.com</div>
        <div style={{ fontSize: 44, marginTop: 10 }}>Annuaire des escortes</div>
        <div style={{ fontSize: 30, marginTop: 24, color: "#94607f" }}>Populaire · Sexy · Numéro un</div>
      </div>
    ),
    size
  );
}
