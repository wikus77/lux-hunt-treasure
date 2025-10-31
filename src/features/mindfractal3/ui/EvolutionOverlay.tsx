// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import React from 'react';

interface EvolutionOverlayProps {
  theme: string;
  level: number;
}

export const EvolutionOverlay: React.FC<EvolutionOverlayProps> = ({ theme, level }) => {
  return (
    <div
      style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        background: 'rgba(10, 10, 15, 0.95)',
        color: '#A64DFF',
        padding: '24px 48px',
        borderRadius: '8px',
        fontSize: '24px',
        fontFamily: 'monospace',
        fontWeight: 'bold',
        textAlign: 'center',
        zIndex: 2000,
        border: '2px solid #A64DFF',
        boxShadow: '0 0 30px rgba(166, 77, 255, 0.5)',
        animation: 'fadeInOut 3s ease-in-out'
      }}
    >
      <div style={{ fontSize: '32px', marginBottom: '8px' }}>✨ EVOLUTION ✨</div>
      <div>{theme} • Level {level}</div>
      <style>{`
        @keyframes fadeInOut {
          0% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
          20% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
          80% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
          100% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
        }
      `}</style>
    </div>
  );
};

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
