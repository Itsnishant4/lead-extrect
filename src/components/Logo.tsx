import React from "react";

export function Logo({ className = "w-10 h-10" }: { className?: string }) {
    return (
        <svg className={className} width="200" height="200" viewBox="-50 0 256 256" xmlns="http://www.w3.org/2000/svg">


  <rect x="64" y="64" width="128" height="128"
        rx="35"
        stroke="#1F2937"
        stroke-width="16"
        fill="none"/>

  <circle cx="160" cy="96" r="20"
          fill="#1192EC"/>

</svg>

    );
}
