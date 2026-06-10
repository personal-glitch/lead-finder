import { ImageResponse } from "next/og";

// Vorschaubild für Link-Previews (WhatsApp, LinkedIn, X …).
export const alt = "KundenRadar – Neukunden finden, anrufen & mailen";
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
          justifyContent: "space-between",
          background: "#0a0f06",
          padding: "72px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <div
            style={{
              width: "64px",
              height: "64px",
              borderRadius: "16px",
              background: "#a8e83a",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "34px",
            }}
          >
            📡
          </div>
          <div style={{ color: "#ffffff", fontSize: "40px", fontWeight: 700 }}>KundenRadar</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ color: "#ffffff", fontSize: "68px", fontWeight: 800, lineHeight: 1.1, letterSpacing: "-1px" }}>
            Neue Kunden finden –
          </div>
          <div style={{ color: "#a8e83a", fontSize: "68px", fontWeight: 800, lineHeight: 1.1, letterSpacing: "-1px" }}>
            anrufen &amp; mailen.
          </div>
          <div style={{ color: "#9aa3ad", fontSize: "30px", marginTop: "24px" }}>
            Anrufbare B2B-Firmen mit Telefon &amp; Ansprechpartner – alles in einem Tool.
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ color: "#a8e83a", fontSize: "28px", fontWeight: 600 }}>seciora-solutions.de</div>
          <div style={{ color: "#6b7280", fontSize: "24px" }}>DSGVO-konform · 50+ Branchen</div>
        </div>
      </div>
    ),
    { ...size },
  );
}
