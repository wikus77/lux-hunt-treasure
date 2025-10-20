import React from 'react';
import { X } from 'lucide-react';
import type { PortalDTO } from '../adapters/readOnlyData';

interface PortalOverlayProps {
  portal: PortalDTO | null;
  isVisible: boolean;
  onClose: () => void;
}

const PortalOverlay: React.FC<PortalOverlayProps> = ({ portal, isVisible, onClose }) => {
  if (!isVisible || !portal) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#00E5FF';
      case 'inactive': return '#666';
      case 'pending': return '#FFD700';
      default: return '#FFF';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Attivo';
      case 'inactive': return 'Inattivo';
      case 'pending': return 'In Attesa';
      default: return status;
    }
  };

  return (
    <div
      className={`
        fixed top-6 left-1/2 z-[120] flex justify-center pointer-events-none
        transform -translate-x-1/2 transition-all duration-500
        ${isVisible ? 'translate-y-0 opacity-100' : '-translate-y-32 opacity-0'}
      `}
      style={{ width: '795px', maxWidth: '95vw' }}
    >
      <div
        className="relative pointer-events-auto
        px-16 py-12 rounded-[24px] border
        shadow-[0_0_60px_rgba(30,174,219,0.4)]
        glass-card
        bg-gradient-to-br from-[#181641] via-[#7E69AB] to-[#1EAEDB]
        border-[#9b87f5]/60
        flex flex-col items-center animate-fade-in"
        style={{ fontSize: '1.4rem', minWidth: '423px', minHeight: '159px', maxWidth: '100vw' }}
      >
        <button
          className="absolute top-3 right-3 text-xl p-1 text-[#d946ef] hover:text-white focus:outline-none transition-all"
          onClick={onClose}
        >
          <X className="w-8 h-8" />
        </button>

        <div className="mb-3 text-3xl font-extrabold bg-gradient-to-r from-[#d946ef] via-[#9b87f5] to-[#33c3f0] text-transparent bg-clip-text [text-fill-color:transparent] drop-shadow-lg flex items-center justify-center gap-2 tracking-tight">
          {portal.name}
        </div>

        <div className="text-lg text-white/90 flex flex-col items-center text-center max-w-2xl gap-3">
          <div className="flex items-center gap-2">
            <span className="text-white/70">Stato:</span>
            <span 
              className="font-bold"
              style={{ color: getStatusColor(portal.status) }}
            >
              {getStatusLabel(portal.status)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-white/70">Intensità:</span>
            <span className="font-bold text-[#00E5FF]">{portal.intensity}%</span>
          </div>

          <div className="w-full max-w-xs bg-black/30 rounded-full h-2 mt-2">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${portal.intensity}%`,
                background: `linear-gradient(90deg, ${getStatusColor(portal.status)}, ${getStatusColor(portal.status)}88)`
              }}
            />
          </div>

          <div className="text-sm text-white/60 mt-2">
            Coordinate: {portal.lat.toFixed(4)}, {portal.lng.toFixed(4)}
          </div>

          <div className="text-xs text-white/50">
            Ultimo aggiornamento: {new Date(portal.lastUpdate).toLocaleString('it-IT')}
          </div>
        </div>

        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-40 h-3 bg-gradient-to-r from-[#d946ef]/70 via-[#8b5cf6]/70 to-[#33c3f0]/70 rounded-full blur-sm opacity-75"></div>
      </div>
    </div>
  );
};

export default PortalOverlay;

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
