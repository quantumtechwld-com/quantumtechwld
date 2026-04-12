import { ImageResponse } from "next/og";

export const alt = "QuantumTech — Agência de Desenvolvimento de Software e Automação";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#050816",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        {/* Glow orb */}
        <div
          style={{
            position: "absolute",
            top: "10%",
            left: "5%",
            width: 500,
            height: 500,
            borderRadius: "50%",
            background: "rgba(6,182,212,0.12)",
            filter: "blur(80px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "10%",
            right: "5%",
            width: 400,
            height: 400,
            borderRadius: "50%",
            background: "rgba(139,92,246,0.12)",
            filter: "blur(70px)",
          }}
        />

        {/* Badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            border: "1px solid rgba(6,182,212,0.3)",
            borderRadius: 999,
            padding: "8px 20px",
            marginBottom: 32,
            color: "#67e8f9",
            fontSize: 20,
          }}
        >
          Agência de Software
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: 72,
            fontWeight: 800,
            color: "white",
            marginBottom: 24,
            textAlign: "center",
            lineHeight: 1.1,
          }}
        >
          QuantumTech
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: 28,
            color: "#94a3b8",
            textAlign: "center",
            maxWidth: 800,
            lineHeight: 1.5,
          }}
        >
          Desenvolvimento Web · Sistemas sob Medida · IA & Automação n8n
        </div>
      </div>
    ),
    size
  );
}
