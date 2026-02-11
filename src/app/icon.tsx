import { ImageResponse } from "next/og";

// Image metadata
export const size = {
    width: 32,
    height: 32,
};
export const contentType = "image/png";

// Image generation
export default function Icon() {
    return new ImageResponse(
        (
            // ImageResponse JSX element
            <div
                style={{
                    fontSize: 24,
                    background: "transparent",
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                }}
            >
                <svg
                    width="100%"
                    height="100%"
                    viewBox="30 30 200 200"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <rect
                        x="64"
                        y="64"
                        width="128"
                        height="128"
                        rx="35"
                        stroke="#1F2937"
                        strokeWidth="24"
                        fill="#1192EC"
                    />
                    <circle cx="160" cy="96" r="20" fill="white" />
                </svg>
            </div>
        ),
        // ImageResponse options
        {
            // For convenience, we can re-use the exported icons size metadata
            // config to also set the ImageResponse's width and height.
            ...size,
        }
    );
}
