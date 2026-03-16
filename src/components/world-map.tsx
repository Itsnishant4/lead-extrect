"use client";

import { useMemo } from "react";

interface UserLocation {
  id: number;
  name: string;
  email: string;
  country: string | null;
  city: string | null;
  latitude: number | null;
  longitude: number | null;
  lastActive: Date | null;
}

interface WorldMapProps {
  locations: UserLocation[];
  activeCount: number;
}

function latLongToXY(lat: number, long: number): { x: number; y: number } {
  const x = ((long + 180) / 360) * 100;
  const y = ((90 - lat) / 180) * 100;
  return { x, y };
}

export function WorldMap({ locations, activeCount }: WorldMapProps) {
  const dots = useMemo(() => {
    return locations
      .filter((loc) => loc.latitude !== null && loc.longitude !== null)
      .map((loc) => ({
        ...loc,
        ...latLongToXY(loc.latitude!, loc.longitude!),
      }));
  }, [locations]);

  return (
    <div className="relative w-full h-[300px] bg-slate-900 rounded-lg overflow-hidden">
      <svg viewBox="0 0 100 50" className="w-full h-full">
        <defs>
          <linearGradient id="mapGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1e293b" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>
          <radialGradient id="dotGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="1" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
          </radialGradient>
        </defs>

        <rect width="100" height="50" fill="url(#mapGradient)" />

        <g fill="none" stroke="#334155" strokeWidth="0.15">
          {[...Array(19)].map((_, i) => (
            <line key={`h${i}`} x1="0" y1={i * 5} x2="100" y2={i * 5} />
          ))}
          {[...Array(37)].map((_, i) => (
            <line key={`v${i}`} x1={i * 5} y1="0" x2={i * 5} y2="50" />
          ))}
        </g>

        <g fill="none" stroke="#475569" strokeWidth="0.2">
          <ellipse cx="50" cy="25" rx="48" ry="23" />
          <ellipse cx="50" cy="25" rx="30" ry="14" />
          <ellipse cx="50" cy="25" rx="10" ry="5" />
        </g>

        <path
          d="M20,8 Q25,7 30,8 Q35,9 40,8 Q45,7 50,8 Q55,9 60,8 Q65,7 70,8 Q75,9 80,8"
          fill="none"
          stroke="#475569"
          strokeWidth="0.15"
          opacity="0.5"
        />
        <path
          d="M15,15 Q25,14 35,15 Q45,16 55,15 Q65,14 75,15 Q85,16 90,15"
          fill="none"
          stroke="#475569"
          strokeWidth="0.15"
          opacity="0.5"
        />
        <path
          d="M10,25 Q25,24 40,25 Q55,26 70,25 Q85,24 95,25"
          fill="none"
          stroke="#475569"
          strokeWidth="0.15"
          opacity="0.5"
        />
        <path
          d="M15,35 Q25,34 35,35 Q45,36 55,35 Q65,34 75,35 Q85,36 90,35"
          fill="none"
          stroke="#475569"
          strokeWidth="0.15"
          opacity="0.5"
        />
        <path
          d="M20,42 Q30,41 40,42 Q50,43 60,42 Q70,41 80,42"
          fill="none"
          stroke="#475569"
          strokeWidth="0.15"
          opacity="0.5"
        />

        {dots.map((dot, idx) => {
          const isActive = dot.latitude && dot.longitude && 
            locations.some(l => l.id === dot.id && l.lastActive);
          return (
            <g key={dot.id || idx}>
              {isActive && (
                <circle
                  cx={dot.x}
                  cy={dot.y}
                  r="2"
                  fill="url(#dotGlow)"
                  className="animate-pulse"
                />
              )}
              <circle
                cx={dot.x}
                cy={dot.y}
                r={isActive ? "0.8" : "0.5"}
                fill={isActive ? "#60a5fa" : "#3b82f6"}
                opacity={isActive ? 1 : 0.6}
              />
            </g>
          );
        })}
      </svg>

      <div className="absolute top-3 left-3 bg-black/50 backdrop-blur-sm rounded-lg px-3 py-2">
        <div className="text-2xl font-bold text-white">{activeCount}</div>
        <div className="text-xs text-blue-300">Active Now</div>
      </div>

      <div className="absolute bottom-3 right-3 flex items-center gap-2 bg-black/50 backdrop-blur-sm rounded-lg px-3 py-2">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
          <span className="text-xs text-gray-300">Active</span>
        </div>
        <div className="flex items-center gap-1.5 ml-2">
          <div className="w-2 h-2 rounded-full bg-blue-600" />
          <span className="text-xs text-gray-300">Total</span>
        </div>
      </div>
    </div>
  );
}
