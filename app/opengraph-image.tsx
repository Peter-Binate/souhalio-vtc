import { ImageResponse } from "next/og";
import { BUSINESS } from "@/lib/constants";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#18181b",
          color: "#fafafa",
          fontSize: 64,
          fontWeight: 600,
        }}
      >
        {BUSINESS.name}
        <div style={{ fontSize: 28, fontWeight: 400, marginTop: 16, color: "#d4d4d8" }}>
          Chauffeur VTC — Île-de-France, 24h/24 et 7j/7
        </div>
      </div>
    ),
    size,
  );
}
