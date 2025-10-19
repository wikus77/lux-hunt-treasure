import React from 'react';
import { DockItemData } from './DockItem';

interface TooltipCardProps {
  item: DockItemData;
  onFocus: () => void;
  onFilter?: () => void;
  onClose: () => void;
  filterActive?: boolean;
}

const TooltipCard: React.FC<TooltipCardProps> = ({ 
  item, 
  onFocus, 
  onFilter, 
  onClose,
  filterActive = true
}) => {
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Portal': return 'var(--living-map-neon-primary)';
      case 'Event': return '#24E39E';
      case 'Alert Zone': return '#FFB347';
      case 'Mission': return '#00E5FF';
      case 'Sector': return '#8A2BE2';
      default: return 'var(--living-map-neon-secondary)';
    }
  };

  return (
    <div
      className="living-hud-glass absolute left-0 bottom-full mb-2 p-3 pointer-events-auto animate-scale-in"
      style={{
        minWidth: 220,
        maxWidth: 280,
        zIndex: 1002,
        color: 'var(--living-map-text-primary)',
        boxShadow: '0 0 24px rgba(0, 229, 255, 0.3), 0 8px 32px rgba(0, 0, 0, 0.4)'
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <div
            style={{
              fontSize: '14px',
              fontWeight: 700,
              marginBottom: 4,
              color: getTypeColor(item.type),
              lineHeight: 1.3
            }}
          >
            {item.label}
          </div>
          <div
            style={{
              fontSize: '10px',
              color: 'var(--living-map-text-secondary)',
              textTransform: 'uppercase',
              letterSpacing: '0.8px',
              fontWeight: 600
            }}
          >
            {item.type}
            {item.status && ` • ${item.status}`}
          </div>
        </div>
      </div>

      {/* Coordinates (small) */}
      {item.lat && item.lng && (
        <div
          style={{
            fontSize: '9px',
            color: 'var(--living-map-text-tertiary)',
            marginBottom: 12,
            fontFamily: 'monospace',
            opacity: 0.7
          }}
        >
          {item.lat.toFixed(4)}, {item.lng.toFixed(4)}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={onFocus}
          className="flex-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:scale-105"
          style={{
            background: 'rgba(0, 229, 255, 0.15)',
            border: '1px solid rgba(0, 229, 255, 0.4)',
            color: 'var(--living-map-neon-primary)',
            cursor: 'pointer'
          }}
        >
          Focus
        </button>
        
        {onFilter && (
          <button
            onClick={onFilter}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:scale-105"
            style={{
              background: filterActive 
                ? 'rgba(36, 227, 158, 0.15)' 
                : 'rgba(255, 255, 255, 0.05)',
              border: filterActive 
                ? '1px solid rgba(36, 227, 158, 0.3)' 
                : '1px solid rgba(255, 255, 255, 0.1)',
              color: filterActive ? '#24E39E' : 'var(--living-map-text-secondary)',
              cursor: 'pointer'
            }}
          >
            {filterActive ? 'Hide' : 'Show'}
          </button>
        )}
        
        <button
          onClick={onClose}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:scale-105"
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: 'var(--living-map-text-secondary)',
            cursor: 'pointer'
          }}
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export default TooltipCard;

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
