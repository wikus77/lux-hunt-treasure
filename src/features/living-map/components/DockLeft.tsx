import React, { useState, useMemo, useRef, useEffect } from 'react';
import OverlayButton from './OverlayButton';

export interface DockItem {
  id: string;
  type: 'Portal' | 'Event' | 'Alert Zone';
  label: string;
  lat: number;
  lng: number;
  status?: 'active' | 'inactive' | 'pending';
  color?: string;
}

interface DockLeftProps {
  items: DockItem[];
  onFocus?: (item: DockItem) => void;
}

interface BadgePosition {
  id: string;
  top: number;
}

const DockLeft: React.FC<DockLeftProps> = ({ items, onFocus }) => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [tooltipId, setTooltipId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Vertical stacking (no overlap)
  const positions = useMemo(() => {
    const BADGE_HEIGHT = 40;
    const GAP = 8;
    
    const result: BadgePosition[] = [];
    
    items.forEach((item, index) => {
      const top = 88 + index * (BADGE_HEIGHT + GAP);
      result.push({ id: item.id, top });
    });
    
    return result;
  }, [items]);

  const handleBadgeClick = (item: DockItem) => {
    if (tooltipId === item.id) {
      setTooltipId(null);
    } else {
      setTooltipId(item.id);
      setActiveId(item.id);
    }
  };

  const handleFocus = (item: DockItem) => {
    onFocus?.(item);
    setTooltipId(null);
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

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Portal': return 'var(--living-map-neon-primary)';
      case 'Event': return '#24E39E';
      case 'Alert Zone': return '#FFB347';
      default: return 'var(--living-map-neon-secondary)';
    }
  };

  return (
    <div ref={containerRef} style={{ position: 'absolute', left: 12, top: 0, zIndex: 1000, display: 'flex', flexDirection: 'column', gap: 8 }}>
      {items.map((item) => {
        const isActive = activeId === item.id;
        const showTooltip = tooltipId === item.id;

        return (
          <div key={item.id} className="relative">
            {/* Badge */}
            <OverlayButton
              label={item.label}
              active={isActive}
              onClick={() => handleBadgeClick(item)}
              className="relative"
            />

            {/* Tooltip */}
            {showTooltip && (
              <div
                className="living-hud-glass absolute left-0 bottom-full mb-2 p-3 pointer-events-auto animate-scale-in"
                style={{
                  minWidth: 200,
                  zIndex: 1001,
                  color: 'var(--living-map-text-primary)'
                }}
              >
                {/* Title */}
                <div
                  style={{
                    fontSize: '14px',
                    fontWeight: 700,
                    marginBottom: 4,
                    color: getTypeColor(item.type)
                  }}
                >
                  {item.label}
                </div>

                {/* Type */}
                <div
                  style={{
                    fontSize: '11px',
                    color: 'var(--living-map-text-secondary)',
                    marginBottom: 12,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}
                >
                  {item.type}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleFocus(item)}
                    className="flex-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                    style={{
                      background: 'rgba(0, 229, 255, 0.15)',
                      border: '1px solid rgba(0, 229, 255, 0.3)',
                      color: 'var(--living-map-neon-primary)',
                      cursor: 'pointer'
                    }}
                  >
                    Focus
                  </button>
                  <button
                    onClick={handleClose}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                    style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: 'var(--living-map-text-secondary)',
                      cursor: 'pointer'
                    }}
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default DockLeft;

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
