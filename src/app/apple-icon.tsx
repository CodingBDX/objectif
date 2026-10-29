import { ImageResponse } from "next/og";
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/** Icône de l'écran d'accueil (iPhone) : cœur blanc sur rose vif du site. */
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#d63384" }}>
        <svg width="112" height="112" viewBox="0 0 24 24"><path d="M12 21s-8-5.2-8-11.2A4.6 4.6 0 0 1 12 7a4.6 4.6 0 0 1 8 2.8C20 15.8 12 21 12 21z" fill="#ffffff" /></svg>
      </div>
    ),
    { ...size }
  );
}
