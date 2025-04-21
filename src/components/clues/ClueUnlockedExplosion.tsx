
import React from "react";

interface Props {
  open: boolean;
  onFinish: () => void;
}

const ClueUnlockedExplosion: React.FC<Props> = ({ open }) => {
  if (!open) return null;

  return (
    <div
      className="
        fixed inset-0 z-[99999] flex items-center justify-center
        bg-black/95 backdrop-blur-sm
        animate-fade-in
      "
    >
      <div className="relative z-[1200] flex flex-col items-center justify-center w-full">
        <span
          className="
            font-extrabold
            bg-gradient-to-br from-lime-300 via-lime-400 to-green-400
            bg-clip-text text-transparent
            drop-shadow-[0_0_32px_#f3ff14]
            mb-2
            text-center
            leading-tight
            w-full
            px-4
            select-none
            "
          style={{
            fontSize: "clamp(2.5rem, 6vw, 5.2rem)",
            lineHeight: 1.08,
            WebkitBackgroundClip: "text" as any,
            WebkitTextFillColor: "transparent",
          }}
        >
          Congratulazioni!
        </span>
        <span
          className="
            block mt-8 font-semibold w-full text-center text-white bg-gradient-to-r from-lime-300 via-green-200 to-lime-400 bg-clip-text text-transparent
            drop-shadow-[0_0_18px_#d4ff44]
            "
          style={{
            fontSize: "clamp(1.3rem, 2vw, 2.4rem)",
            WebkitBackgroundClip: "text" as any,
            WebkitTextFillColor: "transparent",
          }}
        >
          Hai sbloccato un nuovo indizio 🎉
        </span>
      </div>
    </div>
  );
};

export default ClueUnlockedExplosion;
