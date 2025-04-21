
import React, { useEffect, useRef, useState } from "react";

/**
 * Palette spettacolare per powder/flares.
 * Effetto "holi", con nuance neon e qualche radiale chiara.
 */
const POWDER_COLORS = [
  "#F97316",
  "#33C3F0",
  "#8B5CF6",
  "#FFDEE2",
  "#FDE1D3",
  "#FCF6BD",
  "#F2FCE2",
  "#9b87f5",
  "#FF719A",
  "#F43F5E",
  "#FEC6A1"
];

const FLARE_COLORS = [
  "rgba(255,255,255,0.98)",
  "rgba(251,221,186,0.8)",
  "rgba(183,148,244,0.70)",
  "rgba(116,252,255,0.7)",
  "rgba(252,104,251,0.63)"
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

/**
 * Genera le polveri (flake) radiali tipo burst di holi
 */
const FLAKE_COUNT = 48;
function genFlakes(): Flake[] {
  const arr: Flake[] = [];
  for (let i = 0; i < FLAKE_COUNT; i++) {
    const angle = (i / FLAKE_COUNT) * 360 + Math.random() * 14 - 7;
    arr.push({
      angle,
      color: POWDER_COLORS[Math.floor(Math.random() * POWDER_COLORS.length)],
      distance: 110 + Math.random() * 135,
      scale: 1.2 + Math.random() * 2.6,
      blur: 6 + Math.random() * 20,
      duration: 1.08 + Math.random() * 0.68,
      delay: Math.random() * 0.15,
      opacity: 0.62 + Math.random() * 0.36,
    });
  }
  return arr;
}

/**
 * Ogni "cloud" è un livello di polvere radiale che si espande
 */
function getPowderClouds() {
  return [
    {
      scaleStart: 0.5,
      scaleEnd: 2.9,
      blur: 58,
      opacity: 0.19,
      color: POWDER_COLORS[4],
      duration: 1.25,
      delay: 0.04,
    },
    {
      scaleStart: 0.88,
      scaleEnd: 3.0,
      blur: 82,
      opacity: 0.16,
      color: POWDER_COLORS[2],
      duration: 1.18,
      delay: 0.1
    },
    {
      scaleStart: 0.72,
      scaleEnd: 1.8,
      blur: 38,
      opacity: 0.27,
      color: POWDER_COLORS[7],
      duration: 1.17,
      delay: 0.13
    },
  ];
}

/**
 * Flare burst con animazione radiale e blend additive
 */
function getFlareBursts() {
  return [
    {
      color: FLARE_COLORS[0],
      scaleStart: 0.8,
      scaleEnd: 3.9,
      blur: 42,
      opacity: 0.44,
      duration: 0.58,
      delay: 0,
      zIndex: 998
    },
    {
      color: FLARE_COLORS[1],
      scaleStart: 0.9,
      scaleEnd: 4.6,
      blur: 60,
      opacity: 0.31,
      duration: 0.62,
      delay: 0.08,
      zIndex: 999
    },
    {
      color: FLARE_COLORS[2],
      scaleStart: 0.85,
      scaleEnd: 3.8,
      blur: 34,
      opacity: 0.24,
      duration: 0.85,
      delay: 0.22,
      zIndex: 998
    }
  ];
}

const ClueUnlockedExplosion: React.FC<Props> = ({ open, onFinish }) => {
  const [showFadeOut, setShowFadeOut] = useState(false);
  const [flakes, setFlakes] = useState<Flake[]>([]);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (open) {
      setFlakes(genFlakes());
      setShowFadeOut(false);
      // Ingresso: flare burst e powder cloud in fade-in, poi fade out
      timeoutRef.current = setTimeout(() => {
        setShowFadeOut(true);
        setTimeout(() => {
          onFinish();
        }, 900); // fade out finale
      }, 1650);
    }
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [open, onFinish]);

  if (!open) return null;

  const powderClouds = getPowderClouds();
  const flareBursts = getFlareBursts();

  return (
    <div
      className={`
        fixed inset-0 z-[99999] flex items-center justify-center 
        bg-black/95 overflow-hidden
        transition-opacity
        ${showFadeOut ? "animate-fade-out" : "animate-fade-in"}
      `}
      style={{ backdropFilter: "blur(2.8px)" }}
    >
      {/* Flare burst centrale */}
      <div className="absolute inset-0 pointer-events-none select-none z-[997]">
        {flareBursts.map((flare, idx) => (
          <span
            key={idx}
            className="absolute left-1/2 top-1/2"
            style={{
              zIndex: flare.zIndex || 998,
              pointerEvents: "none",
              animation: `
                flareBurstAnim${idx} ${flare.duration}s ${flare.delay}s cubic-bezier(0.2,0.85,0.42,1) forwards
              `,
              transform: "translate(-50%,-50%) scale(" + flare.scaleStart + ")",
              opacity: flare.opacity
            }}
          >
            <svg
              width={260}
              height={260}
              viewBox="0 0 260 260"
              style={{
                filter: `blur(${flare.blur}px)`,
                mixBlendMode: "screen"
              }}
            >
              <circle
                cx={130}
                cy={130}
                r={92}
                fill={flare.color}
                fillOpacity="0.98"
              />
            </svg>
          </span>
        ))}
      </div>
      {/* Powder clouds levels */}
      <div className="absolute inset-0 pointer-events-none select-none z-[996]">
        {powderClouds.map((cloud, idx) => (
          <span
            key={idx}
            className="absolute left-1/2 top-1/2"
            style={{
              zIndex: 950 + idx,
              pointerEvents: "none",
              animation: `
                powderCloudAnim${idx} ${cloud.duration}s ${cloud.delay}s cubic-bezier(0.22,0.74,0.47,1) forwards
              `,
              transform: "translate(-50%,-50%) scale(" + cloud.scaleStart + ")",
              opacity: cloud.opacity
            }}
          >
            <svg
              width={420}
              height={420}
              viewBox="0 0 420 420"
              style={{
                filter: `blur(${cloud.blur}px)`,
                mixBlendMode: "lighten"
              }}
            >
              <ellipse
                cx={210}
                cy={210}
                rx={155}
                ry={132}
                fill={cloud.color}
                fillOpacity="0.67"
              />
            </svg>
          </span>
        ))}
      </div>
      {/* Flake burst (particelle di polvere colorata) */}
      <div className="absolute inset-0 pointer-events-none select-none z-[1000]">
        {flakes.map((flake, idx) => (
          <span
            key={idx}
            className="absolute left-1/2 top-1/2"
            style={{
              zIndex: 1040 + idx,
              pointerEvents: "none",
              animation: `
                flakeExplosion2 ${flake.duration}s ${flake.delay}s cubic-bezier(0.27,0.99,0.38,1) forwards,
                flakeFade2 ${flake.duration + 0.25}s ${flake.delay}s linear forwards
              `,
              transform: `rotate(${flake.angle}deg)`,
              opacity: flake.opacity
            }}
          >
            <svg
              width={24 * flake.scale}
              height={20 * flake.scale}
              viewBox="0 0 28 20"
              style={{
                filter: `blur(${flake.blur}px)`
              }}
            >
              <ellipse
                cx="14"
                cy="10"
                rx={`${9 + Math.random() * 6}`}
                ry={`${6 + Math.random() * 4}`}
                fill={flake.color}
                fillOpacity="0.95"
              />
            </svg>
          </span>
        ))}
      </div>
      {/* Overlay centrale: congratulazioni */}
      <div
        className={`
          relative z-[1200] flex flex-col items-center justify-center
          ${showFadeOut ? "animate-fade-out" : "animate-scale-in"}
        `}
      >
        <span className="text-5xl md:text-6xl font-extrabold bg-gradient-to-br from-yellow-200 via-fuchsia-400 to-green-300 bg-clip-text text-transparent drop-shadow-[0_0_28px_#39FF14] animate-pulse mb-2">
          Congratulazioni!
        </span>
        <span className="block mt-6 text-2xl font-semibold text-white animate-fade-in">
          Hai sbloccato un nuovo indizio 🎉
        </span>
      </div>
      {/* Custom animations */}
      <style>
        {`
        /* Flare burst espande in radiale e dissolve */
        @keyframes flareBurstAnim0 {
          0% { 
            transform: translate(-50%,-50%) scale(0.8); 
            opacity:0.33;
            filter: blur(26px);
          }
          65% { 
            opacity:0.66; 
            filter: blur(41px); 
          }
          100% { 
            transform: translate(-50%,-50%) scale(3.9); 
            opacity:0; 
            filter: blur(73px);
          }
        }
        @keyframes flareBurstAnim1 {
          0% { 
            transform: translate(-50%,-50%) scale(0.9); 
            opacity:0.18;
            filter: blur(49px);
          }
          75% { opacity:0.4; filter: blur(71px);}
          100% { 
            transform: translate(-50%,-50%) scale(4.6); 
            opacity:0; 
            filter: blur(120px);
          }
        }
        @keyframes flareBurstAnim2 {
          0% { 
            transform: translate(-50%,-50%) scale(0.85); 
            opacity:0.1;
            filter: blur(18px);
          }
          60% { opacity:0.25; filter: blur(42px);}
          100% { 
            transform: translate(-50%,-50%) scale(3.8); 
            opacity:0; 
            filter: blur(68px); 
          }
        }
        /* Powder cloud espansione e dissolve radiale */
        @keyframes powderCloudAnim0 {
          0% { 
            transform: translate(-50%,-50%) scale(0.5); 
            opacity: 0.05; 
            filter: blur(21px);
          }
          47%{opacity:0.19;filter:blur(60px);}
          65% { opacity:0.23;}
          100% { 
            transform: translate(-50%,-50%) scale(2.9); 
            opacity:0; 
            filter: blur(115px);
          }
        }
        @keyframes powderCloudAnim1 {
          0% { 
            transform: translate(-50%,-50%) scale(0.88); 
            opacity:0.03;
            filter: blur(18px);
          }
          77%{opacity:0.16;}
          100% { 
            transform: translate(-50%,-50%) scale(3.0); 
            opacity:0; 
            filter: blur(202px);
          }
        }
        @keyframes powderCloudAnim2 {
          0% { 
            transform: translate(-50%,-50%) scale(0.72); 
            opacity: 0.04;
            filter: blur(9px);
          }
          57%{opacity:0.27;filter:blur(39px);}
          100%{ 
            transform: translate(-50%,-50%) scale(1.8);
            opacity:0;filter:blur(86px);}
        }
        /* Powder particelle radiali dinamiche e decrescenti */
        @keyframes flakeExplosion2 {
          0% {
            transform: rotate(var(--start-angle, 0deg)) translateY(0px) scale(0.66);
            opacity: 0.01;
          }
          13% { opacity: 1;}
          82% { opacity: 1;}
          100% {
            transform: rotate(var(--start-angle, 0deg)) translateY(-${flakes[0]?.distance || 120}px) scale(1.44);
            opacity: 0;
          }
        }
        @keyframes flakeFade2 {
          0% { opacity: 0.55; }
          21% { opacity: 1; }
          80% { opacity: 0.83; }
          100% { opacity: 0; }
        }
        `}
      </style>
    </div>
  );
};

export default ClueUnlockedExplosion;
