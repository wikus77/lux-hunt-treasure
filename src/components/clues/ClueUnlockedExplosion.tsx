
import React from "react";

interface Props {
  open: boolean;
  onFinish: () => void;
}

// Custom style injected for a slower fade-in effect
const fadeInStyle = `
@keyframes slow-fade-in {
  0% {
    opacity: 0;
    transform: translateY(18px) scale(0.97);
    filter: blur(4px);
  }
  55% {
    filter: blur(0.5px);
  }
  80% {
    opacity: 1;
    filter: blur(0px);
    transform: translateY(0px) scale(1.01);
  }
  100% {
    opacity: 1;
    filter: blur(0px);
    transform: translateY(0px) scale(1);
  }
}
.slow-fade-in {
  animation: slow-fade-in 1.2s cubic-bezier(0.17, 0.67, 0.83, 0.67) both;
}
`;

const ClueUnlockedExplosion: React.FC<Props> = ({ open }) => {
  if (!open) return null;

  return (
    <div
      className="
        fixed inset-0 z-[99999] flex items-center justify-center
        bg-black/95 backdrop-blur-sm
      "
    >
      {/* Only show congratulation text with slow fade-in and green gradient */}
      <style>{fadeInStyle}</style>
      <div className="relative z-[1200] flex flex-col items-center justify-center w-full">
        <span
          className="slow-fade-in
            font-extrabold
            bg-gradient-to-br from-lime-300 via-lime-400 to-green-400
            bg-clip-text text-transparent
            drop-shadow-[0_0_32px_#baff1a]
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
          className="slow-fade-in
            block mt-8 font-semibold w-full text-center
            bg-gradient-to-r from-lime-300 via-green-200 to-lime-400
            bg-clip-text text-transparent
            drop-shadow-[0_0_18px_#d4ff44]
            "
          style={{
            fontSize: "clamp(1.3rem, 2vw, 2.4rem)",
            WebkitBackgroundClip: "text" as any,
            WebkitTextFillColor: "transparent",
            animationDelay: "0.22s",
          }}
        >
          Hai sbloccato un nuovo indizio
        </span>
      </div>
    </div>
  );
};

export default ClueUnlockedExplosion;
