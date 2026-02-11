
import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "LeadSpotter - Google Maps Lead Extraction Tool";
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
                    background: "linear-gradient(to bottom right, #0f172a, #1e293b)",
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                }}
            >
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginBottom: 40,
                    }}
                >
                    <svg
                        width="150"
                        height="150"
                        viewBox="-50 0 256 256"
                        xmlns="http://www.w3.org/2000/svg"
                        style={{ marginRight: 24 }}
                    >
                        <rect
                            x="64"
                            y="64"
                            width="128"
                            height="128"
                            rx="35"
                            stroke="#1192EC"
                            strokeWidth="16"
                            fill="none"
                        />
                        <circle cx="160" cy="96" r="20" fill="#1192EC" />
                    </svg>
                    <div style={{ display: "flex", fontSize: 80, fontWeight: 800 }}>
                        Lead<span style={{ color: "#1192EC" }}>Spotter</span>
                    </div>
                </div>
                <div
                    style={{
                        fontSize: 36,
                        color: "#94a3b8",
                        textAlign: "center",
                        maxWidth: "80%",
                        lineHeight: 1.4,
                        display: "flex", // Explicitly added display: flex
                    }}
                >
                    Turn Google Maps into your Lead Machine
                </div>
            </div>
        ),
        {
            ...size,
        }
    );
}
