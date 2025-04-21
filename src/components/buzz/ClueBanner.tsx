
import React from "react";

interface ClueBannerProps {
  open: boolean;
  message: string;
  onClose: () => void;
}

const ClueBanner: React.FC<ClueBannerProps> = ({ open, message, onClose }) => {
  return (
    <div
      className={`fixed top-0 left-0 right-0 z-[105] flex justify-center w-full pointer-events-none transition-all duration-500 ${open ? "translate-y-0 opacity-100" : "-translate-y-32 opacity-0"}`}
      style={{ transitionProperty: "transform, opacity" }}
    >
      <div className="bg-projectx-deep-blue border border-projectx-blue text-white py-3 px-8 rounded-b-lg shadow-lg flex items-center gap-2 animate-fade-in pointer-events-auto w-full max-w-screen-lg mx-auto">
        <span className="font-semibold">Indizio Sbloccato:</span>
        <span className="text-projectx-neon-blue">{message}</span>
        <button
          onClick={onClose}
          className="ml-4 text-sm text-projectx-neon-blue underline transition hover:text-projectx-pink"
          tabIndex={open ? 0 : -1}
          aria-label="Chiudi banner"
        >
          Chiudi
        </button>
      </div>
    </div>
  );
};

export default ClueBanner;
