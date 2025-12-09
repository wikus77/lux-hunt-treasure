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

  // CSS custom per il modal - completamente centrato e responsive
  const modalStyles = `
    .portal-modal-backdrop {
      position: fixed !important;
      top: 0 !important;
      left: 0 !important;
      right: 0 !important;
      bottom: 0 !important;
      background: rgba(0, 0, 0, 0.7) !important;
      z-index: 999990 !important;
      backdrop-filter: blur(4px) !important;
    }
    
    .portal-modal-container {
      position: fixed !important;
      z-index: 999999 !important;
      left: 50% !important;
      top: 50% !important;
      transform: translate(-50%, -50%) !important;
      width: calc(100% - 32px) !important;
      max-width: 360px !important;
      max-height: calc(100vh - 200px) !important;
      margin: 0 auto !important;
    }
    
    .portal-modal-content {
      background: linear-gradient(145deg, #0f0f1a 0%, #1a1a35 50%, #0d1a25 100%) !important;
      border: 1px solid rgba(0, 229, 255, 0.3) !important;
      border-radius: 20px !important;
      padding: 24px 20px !important;
      box-shadow: 
        0 0 0 1px rgba(0, 229, 255, 0.1),
        0 8px 32px rgba(0, 0, 0, 0.5),
        0 0 60px rgba(0, 229, 255, 0.15) !important;
      position: relative !important;
    }
    
    .portal-modal-close {
      position: absolute !important;
      top: -10px !important;
      right: -10px !important;
      width: 36px !important;
      height: 36px !important;
      border-radius: 50% !important;
      background: #dc2626 !important;
      border: 2px solid #fff !important;
      color: white !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      cursor: pointer !important;
      z-index: 1000000 !important;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3) !important;
    }
    
    .portal-modal-close:hover {
      background: #b91c1c !important;
    }
    
    .portal-modal-title {
      text-align: center !important;
      font-size: 22px !important;
      font-weight: 700 !important;
      color: #00E5FF !important;
      margin-bottom: 20px !important;
      text-shadow: 0 0 20px rgba(0, 229, 255, 0.5) !important;
    }
    
    .portal-modal-row {
      display: flex !important;
      justify-content: space-between !important;
      align-items: center !important;
      padding: 8px 0 !important;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
    }
    
    .portal-modal-label {
      color: rgba(255, 255, 255, 0.6) !important;
      font-size: 14px !important;
    }
    
    .portal-modal-value {
      font-weight: 600 !important;
      font-size: 14px !important;
    }
    
    .portal-modal-progress {
      width: 100% !important;
      height: 10px !important;
      background: rgba(0, 0, 0, 0.4) !important;
      border-radius: 5px !important;
      margin: 16px 0 !important;
      overflow: hidden !important;
    }
    
    .portal-modal-progress-bar {
      height: 100% !important;
      border-radius: 5px !important;
      transition: width 0.5s ease !important;
    }
    
    .portal-modal-coords {
      text-align: center !important;
      color: rgba(255, 255, 255, 0.4) !important;
      font-size: 12px !important;
      margin-top: 16px !important;
    }

    @media (max-width: 480px) {
      .portal-modal-container {
        width: calc(100% - 24px) !important;
        max-height: calc(100vh - 160px) !important;
      }
      .portal-modal-content {
        padding: 20px 16px !important;
      }
      .portal-modal-title {
        font-size: 18px !important;
      }
    }
  `;

  return (
    <>
      <style>{modalStyles}</style>
      
      {/* Backdrop */}
      <div className="portal-modal-backdrop" onClick={onClose} />
      
      {/* Modal Container - CENTRATO PERFETTAMENTE */}
      <div className="portal-modal-container">
        <div className="portal-modal-content">
          
          {/* Close Button */}
          <button className="portal-modal-close" onClick={onClose}>
            <X size={20} />
          </button>

          {/* Title */}
          <h3 className="portal-modal-title">{portal.name}</h3>

          {/* Status */}
          <div className="portal-modal-row">
            <span className="portal-modal-label">Stato:</span>
            <span className="portal-modal-value" style={{ color: getStatusColor(portal.status) }}>
              {getStatusLabel(portal.status)}
            </span>
          </div>

          {/* Intensity */}
          <div className="portal-modal-row" style={{ borderBottom: 'none' }}>
            <span className="portal-modal-label">Intensità:</span>
            <span className="portal-modal-value" style={{ color: '#00E5FF' }}>
              {portal.intensity}%
            </span>
          </div>

          {/* Progress Bar */}
          <div className="portal-modal-progress">
            <div 
              className="portal-modal-progress-bar"
              style={{ 
                width: `${portal.intensity}%`,
                background: `linear-gradient(90deg, ${getStatusColor(portal.status)}, ${getStatusColor(portal.status)}aa)`
              }}
            />
          </div>

          {/* Coordinates */}
          <div className="portal-modal-coords">
            Coordinate: {portal.lat.toFixed(4)}, {portal.lng.toFixed(4)}
          </div>
          
          {/* Last Update */}
          <div className="portal-modal-coords" style={{ marginTop: '8px', fontSize: '11px' }}>
            Ultimo aggiornamento: {new Date(portal.lastUpdate).toLocaleString('it-IT')}
          </div>
        </div>
      </div>
    </>
  );
};

export default PortalOverlay;

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
