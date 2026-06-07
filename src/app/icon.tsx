import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

// Favicon: "KD" on the brand accent. Generated, so it stays crisp + recolorable.
export default function Icon() {
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
          fontSize: 16,
          fontWeight: 800,
          letterSpacing: -1,
          fontFamily: "sans-serif",
          borderRadius: 7,
        }}
      >
        KD
      </div>
    ),
    { ...size }
  );
}
