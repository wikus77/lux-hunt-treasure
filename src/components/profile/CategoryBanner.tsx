
import React from "react";

interface CategoryBannerProps {
  open: boolean;
  category: string | null;
  style: { gradient: string; textColor: string };
  onClose: () => void;
  children?: React.ReactNode;
}

const CategoryBanner = ({
  open,
  category,
  style,
  onClose,
  children,
}: CategoryBannerProps) => {
  return (
    <div
      className={`fixed top-0 left-0 right-0 z-50 flex justify-center transition-all duration-400 pointer-events-none ${open ? "translate-y-0 opacity-100" : "-translate-y-36 opacity-0"}`}
      style={{ transitionProperty: "transform, opacity" }}
    >
      <div
        className={`m1ssion-glass-card rounded-b-[24px] px-8 py-6 max-w-md w-full flex flex-col items-center ${style.textColor} pointer-events-auto animate-fade-in`}
      >
        <div className="flex items-center gap-2 text-xl mb-2 font-orbitron font-bold uppercase neon-text-cyan">
          {category}
        </div>
        <div className="text-sm text-white/90 text-center mb-3">{children}</div>
        <button
          onClick={onClose}
          className="glass-medium rounded-m1-sm px-4 py-2 text-sm transition hover:bg-white/20 press-effect pointer-events-auto"
        >
          Chiudi
        </button>
      </div>
    </div>
  );
};

export default CategoryBanner;

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

