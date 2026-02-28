import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "LeadSpotter — Turn Maps into your Lead Machine";
export const size = {
    width: 1920,
    height: 1080,
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
                    position: "relative",
                    fontFamily: "Inter, system-ui, sans-serif",
                    overflow: "hidden",
                    background: "#FAFAFE",
                }}
            >
                {/* ── Background: subtle gradient wash ── */}
                <div
                    style={{
                        position: "absolute",
                        inset: 0,
                        display: "flex",
                        background:
                            "linear-gradient(145deg, #EEF2FF 0%, #F5F3FF 25%, #FFFFFF 50%, #EEF2FF 75%, #F5F3FF 100%)",
                    }}
                />

                {/* ── Decorative orb — top right ── */}
                <div
                    style={{
                        position: "absolute",
                        top: "-120px",
                        right: "-80px",
                        width: "600px",
                        height: "600px",
                        borderRadius: "9999px",
                        background:
                            "radial-gradient(circle, rgba(99,102,241,0.12) 0%, rgba(139,92,246,0.06) 40%, transparent 70%)",
                        display: "flex",
                    }}
                />

                {/* ── Decorative orb — bottom left ── */}
                <div
                    style={{
                        position: "absolute",
                        bottom: "-150px",
                        left: "-100px",
                        width: "500px",
                        height: "500px",
                        borderRadius: "9999px",
                        background:
                            "radial-gradient(circle, rgba(139,92,246,0.10) 0%, rgba(59,130,246,0.05) 40%, transparent 70%)",
                        display: "flex",
                    }}
                />

                {/* ── Decorative orb — center ── */}
                <div
                    style={{
                        position: "absolute",
                        top: "300px",
                        left: "50%",
                        width: "800px",
                        height: "400px",
                        borderRadius: "9999px",
                        background:
                            "radial-gradient(ellipse, rgba(99,102,241,0.05) 0%, transparent 60%)",
                        display: "flex",
                        transform: "translateX(-50%)",
                    }}
                />

                {/* ── Main content card — centered with border (Olive-style) ── */}
                <div
                    style={{
                        position: "absolute",
                        top: "60px",
                        left: "80px",
                        right: "80px",
                        bottom: "60px",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: "48px",
                        border: "1.5px solid rgba(199,210,254,0.6)",
                        background:
                            "linear-gradient(180deg, rgba(238,242,255,0.5) 0%, rgba(255,255,255,0.9) 40%, rgba(255,255,255,0.95) 100%)",
                    }}
                >
                    {/* ── Logo + brand ── */}
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "16px",
                            marginBottom: "40px",
                        }}
                    >
                        {/* Logo SVG */}
                        <svg
                            width="64"
                            height="64"
                            viewBox="-20 0 256 256"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <rect
                                x="64"
                                y="64"
                                width="128"
                                height="128"
                                rx="35"
                                stroke="#1E1B4B"
                                strokeWidth="16"
                                fill="none"
                            />
                            <circle cx="160" cy="96" r="20" fill="#6366F1" />
                        </svg>
                        <span
                            style={{
                                fontSize: "42px",
                                fontWeight: 800,
                                color: "#1E1B4B",
                                letterSpacing: "-0.5px",
                            }}
                        >
                            Lead
                            <span style={{ color: "#6366F1" }}>Spotter</span>
                        </span>
                    </div>

                    {/* ── Main headline ── */}
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: "8px",
                            marginBottom: "32px",
                        }}
                    >
                        <span
                            style={{
                                fontSize: "84px",
                                fontWeight: 800,
                                color: "#111827",
                                letterSpacing: "-2px",
                                lineHeight: 1.1,
                                textAlign: "center",
                            }}
                        >
                            Turn Maps
                        </span>
                        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
                            <span
                                style={{
                                    fontSize: "84px",
                                    fontWeight: 800,
                                    color: "#111827",
                                    letterSpacing: "-2px",
                                    lineHeight: 1.1,
                                }}
                            >
                                into your
                            </span>
                            <span
                                style={{
                                    fontSize: "84px",
                                    fontWeight: 800,
                                    letterSpacing: "-2px",
                                    lineHeight: 1.1,
                                    background:
                                        "linear-gradient(135deg, #8B5CF6 0%, #6366F1 50%, #3B82F6 100%)",
                                    backgroundClip: "text",
                                    color: "transparent",
                                }}
                            >
                                Lead Machine
                            </span>
                        </div>
                    </div>

                    {/* ── Subtitle ── */}
                    <span
                        style={{
                            fontSize: "30px",
                            color: "#6B7280",
                            textAlign: "center",
                            maxWidth: "900px",
                            lineHeight: 1.5,
                            marginBottom: "56px",
                            fontWeight: 400,
                        }}
                    >
                        Extract verified business leads in bulk.
                        Automate your prospecting — while you focus on closing deals.
                    </span>

                    {/* ── Feature pills row ── */}
                    <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "48px" }}>
                        {[
                            { icon: "✉", label: "Verified Emails" },
                            { icon: "📞", label: "Phone Numbers" },
                            { icon: "🌐", label: "Worldwide Data" },
                            { icon: "☁", label: "Cloud Processing" },
                            { icon: "📊", label: "CSV Export" },
                        ].map((pill) => (
                            <div
                                key={pill.label}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "10px",
                                    padding: "12px 24px",
                                    borderRadius: "9999px",
                                    background: "rgba(255,255,255,0.8)",
                                    border: "1px solid rgba(199,210,254,0.5)",
                                    fontSize: "18px",
                                    fontWeight: 600,
                                    color: "#4338CA",
                                }}
                            >
                                <span style={{ fontSize: "20px" }}>{pill.icon}</span>
                                {pill.label}
                            </div>
                        ))}
                    </div>

                    {/* ── CTA button (static representation) ── */}
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                            padding: "18px 48px",
                            borderRadius: "9999px",
                            background:
                                "linear-gradient(135deg, #8B5CF6 0%, #6366F1 50%, #3B82F6 100%)",
                            fontSize: "24px",
                            fontWeight: 700,
                            color: "white",
                            letterSpacing: "-0.2px",
                        }}
                    >
                        Start for Free 
                        <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="white"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                    </div>

                    {/* ── Social proof ── */}
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                            marginTop: "36px",
                        }}
                    >
                        {/* Avatar stack */}
                        <div style={{ display: "flex" }}>
                            {["#818CF8", "#A78BFA", "#60A5FA", "#C084FC", "#22D3EE"].map(
                                (color, i) => (
                                    <div
                                        key={i}
                                        style={{
                                            width: "36px",
                                            height: "36px",
                                            borderRadius: "9999px",
                                            background: color,
                                            border: "2.5px solid white",
                                            marginLeft: i > 0 ? "-10px" : "0",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            fontSize: "12px",
                                            fontWeight: 700,
                                            color: "white",
                                        }}
                                    >
                                        {["RM", "PS", "AG", "SC", "VP"][i]}
                                    </div>
                                )
                            )}
                        </div>
                        <span style={{ fontSize: "18px", color: "#6B7280", fontWeight: 500 }}>
                            Join{" "}
                            <span style={{ fontWeight: 700, color: "#6366F1" }}>2,000+</span>{" "}
                            sales teams
                        </span>
                        <span style={{ color: "#D1D5DB", margin: "0 4px" }}>|</span>
                        <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                            {[1, 2, 3, 4, 5].map((i) => (
                                <svg
                                    key={i}
                                    width="18"
                                    height="18"
                                    viewBox="0 0 24 24"
                                    fill="#FBBF24"
                                    stroke="#FBBF24"
                                    strokeWidth="1"
                                >
                                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                                </svg>
                            ))}
                            <span
                                style={{
                                    fontSize: "18px",
                                    fontWeight: 700,
                                    color: "#6B7280",
                                    marginLeft: "4px",
                                }}
                            >
                                4.9/5
                            </span>
                        </span>
                    </div>
                </div>

                {/* ── URL / domain watermark ── */}
                <div
                    style={{
                        position: "absolute",
                        bottom: "80px",
                        right: "120px",
                        display: "flex",
                        fontSize: "20px",
                        fontWeight: 600,
                        color: "#A5B4FC",
                        letterSpacing: "0.5px",
                    }}
                >
                    leadspotter.in
                </div>
            </div>
        ),
        {
            ...size,
        }
    );
}
