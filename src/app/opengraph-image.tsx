import { Logo } from "@/components/Logo";
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
                    {/* Recreating the Logo SVG structure inline for OG image compatibility */}
                    {/* <div className="size-4 flex items-center justify-center"> */}
                    <Logo  />
                    {/* </div> */}
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
