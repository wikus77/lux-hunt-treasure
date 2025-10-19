import React, { useState, useRef, useEffect } from 'react';
import DockItem, { DockItemData } from './DockItem';
import TooltipCard from './TooltipCard';
import { useDockLayout } from '../hooks/useDockLayout';

interface DockLeftProps {
  items: DockItemData[];
  onFocus?: (item: DockItemData) => void;
  onRoute?: (item: DockItemData) => void;
  filters?: Record<string, boolean>;
  onFilterToggle?: (itemId: string) => void;
}

const DockLeft: React.FC<DockLeftProps> = ({ 
  items, 
  onFocus,
  onRoute, 
  filters = {},
  onFilterToggle 
}) => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [tooltipId, setTooltipId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Use layout hook for positioning
  const positions = useDockLayout(items.map(i => i.id), {
    itemHeight: 36,
    gap: 10,
    maxIterations: 6
  });

  const handleItemClick = (item: DockItemData) => {
    if (tooltipId === item.id) {
      setTooltipId(null);
      setActiveId(null);
    } else {
      setTooltipId(item.id);
      setActiveId(item.id);
    }
  };

  const handleFocus = (item: DockItemData) => {
    // Dispatch custom event for map to handle focus/zoom
    window.dispatchEvent(new CustomEvent('M1_FOCUS', {
      detail: { lat: item.lat, lng: item.lng, zoom: 15 }
    }));
    console.log('🎯 Dock - Focus on:', item.label, 'at', item.lat, item.lng);
    onFocus?.(item);
    setTooltipId(null);
    setActiveId(null);
  };

  const handleFilter = (itemId: string) => {
    onFilterToggle?.(itemId);
    console.log('🔍 Dock - Filter toggled for:', itemId);
  };

  const handleRoute = (item: DockItemData) => {
    // Open native navigation (Apple Maps on iOS, Google Maps elsewhere)
    const { lat, lng } = item;
    const url = /iPhone|iPad|iPod/.test(navigator.userAgent)
      ? `http://maps.apple.com/?daddr=${lat},${lng}`
      : `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    window.open(url, '_blank');
    console.log('🗺️ Dock - Route opened for:', item.label);
    onRoute?.(item);
    setTooltipId(null);
    setActiveId(null);
  };

  const handleClose = () => {
    setTooltipId(null);
    setActiveId(null);
  };

  // Close tooltip on Escape
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  // Close tooltip on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        handleClose();
      }
    };
    if (tooltipId) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [tooltipId]);

  return (
    <div 
      ref={containerRef} 
      id="m1-dock"
      style={{ 
        position: 'absolute', 
        left: 12, 
        top: 92, 
        width: 196,
        maxHeight: 'calc(100vh - 160px)',
        overflowY: 'auto',
        overflowX: 'hidden',
        zIndex: 1002,
        pointerEvents: 'none',
        // Gradient fade
        maskImage: 'linear-gradient(to bottom, transparent 0, black 18px, black calc(100% - 18px), transparent 100%)',
        WebkitMaskImage: 'linear-gradient(to bottom, transparent 0, black 18px, black calc(100% - 18px), transparent 100%)'
      }}
      className="scrollbar-hide"
    >
      <div style={{ position: 'relative', paddingBottom: 20 }}>
        {items.map((item) => {
          const position = positions.find(p => p.id === item.id);
          if (!position) return null;

          const isActive = activeId === item.id;
          const showTooltip = tooltipId === item.id;
          const filterActive = filters[item.id] !== false;

          return (
            <div
              key={item.id}
              style={{
                position: 'absolute',
                top: position.top,
                left: 0,
                width: '100%',
                transition: 'all 0.3s ease',
                pointerEvents: 'auto'
              }}
            >
              <DockItem
                item={item}
                active={isActive}
                disabled={!filterActive}
                onClick={() => handleItemClick(item)}
              />

              {showTooltip && (
                <TooltipCard
                  item={item}
                  onFocus={() => handleFocus(item)}
                  onFilter={onFilterToggle ? () => handleFilter(item.id) : undefined}
                  onRoute={() => handleRoute(item)}
                  onClose={handleClose}
                  filterActive={filterActive}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DockLeft;

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
