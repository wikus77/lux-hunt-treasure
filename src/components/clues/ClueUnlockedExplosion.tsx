
import React, { useEffect, useRef, useImperativeHandle, forwardRef } from "react";

interface Props {
  open: boolean;
  fadeOut: boolean;
  onFadeOutEnd: () => void;
}

// CSS animazioni personalizzate per fade-in e fade-out graduale della scritta+overlay
const fadeStyles = `
@keyframes acid-fade-in {
  0% {
    opacity: 0;
    transform: scale(0.98) translateY(20px);
    filter: blur(9px);
  }
  34% {
    opacity: 1;
    filter: blur(1.1px);
    transform: scale(1.02) translateY(0px);
  }
  75% {
    opacity: 1;
    filter: blur(0px);
    transform: scale(1.04) translateY(0px);
  }
  100% {
    opacity: 1;
    filter: blur(0px);
    transform: scale(1) translateY(0);
  }
}
@keyframes acid-fade-out {
  0% {
    opacity: 1;
    transform: scale(1) translateY(0);
    filter: blur(0);
  }
  80% {
    opacity: 1;
    filter: blur(1.5px);
  }
  100% {
    opacity: 0;
    filter: blur(10px);
    transform: scale(0.985) translateY(18px);
  }
}
.clue-acid-fade-in {
  animation: acid-fade-in 1.7s cubic-bezier(0.19,0.85,0.55,1.08) both;
}
.clue-acid-fade-out {
  animation: acid-fade-out 1.4s cubic-bezier(0.19,0.85,0.55,1.08) both;
}
`;

const ClueUnlockedExplosion = forwardRef<HTMLDivElement, Props>(({
  open,
  fadeOut,
  onFadeOutEnd
}, ref) => {
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Quando parte il fadeOut, notifichiamo quando finisce l'animazione
  useEffect(() => {
    if (fadeOut && wrapperRef.current) {
      const node = wrapperRef.current;
      const handleAnimEnd = () => {
        onFadeOutEnd?.();
      };
      node.addEventListener("animationend", handleAnimEnd);
      return () => node.removeEventListener("animationend", handleAnimEnd);
    }
  }, [fadeOut, onFadeOutEnd]);

  if (!open) return null;

  return (
    <div
      ref={wrapperRef}
      className={`
        fixed inset-0 z-[99999] flex items-center justify-center
        bg-black/95 backdrop-blur-sm
        transition-all duration-150
        ${fadeOut ? "clue-acid-fade-out" : "clue-acid-fade-in"}
      `}
      style={{ transition: "opacity 400ms cubic-bezier(0.22,1,0.36,1)" }}
    >
      <style>{fadeStyles}</style>
      <div className="relative z-[1200] flex flex-col items-center justify-center w-full">
        <span
          className="
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
            WebkitTextFillColor: "transparent"
          }}
        >
          Congratulazioni!
        </span>
        <span
          className="
            block mt-8 font-semibold w-full text-center
            bg-gradient-to-r from-lime-300 via-green-200 to-lime-400
            bg-clip-text text-transparent
            drop-shadow-[0_0_18px_#d4ff44]
          "
          style={{
            fontSize: "clamp(1.3rem, 2vw, 2.4rem)",
            WebkitBackgroundClip: "text" as any,
            WebkitTextFillColor: "transparent"
          }}
        >
          Hai sbloccato un nuovo indizio
        </span>
      </div>
    </div>
  );
});
ClueUnlockedExplosion.displayName = "ClueUnlockedExplosion";
export default ClueUnlockedExplosion;
