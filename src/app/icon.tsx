import { ImageResponse } from "next/og";
export const size = { width: 64, height: 64 };
export const contentType = "image/png";

/** Favicon : cœur blanc sur rose vif du site. */
export default function Icon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#d63384", borderRadius: 16 }}>
        <svg width="40" height="40" viewBox="0 0 24 24"><path d="M12 21s-8-5.2-8-11.2A4.6 4.6 0 0 1 12 7a4.6 4.6 0 0 1 8 2.8C20 15.8 12 21 12 21z" fill="#ffffff" /></svg>
      </div>
    ),
    { ...size }
  );
}
