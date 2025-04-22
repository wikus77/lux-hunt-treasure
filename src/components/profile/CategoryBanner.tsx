
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
        className={`rounded-b-xl px-6 py-4 shadow-lg max-w-md w-full flex flex-col items-center ${style.gradient} ${style.textColor} pointer-events-auto animate-fade-in`}
      >
        <div className="flex items-center gap-2 text-xl mb-2 font-orbitron font-bold uppercase">
          {category}
        </div>
        <div className="text-sm text-white opacity-90 text-center mb-2">{children}</div>
        <button
          onClick={onClose}
          className="bg-white/10 border border-white/20 rounded px-3 py-1 text-sm mt-2 transition hover:bg-white/20 pointer-events-auto"
        >
          Chiudi
        </button>
      </div>
    </div>
  );
};

export default CategoryBanner;

