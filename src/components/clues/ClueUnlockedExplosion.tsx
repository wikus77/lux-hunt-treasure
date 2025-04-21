
import React, { useEffect, useRef, useState } from "react";

// Palette di esplosione ispirata all'effetto video
const EXPLOSION_COLORS = [
  "#F97316", // bright orange
  "#33C3F0", // sky blue
  "#D946EF", // magenta pink
  "#8B5CF6", // vivid purple
  "#FDE1D3", // peach
  "#FFDEE2", // soft pink
  "#FEC6A1", // soft orange
  "#F2FCE2", // soft green
  "#D3E4FD", // soft blue
  "#FEF7CD", // soft yellow
  "#E5DEFF", // soft purple
];

interface Props {
  open: boolean;
  onFinish: () => void;
}

type PowderRay = {
  angle: number;
  color: string;
  scale: number;
  delay: number;
  duration: number;
  startSize: number;
  endSize: number;
  blur: number;
  opacity: number;
};

const RAY_COUNT = 18;

function genPowderRays(): PowderRay[] {
  // Genera "rays" che simulano la polvere a raggiera, con molta varietà tra i toni e formati per un effetto naturale
  const rays: PowderRay[] = [];
  for (let i = 0; i < RAY_COUNT; i++) {
    const angle = (i / RAY_COUNT) * 360 + Math.random() * 12 - 6;
    rays.push({
      angle,
      color: EXPLOSION_COLORS[i % EXPLOSION_COLORS.length],
      scale: 0.8 + Math.random() * 0.85,
      blur: 5 + Math.random() * 10,
      opacity: 0.48 + Math.random() * 0.27,
      delay: Math.random() * 0.11,
      duration: 0.78 + Math.random() * 0.28,
      startSize: 60 + Math.random() * 40,
      endSize: 175 + Math.random() * 60,
    });
  }
  return rays;
}

const ClueUnlockedExplosion: React.FC<Props> = ({ open, onFinish }) => {
  const [showFadeOut, setShowFadeOut] = useState(false);
  const [rays, setRays] = useState<PowderRay[]>([]);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (open) {
      setRays(genPowderRays());
      setShowFadeOut(false);

      // Timing: esplosione visibile per 1.4s, fade-out finale 700ms
      timeoutRef.current = setTimeout(() => {
        setShowFadeOut(true);
        setTimeout(() => {
          onFinish();
        }, 700);
      }, 1400);
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
        transition-opacity duration-500
        ${showFadeOut ? "animate-fade-out" : "animate-fade-in"}
        overflow-hidden 
      `}
    >
      {/* RAYS polvere */}
      <div className="absolute inset-0 pointer-events-none select-none">
        {rays.map((ray, idx) => (
          <span
            key={idx}
            className="absolute left-1/2 top-1/2 origin-center"
            style={{
              // Spara verso l'esterno lungo l'angolo scelto
              transform: `
                rotate(${ray.angle}deg)
                translateY(-18%)
                scale(${ray.scale})
              `,
              zIndex: 10 + idx,
              pointerEvents: "none",
              animation: `
                powderRayGrow ${ray.duration}s ${ray.delay}s cubic-bezier(.3,.8,.45,1.2) forwards,
                powderRayFade ${ray.duration + 0.18}s ${ray.delay}s linear forwards
              `
            }}
          >
            {/* La "polvere" è un blob ellittico che cresce e si dissolve */}
            <span
              className=""
              style={{
                display: "block",
                width: ray.startSize,
                height: ray.startSize * 0.58,
                background: `radial-gradient(ellipse 60% 49% at 50% 50%, ${ray.color} 88%, transparent 100%)`,
                filter: `blur(${ray.blur}px)`,
                opacity: ray.opacity,
                borderRadius: "43% 57% 58% 42% / 62% 41% 59% 38%",
                transition: "none"
              }}
            ></span>
          </span>
        ))}
      </div>
      {/* Overlay centrale con scale-in e fade */}
      <div
        className={`
            relative z-[1010] flex flex-col items-center justify-center
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
      {/* Keyframes powderRayGrow e powderRayFade (solo qui, inline style tag) */}
      <style>
        {`
        @keyframes powderRayGrow {
          0% {
            opacity: 0;
            transform: scale(0.23) translateY(-30%) rotate(0deg);
          }
          20% {
            opacity: 1;
          }
          85% {
            opacity: 1;
          }
          100% {
            transform: scale(1.78) translateY(-145%) rotate(0deg);
            opacity: 0;
          }
        }
        @keyframes powderRayFade {
          0% { opacity: 0.5; }
          13% { opacity: 1; }
          60% { opacity: 0.78; }
          100% { opacity: 0; }
        }
        `}
      </style>
    </div>
  );
};

export default ClueUnlockedExplosion;
