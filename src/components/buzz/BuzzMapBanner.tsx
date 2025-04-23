
import React from "react";
import { X } from "lucide-react";

interface BuzzMapBannerProps {
  open: boolean;
  message?: string;
  area?: {
    lat: number;
    lng: number;
    radius: number;
    label: string;
    confidence?: string;
  } | null;
  onClose: () => void;
}

const BuzzMapBanner: React.FC<BuzzMapBannerProps> = ({ open, area, message, onClose }) => {
  if (!open || (!area && !message)) return null;
  
  return (
    <div
      className={`
        fixed top-6 left-1/2 z-[120] flex justify-center pointer-events-none
        transition-all duration-500
        ${open ? "translate-y-0 opacity-100" : "-translate-y-32 opacity-0"}
      `}
      style={{
        transform: `translateX(-50%) ${open ? '' : 'translateY(-32px)'}`,
        width: "600px",
        maxWidth: "95vw"
      }}
    >
      <div
        className="relative pointer-events-auto
        px-12 py-8 rounded-2xl border
        shadow-2xl 
        glass-card
        bg-gradient-to-br from-[#181641] via-[#7E69AB] to-[#1EAEDB]
        border-[#9b87f5]/60
        flex flex-col items-center animate-fade-in"
        style={{ fontSize: "1.18rem", minWidth: "320px", minHeight: "120px", maxWidth: "100vw" }}
      >
        <button
          className="absolute top-3 right-3 text-xl p-1 text-[#d946ef] hover:text-white focus:outline-none transition-all"
          onClick={onClose}
        >
          <X className="w-7 h-7" />
        </button>
        <div className="mb-3 text-2xl font-extrabold bg-gradient-to-r from-[#d946ef] via-[#9b87f5] to-[#33c3f0] text-transparent bg-clip-text [text-fill-color:transparent] drop-shadow-lg flex items-center justify-center gap-2 tracking-tight">
          {area ? "Area di Ricerca Buzz Generata!" : "Indizio Sbloccato!"}
        </div>
        <div className="text-md text-white/90 flex flex-col items-center text-center max-w-2xl">
          {area ? (
            <div>
              {area.label} <br />
              <span className="font-bold">{"Raggio: "}{Math.round(area.radius/1000)} km</span>
              <div className="text-[#ffcefe] text-xs mt-2">
                {area.confidence && <>Confidence: <b>{area.confidence}</b></>}
              </div>
            </div>
          ) : (
            <div>{message}</div>
          )}
        </div>
        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-32 h-2 bg-gradient-to-r from-[#d946ef]/70 via-[#8b5cf6]/70 to-[#33c3f0]/70 rounded-full blur-sm opacity-75"></div>
      </div>
    </div>
  );
};

export default BuzzMapBanner;
