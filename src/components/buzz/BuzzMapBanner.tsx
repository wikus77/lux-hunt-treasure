
import React from "react";
import { X } from "lucide-react";

interface BuzzMapBannerProps {
  open: boolean;
  area?: {
    lat: number;
    lng: number;
    radius: number;
    label: string;
    confidence?: string;
  } | null;
  message?: string;
  onClose: () => void;
}

const BuzzMapBanner: React.FC<BuzzMapBannerProps> = ({ open, area, message, onClose }) => {
  if (!open) return null;
  
  // If we have a message, show a simplified banner with just the message
  if (message && !area) {
    return (
      <div
        className={`
          fixed top-6 left-1/2 z-[120] flex justify-center pointer-events-none
          transform -translate-x-1/2 transition-all duration-500
          ${open ? "translate-y-0 opacity-100" : "-translate-y-32 opacity-0"}
        `}
        style={{ width: "795px", maxWidth: "95vw" }} // Increased width by 15%
      >
        <div
          className="relative pointer-events-auto
          px-16 py-12 rounded-2xl border
          shadow-[0_0_60px_rgba(30,174,219,0.4)]
          glass-card
          bg-gradient-to-br from-[#181641] via-[#7E69AB] to-[#1EAEDB]
          border-[#9b87f5]/60
          flex flex-col items-center animate-fade-in"
          style={{ fontSize: "1.4rem", minWidth: "423px", minHeight: "159px", maxWidth: "100vw" }}
        >
          <button
            className="absolute top-3 right-3 text-xl p-1 text-[#d946ef] hover:text-white focus:outline-none transition-all"
            onClick={onClose}
          >
            <X className="w-8 h-8" />
          </button>
          <div className="mb-3 text-3xl font-extrabold bg-gradient-to-r from-[#d946ef] via-[#9b87f5] to-[#33c3f0] text-transparent bg-clip-text [text-fill-color:transparent] drop-shadow-lg flex items-center justify-center gap-2 tracking-tight">
            Buzz Mappa
          </div>
          <div className="text-lg text-white/90 flex flex-col items-center text-center max-w-2xl">
            {message}
          </div>
          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-40 h-3 bg-gradient-to-r from-[#d946ef]/70 via-[#8b5cf6]/70 to-[#33c3f0]/70 rounded-full blur-sm opacity-75"></div>
        </div>
      </div>
    );
  }
  
  // Banner based on area
  if (!area) return null;
  
  return (
    <div
      className={`
        fixed top-6 left-1/2 z-[120] flex justify-center pointer-events-none
        transform -translate-x-1/2 transition-all duration-500
        ${open ? "translate-y-0 opacity-100" : "-translate-y-32 opacity-0"}
      `}
      style={{ width: "795px", maxWidth: "95vw" }} // Increased width by 15%
    >
      <div
        className="relative pointer-events-auto
        px-16 py-12 rounded-2xl border
        shadow-[0_0_60px_rgba(30,174,219,0.4)]
        glass-card
        bg-gradient-to-br from-[#181641] via-[#7E69AB] to-[#1EAEDB]
        border-[#9b87f5]/60
        flex flex-col items-center animate-fade-in"
        style={{ fontSize: "1.4rem", minWidth: "423px", minHeight: "159px", maxWidth: "100vw" }}
      >
        <button
          className="absolute top-3 right-3 text-xl p-1 text-[#d946ef] hover:text-white focus:outline-none transition-all"
          onClick={onClose}
        >
          <X className="w-8 h-8" />
        </button>
        <div className="mb-3 text-3xl font-extrabold bg-gradient-to-r from-[#d946ef] via-[#9b87f5] to-[#33c3f0] text-transparent bg-clip-text [text-fill-color:transparent] drop-shadow-lg flex items-center justify-center gap-2 tracking-tight">
          Area di Ricerca Buzz Generata!
        </div>
        <div className="text-lg text-white/90 flex flex-col items-center text-center max-w-2xl">
          <div className="text-xl">
            {area.label} <br />
            <span className="font-bold text-xl">{"Raggio: "}{Math.round(area.radius/1000)} km</span>
          </div>
          <div className="text-[#ffcefe] text-sm mt-2">
            {area.confidence && <>Confidence: <b>{area.confidence}</b></>}
          </div>
        </div>
        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-40 h-3 bg-gradient-to-r from-[#d946ef]/70 via-[#8b5cf6]/70 to-[#33c3f0]/70 rounded-full blur-sm opacity-75"></div>
      </div>
    </div>
  );
};

export default BuzzMapBanner;
