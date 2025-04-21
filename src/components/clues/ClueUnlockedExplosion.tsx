
import React, { useEffect } from "react";

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
];

const ClueUnlockedExplosion: React.FC<Props> = ({ open, onFinish }) => {
  useEffect(() => {
    if (open) {
      const timeout = setTimeout(() => onFinish(), 2200);
      return () => clearTimeout(timeout);
    }
  }, [open, onFinish]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/90 animate-fade-in overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        {POWDER_COLORS.map((color, idx) => (
          <div
            key={color}
            className={`
              absolute rounded-full ${color} opacity-60
              animate-[explode_1.5s_cubic-bezier(0.44,0.66,0.95,1.05)_forwards]
              ${idx === 0 ? "w-80 h-80 left-1/3 top-1/3" : ""}
              ${idx === 1 ? "w-72 h-72 left-2/4 top-1/4" : ""}
              ${idx === 2 ? "w-32 h-32 left-2/5 top-2/3" : ""}
              ${idx === 3 ? "w-48 h-48 left-1/2 top-1/2" : ""}
              ${idx === 4 ? "w-40 h-40 left-[40%] top-[70%]" : ""}
              ${idx === 5 ? "w-96 h-96 left-1/6 top-1/2" : ""}
            `}
            style={{
              filter: `blur(40px)`,
              zIndex: 1 + idx,
              animationDelay: `${idx * 0.18}s`,
            }}
          />
        ))}
      </div>
      <div className="relative z-[1010] flex flex-col items-center justify-center">
        <span className="text-4xl md:text-6xl font-extrabold bg-gradient-to-br from-yellow-300 via-green-400 to-green-500 bg-clip-text text-transparent drop-shadow-[0_0_28px_#39FF14] animate-scale-in">
          Congratulazioni
        </span>
        <span className="block mt-4 text-xl font-semibold text-white animate-fade-in">Hai sbloccato un nuovo indizio!</span>
      </div>
      <style jsx global>{`
        @keyframes explode {
          to {
            opacity: 0.1;
            transform: scale(2.6) translateY(-80px);
          }
        }
      `}</style>
    </div>
  );
};

export default ClueUnlockedExplosion;
