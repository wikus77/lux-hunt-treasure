
import React, { useEffect, useRef, useState } from "react";

// Nuova palette di colori vivaci
const EXPLOSION_COLORS = [
  "#F97316", // bright orange
  "#33C3F0", // sky blue
  "#D946EF", // magenta pink
  "#8B5CF6", // vivid purple
  "#FEF7CD", // soft yellow
  "#F2FCE2", // soft green
  "#FEC6A1", // soft orange
  "#FFDEE2", // soft pink
  "#D3E4FD", // soft blue
  "#E5DEFF", // soft purple
  "#FDE1D3", // peach
];

interface Props {
  open: boolean;
  onFinish: () => void;
}

type Flake = {
  angle: number;
  color: string;
  distance: number;
  scale: number;
  blur: number;
  duration: number;
  delay: number;
  opacity: number;
};

const FLAKE_COUNT = 36;

function genFlakes(): Flake[] {
  const arr: Flake[] = [];
  for (let i = 0; i < FLAKE_COUNT; i++) {
    const angle = (i / FLAKE_COUNT) * 360 + Math.random() * 18 - 9;
    arr.push({
      angle,
      color: EXPLOSION_COLORS[i % EXPLOSION_COLORS.length],
      distance: 122 + Math.random() * 70,
      scale: 0.7 + Math.random() * 1.5,
      blur: 6 + Math.random() * 14,
      duration: 0.96 + Math.random() * 0.55,
      delay: Math.random() * 0.07,
      opacity: 0.45 + Math.random() * 0.4,
    });
  }
  return arr;
}

const ClueUnlockedExplosion: React.FC<Props> = ({ open, onFinish }) => {
  const [showFadeOut, setShowFadeOut] = useState(false);
  const [flakes, setFlakes] = useState<Flake[]>([]);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (open) {
      setFlakes(genFlakes());
      setShowFadeOut(false);
      // L'esplosione dura 1.5s, poi fade-out in 0.9s
      timeoutRef.current = setTimeout(() => {
        setShowFadeOut(true);
        setTimeout(() => {
          onFinish();
        }, 900);
      }, 1500);
    }
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [open, onFinish]);

  if (!open) return null;

  return (
    <div
      className={`
        fixed inset-0 z-[99999] flex items-center justify-center bg-black/95
        overflow-hidden
        transition-opacity duration-500
        ${showFadeOut ? "animate-fade-out" : "animate-fade-in"}
      `}
    >
      {/* Nuovi flakes: effetto particelle/polvere */}
      <div className="absolute inset-0 pointer-events-none select-none">
        {flakes.map((flake, idx) => (
          <span
            key={idx}
            className="absolute left-1/2 top-1/2"
            style={{
              zIndex: 20 + idx,
              pointerEvents: "none",
              animation: `
                flakeExplosion ${flake.duration}s ${flake.delay}s cubic-bezier(0.23,1,0.32,1) forwards,
                flakeFade ${flake.duration + 0.21}s ${flake.delay}s linear forwards
              `,
              transform: `rotate(${flake.angle}deg)`,
              opacity: flake.opacity,
            }}
          >
            {/* Ogni flake è una forma organica, leggermente ellittica */}
            <svg
              width={26 * flake.scale}
              height={20 * flake.scale}
              viewBox="0 0 26 20"
              fill="none"
              style={{
                filter: `blur(${flake.blur}px)`
              }}
            >
              <ellipse
                cx="13"
                cy="10"
                rx={`${10 + Math.random() * 4}`}
                ry={`${7 + Math.random() * 3}`}
                fill={flake.color}
                fillOpacity="0.96"
              />
            </svg>
          </span>
        ))}
      </div>
      {/* Overlay centrale animato */}
      <div
        className={`
          relative z-[1020] flex flex-col items-center justify-center
          ${showFadeOut ? "animate-fade-out" : "animate-scale-in"}
        `}
      >
        <span className="text-4xl md:text-6xl font-extrabold bg-gradient-to-br from-yellow-300 via-fuchsia-400 to-green-500 bg-clip-text text-transparent drop-shadow-[0_0_28px_#39FF14] animate-scale-in">
          Congratulazioni
        </span>
        <span className="block mt-4 text-xl font-semibold text-white animate-fade-in">
          Hai sbloccato un nuovo indizio!
        </span>
      </div>
      {/* Definizione animazioni custom */}
      <style>
        {`
        @keyframes flakeExplosion {
          0% {
            transform: rotate(var(--start-angle, 0deg)) translateY(0) scale(0.52);
            opacity: 0;
          }
          14% {
            opacity: 1;
          }
          80% {
            opacity: 1;
          }
          100% {
            transform: rotate(var(--start-angle, 0deg)) translateY(-${flakes[0]?.distance || 130}px) scale(1.35);
            opacity: 0;
          }
        }
        @keyframes flakeFade {
          0% { opacity: 0.6; }
          20% { opacity: 1; }
          75% { opacity: 0.7; }
          100% { opacity: 0; }
        }
        `}
      </style>
    </div>
  );
};

export default ClueUnlockedExplosion;
