import { ImageResponse } from "next/og";

export const alt = "Infinity Planners — Bespoke New York Events";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)",
          fontFamily: "serif",
        }}
      >
        <div
          style={{
            width: 80,
            height: 2,
            background: "#D4AF37",
            marginBottom: 32,
          }}
        />

        <h1
          style={{
            fontSize: 64,
            fontWeight: 400,
            color: "#ffffff",
            textAlign: "center",
            letterSpacing: "0.3em",
            margin: 0,
            lineHeight: 1.2,
            textTransform: "uppercase",
          }}
        >
          Infinity
        </h1>

        <p
          style={{
            fontSize: 24,
            color: "#D4AF37",
            textAlign: "center",
            letterSpacing: "0.5em",
            margin: "8px 0 0",
            textTransform: "uppercase",
          }}
        >
          Planners
        </p>

        <p
          style={{
            fontSize: 16,
            color: "#999999",
            textAlign: "center",
            letterSpacing: "0.2em",
            marginTop: 32,
            textTransform: "uppercase",
          }}
        >
          Bespoke New York Events, Masterfully Orchestrated
        </p>

        <div
          style={{
            width: 80,
            height: 2,
            background: "#D4AF37",
            marginTop: 32,
          }}
        />
      </div>
    ),
    {
      ...size,
    },
  );
}
