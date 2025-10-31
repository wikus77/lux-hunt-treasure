// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import React from 'react';

interface TooltipProps {
  x: number;
  y: number;
  text: string;
}

export const Tooltip: React.FC<TooltipProps> = ({ x, y, text }) => {
  return (
    <div
      style={{
        position: 'fixed',
        left: x + 10,
        top: y + 10,
        background: 'rgba(10, 10, 15, 0.9)',
        color: '#35E9FF',
        padding: '6px 12px',
        borderRadius: '4px',
        fontSize: '12px',
        fontFamily: 'monospace',
        pointerEvents: 'none',
        zIndex: 1000,
        border: '1px solid rgba(53, 233, 255, 0.3)'
      }}
    >
      {text}
    </div>
  );
};

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
