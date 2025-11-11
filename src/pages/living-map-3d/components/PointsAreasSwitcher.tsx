/**
 * Points/Areas Switcher - Toggle between points and areas view
 */
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MapPin, Circle } from 'lucide-react';

const PointsAreasSwitcher: React.FC = () => {
  const [mode, setMode] = useState<'points' | 'areas'>('points');

  return (
    <div
      className="fixed bottom-24 right-4 z-90 flex items-center gap-2 bg-[rgba(5,14,22,0.95)] border border-[rgba(10,239,255,0.4)] backdrop-blur-md"
      style={{
        borderRadius: '12px',
        padding: '8px',
        boxShadow: '0 0 25px rgba(10, 239, 255, 0.3)',
      }}
    >
      {/* Points Button */}
      <Button
        variant={mode === 'points' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => setMode('points')}
        className={mode === 'points' 
          ? 'bg-[rgba(10,239,255,0.2)] hover:bg-[rgba(10,239,255,0.3)] border border-[rgba(10,239,255,0.5)]' 
          : 'hover:bg-[rgba(10,239,255,0.1)]'
        }
        style={{
          borderRadius: '8px',
          padding: '8px 16px',
        }}
        title="Punti"
      >
        <MapPin className="w-4 h-4 mr-2" style={{ filter: 'drop-shadow(0 0 4px rgba(10, 239, 255, 0.8))' }} />
        <span className="font-orbitron text-xs" style={{ color: '#0AEFFF', textShadow: '0 0 8px rgba(10, 239, 255, 0.6)' }}>
          Punti
        </span>
      </Button>

      {/* Areas Button */}
      <Button
        variant={mode === 'areas' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => setMode('areas')}
        className={mode === 'areas' 
          ? 'bg-[rgba(10,239,255,0.2)] hover:bg-[rgba(10,239,255,0.3)] border border-[rgba(10,239,255,0.5)]' 
          : 'hover:bg-[rgba(10,239,255,0.1)]'
        }
        style={{
          borderRadius: '8px',
          padding: '8px 16px',
        }}
        title="Aree"
      >
        <Circle className="w-4 h-4 mr-2" style={{ filter: 'drop-shadow(0 0 4px rgba(10, 239, 255, 0.8))' }} />
        <span className="font-orbitron text-xs" style={{ color: '#0AEFFF', textShadow: '0 0 8px rgba(10, 239, 255, 0.6)' }}>
          Aree
        </span>
      </Button>
    </div>
  );
};

export default PointsAreasSwitcher;

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
