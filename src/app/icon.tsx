import { ImageResponse } from "next/og";
export const size = { width: 64, height: 64 };
export const contentType = "image/png";

/** Favicon : piment rose (tige lilas) sur fond rose clair, aux couleurs du site. */
export default function Icon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#ffe1ef", borderRadius: 16 }}>
        <svg width="48" height="48" viewBox="0 0 24 24"><path d="M17.4 6.4C20.8 8.9 20.2 14.2 16.2 18C12.6 21.3 7.2 22 3.2 20.4C6.5 19.4 8.5 17.6 9.8 14.9C10.9 12.6 11 10.2 12.4 8.6C13.7 7.1 15.7 5.7 17.4 6.4Z" fill="#d63384" /><path d="M16.9 9C18 10.6 17.7 12.8 16.5 14.6" stroke="#ff9ccf" strokeWidth="1.4" strokeLinecap="round" fill="none" /><path d="M13.9 6.2C14.8 4.7 16.4 4.1 17.9 4.7L18.6 6.7C17.1 7.5 15.5 8 13.9 6.2Z" fill="#9a5cc8" /><path d="M18 4.8C18.4 3.6 19.2 2.9 20.4 2.5" stroke="#9a5cc8" strokeWidth="1.8" strokeLinecap="round" fill="none" /></svg>
      </div>
    ),
    { ...size }
  );
}
