import React from 'react';
import OverlayButton from './OverlayButton';

export interface DockItemData {
  id: string;
  type: 'Portal' | 'Event' | 'Alert Zone' | 'Mission' | 'Sector';
  label: string;
  lat: number;
  lng: number;
  status?: 'active' | 'inactive' | 'pending';
  color?: string;
  count?: number;
}

interface DockItemProps {
  item: DockItemData;
  active?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}

const DockItem: React.FC<DockItemProps> = ({ item, active, disabled, onClick }) => {
  const getTypeIcon = () => {
    switch (item.type) {
      case 'Portal':
        return '◈';
      case 'Event':
        return '⚡';
      case 'Alert Zone':
        return '⚠';
      case 'Mission':
        return '✓';
      case 'Sector':
        return '▣';
      default:
        return '•';
    }
  };

  const displayLabel = item.count && item.count > 1 
    ? `${item.label} (${item.count})` 
    : item.label;

  return (
    <div className="relative">
      <OverlayButton
        label={displayLabel}
        icon={<span style={{ fontSize: '14px', lineHeight: 1 }}>{getTypeIcon()}</span>}
        active={active}
        disabled={disabled}
        onClick={onClick}
        variant="pill"
        className="w-full justify-start"
      />
    </div>
  );
};

export default DockItem;

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
