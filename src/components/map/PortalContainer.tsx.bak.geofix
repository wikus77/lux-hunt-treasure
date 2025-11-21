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
    { id: 'all', label: 'All Portals', icon: Target, color: 'from-cyan-500 to-purple-600' }
  ];

  const [activeFilters, setActiveFilters] = useState<Set<string>>(new Set(['ALL']));

  const handlePortalClick = (portalId: string) => {
    onPortalAction?.(portalId);
    
    // P0 FIX: Simple ALL toggle
    const newFilters = new Set(activeFilters);
    const filterKey = 'ALL';
    
    if (newFilters.has(filterKey)) {
      newFilters.delete(filterKey);
    } else {
      newFilters.clear();
      newFilters.add(filterKey);
    }
    
    setActiveFilters(newFilters);
    
    // Dispatch toggle event for portal filters
    const enabled = newFilters.has(filterKey);
    const event = new CustomEvent('M1_PORTAL_FILTER', { 
      detail: { type: 'ALL', enabled } 
    });
    window.dispatchEvent(event);
    
    console.log(`🎯 Portals: ${enabled ? 'VISIBLE' : 'HIDDEN'}`);
  };

  const toggleDrawer = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Closed Pill - Centered Top */}
      {!isOpen && (
        <button
          onClick={toggleDrawer}
          className="portal-pill-centered"
          aria-label="Open PORTALS menu"
        >
          <span className="portal-pill-label">PORTALS</span>
          <span className="portal-pill-badge">{portalCount}</span>
        </button>
      )}

      {/* Open Drawer - Centered Top */}
      {isOpen && (
        <div className="portal-drawer-centered">
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
              const isActive = activeFilters.has('ALL');
              return (
                <button
                  key={portal.id}
                  onClick={() => handlePortalClick(portal.id)}
                  className={`portal-button ${isActive ? 'portal-button-active' : ''}`}
                  data-portal-type={portal.id}
                  aria-label={`Toggle all portals`}
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
              Click per mostrare/nascondere tutti i portali
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default PortalContainer;

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
