
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
        bg-black/95
        backdrop-blur-sm
      "
    >
      {/* Only show congratulation text, no animation */}
      <div className="relative z-[1200] flex flex-col items-center justify-center">
        <span className="text-5xl md:text-6xl font-extrabold bg-gradient-to-br from-yellow-200 via-fuchsia-400 to-green-300 bg-clip-text text-transparent drop-shadow-[0_0_28px_#39FF14] mb-2">
          Congratulazioni!
        </span>
        <span className="block mt-6 text-2xl font-semibold text-white">
          Hai sbloccato un nuovo indizio 🎉
        </span>
      </div>
    </div>
  );
};

export default ClueUnlockedExplosion;

