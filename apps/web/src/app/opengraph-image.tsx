import { ImageResponse } from "next/og";

export const alt = "Ordito — your commands, one tray click away";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#000",
          color: "#fff",
          padding: "72px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 56,
              height: 56,
              borderRadius: 14,
              backgroundColor: "#fff",
              color: "#000",
              fontSize: 32,
              fontWeight: 700,
            }}
          >
            O
          </div>
          <div style={{ display: "flex", fontSize: 30, fontWeight: 600 }}>
            Ordito
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              fontSize: 68,
              fontWeight: 700,
              lineHeight: 1.1,
            }}
          >
            <div style={{ display: "flex" }}>Your commands,</div>
            <div style={{ display: "flex" }}>one tray click away</div>
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 28,
              color: "#a1a1aa",
            }}
          >
            Run, schedule, and track shell commands from the menu bar.
          </div>
        </div>
        <div style={{ display: "flex", gap: 16, fontSize: 24 }}>
          <div
            style={{
              display: "flex",
              padding: "6px 18px",
              border: "1px solid #52525b",
              borderRadius: 999,
            }}
          >
            macOS
          </div>
          <div
            style={{
              display: "flex",
              padding: "6px 18px",
              border: "1px solid #52525b",
              borderRadius: 999,
            }}
          >
            Windows
          </div>
          <div
            style={{
              display: "flex",
              padding: "6px 18px",
              border: "1px solid #52525b",
              borderRadius: 999,
            }}
          >
            Free and open source
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
