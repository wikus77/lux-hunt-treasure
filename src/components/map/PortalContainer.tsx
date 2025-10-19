import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { X, Zap, MapPin, AlertTriangle, Target, Hexagon } from 'lucide-react';

interface PortalContainerProps {
  portalCount?: number;
  onPortalAction?: (portalType: string) => void;
}

const PortalContainer = ({ portalCount = 12, onPortalAction }: PortalContainerProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const portals = [
    { id: 'alpha', label: 'Alpha', icon: Target, color: 'from-cyan-500 to-blue-600' },
    { id: 'beta', label: 'Beta', icon: Hexagon, color: 'from-blue-500 to-purple-600' },
    { id: 'gamma', label: 'Gamma', icon: Zap, color: 'from-purple-500 to-pink-600' },
    { id: 'delta', label: 'Delta', icon: MapPin, color: 'from-pink-500 to-red-600' },
    { id: 'rare', label: 'Rare', icon: AlertTriangle, color: 'from-yellow-500 to-orange-600' },
    { id: 'drop', label: 'Drop', icon: Target, color: 'from-green-500 to-teal-600' },
  ];

  const handlePortalClick = (portalId: string) => {
    onPortalAction?.(portalId);
    // P1 FIX: Dispatch proper toggle event for portal filters
    const event = new CustomEvent('M1_PORTAL_FILTER', { 
      detail: { type: portalId.toUpperCase(), enabled: true } 
    });
    window.dispatchEvent(event);
  };

  const toggleDrawer = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Closed Pill - Left Side */}
      {!isOpen && (
        <button
          onClick={toggleDrawer}
          className="portal-pill"
          aria-label="Open PORTALS menu"
        >
          <span className="portal-pill-label">PORTALS</span>
          <span className="portal-pill-badge">{portalCount}</span>
        </button>
      )}

      {/* Open Drawer - Floating Panel */}
      {isOpen && (
        <div className="portal-drawer">
          {/* Header */}
          <div className="portal-drawer-header">
            <div className="flex items-center gap-2">
              <span className="portal-drawer-title">PORTALS</span>
              <span className="portal-drawer-badge">{portalCount}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleDrawer}
              className="portal-drawer-close"
              aria-label="Close PORTALS menu"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Portal Buttons Grid */}
          <div className="portal-drawer-grid">
            {portals.map((portal) => {
              const Icon = portal.icon;
              return (
                <button
                  key={portal.id}
                  onClick={() => handlePortalClick(portal.id)}
                  className="portal-button"
                  data-portal-type={portal.id}
                  aria-label={`Filter ${portal.label} portals`}
                >
                  <div className={`portal-button-gradient bg-gradient-to-br ${portal.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="portal-button-label">{portal.label}</span>
                </button>
              );
            })}
          </div>

          {/* Footer Info */}
          <div className="portal-drawer-footer">
            <p className="text-xs text-cyan-400/60">
              Click per filtrare i portali sulla mappa
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default PortalContainer;

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
