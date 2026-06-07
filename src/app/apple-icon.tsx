import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// iOS home-screen icon (rounded by the OS, so full-bleed here).
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #5b8cff 0%, #3a64e8 100%)",
          color: "#ffffff",
          fontSize: 92,
          fontWeight: 800,
          letterSpacing: -6,
          fontFamily: "sans-serif",
        }}
      >
        KD
      </div>
    ),
    { ...size }
  );
}
