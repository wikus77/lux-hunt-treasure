
import React, { useEffect, useRef, useState } from "react";

interface Props {
  open: boolean;
  onFinish: () => void;
}

const POWDER_COLORS = [
  "bg-yellow-300",
  "bg-green-400",
  "bg-blue-500",
  "bg-pink-400",
  "bg-purple-400",
  "bg-orange-400",
  "bg-fuchsia-400",
  "bg-red-400",
  "bg-emerald-400",
  "bg-cyan-400",
  "bg-rose-400",
  "bg-lime-300"
];

type Particle = {
  left: number;
  top: number;
  size: number;
  color: string;
  angle: number;    // Traiettoria (in radianti)
  distance: number; // Quanto viaggia
  delay: number;    // Per effetto "ritardo" all'esplosione
};

const PARTICLE_COUNT = 36;

function generateParticles(): Particle[] {
  // Particelle generate tutte dal centro, direzioni random su raggio
  const particles: Particle[] = [];
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const angle = (i / PARTICLE_COUNT) * 2 * Math.PI + (Math.random() - 0.5) * 0.4;
    const distance = 120 + Math.random() * 64; // px
    const size = 24 + Math.random() * 32;
    const left = 50 + Math.cos(angle) * 7; // posizione iniziale: centro + piccola "varianza"
    const top = 50 + Math.sin(angle) * 5;
    const color = POWDER_COLORS[Math.floor(Math.random() * POWDER_COLORS.length)];
    const delay = Math.random() * 0.15; // s
    particles.push({ left, top, color, angle, distance, size, delay });
  }
  return particles;
}

const ClueUnlockedExplosion: React.FC<Props> = ({ open, onFinish }) => {
  const [showFadeOut, setShowFadeOut] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (open) {
      setParticles(generateParticles());
      setShowFadeOut(false);
      // Scompare effetto fade dopo ~1.8s (esplosione), poi callback finale
      timeoutRef.current = setTimeout(() => {
        setShowFadeOut(true);
        setTimeout(() => {
          onFinish();
        }, 550); // tempo per la fade-out
      }, 1750);
    }
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [open, onFinish]);

  if (!open) return null;

  return (
    <div
      // fade-in all'apertura, fade-out quando showFadeOut è true
      className={`fixed inset-0 z-[1000] flex items-center justify-center bg-black/90 transition-all duration-500 ${showFadeOut ? "animate-fade-out" : "animate-fade-in"} overflow-hidden`}
    >
      {/* Particelle */}
      <div className="absolute inset-0 pointer-events-none">
        {particles.map((p, idx) => {
          // Calcola la destinazione finale
          const tx = Math.cos(p.angle) * p.distance;
          const ty = Math.sin(p.angle) * p.distance;

          return (
            <span
              key={idx}
              className={`
                absolute rounded-full opacity-70 shadow-lg
                ${p.color}
                transition-all
              `}
              style={{
                width: `${p.size}px`,
                height: `${p.size}px`,
                left: `calc(${p.left}% - ${p.size / 2}px)`,
                top: `calc(${p.top}% - ${p.size / 2}px)`,
                filter: "blur(6px)",
                // Animazione custom: esplode/rimbalza via con dissolvenza
                transition: "transform 1.15s cubic-bezier(0.49,0.67,0.99,1.01), opacity 0.9s linear",
                transitionDelay: `${p.delay}s`,
                transform: showFadeOut
                  ? `translate(${tx * 1.3}px, ${ty * 1.2}px) scale(0.2)`
                  : `translate(0,0) scale(1)`,
                opacity: showFadeOut ? 0 : 0.82
              }}
            />
          );
        })}
      </div>
      {/* Scritta centrale */}
      <div className={`relative z-[1010] flex flex-col items-center justify-center`}>
        <span className="text-4xl md:text-6xl font-extrabold bg-gradient-to-br from-yellow-300 via-fuchsia-400 to-green-500 bg-clip-text text-transparent drop-shadow-[0_0_28px_#39FF14] animate-scale-in">
          Congratulazioni
        </span>
        <span className="block mt-4 text-xl font-semibold text-white animate-fade-in">
          Hai sbloccato un nuovo indizio!
        </span>
      </div>
    </div>
  );
};

export default ClueUnlockedExplosion;
