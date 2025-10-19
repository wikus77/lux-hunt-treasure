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

  const [activeFilters, setActiveFilters] = useState<Set<string>>(new Set(['ALL']));

  const handlePortalClick = (portalId: string) => {
    onPortalAction?.(portalId);
    
    // P1 FIX: Toggle filter state
    const newFilters = new Set(activeFilters);
    const filterKey = portalId.toUpperCase();
    
    if (newFilters.has(filterKey)) {
      newFilters.delete(filterKey);
    } else {
      newFilters.add(filterKey);
    }
    
    setActiveFilters(newFilters);
    
    // Dispatch toggle event for portal filters
    const enabled = newFilters.has(filterKey);
    const event = new CustomEvent('M1_PORTAL_FILTER', { 
      detail: { type: filterKey, enabled } 
    });
    window.dispatchEvent(event);
    
    console.log(`🎯 Portal ${filterKey}: ${enabled ? 'ENABLED' : 'DISABLED'}`);
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
              const isActive = activeFilters.has(portal.id.toUpperCase());
              return (
                <button
                  key={portal.id}
                  onClick={() => handlePortalClick(portal.id)}
                  className={`portal-button ${isActive ? 'portal-button-active' : ''}`}
                  data-portal-type={portal.id}
                  aria-label={`Filter ${portal.label} portals`}
                  aria-pressed={isActive}
                >
                  <div className={`portal-button-gradient bg-gradient-to-br ${portal.color} ${isActive ? 'opacity-100' : 'opacity-50'}`}>
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
