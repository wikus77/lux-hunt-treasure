// Layer Toggle Panel - Control visibility of 3D map layers
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Layers, Users, Gift, Circle, FileText, ChevronDown, ChevronUp } from 'lucide-react';

interface LayerTogglePanelProps {
  layers: {
    agents: boolean;
    portals: boolean;
    rewards: boolean;
    areas: boolean;
    notes: boolean;
  };
  onToggle: (layer: keyof LayerTogglePanelProps['layers']) => void;
}

const LayerTogglePanel: React.FC<LayerTogglePanelProps> = ({ layers, onToggle }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const layerConfigs = [
    { key: 'agents' as const, label: 'Agents', icon: Users, color: '#FF3366' },
    { key: 'portals' as const, label: 'Portals', icon: Hexagon, color: '#00f0ff' },
    { key: 'rewards' as const, label: 'Rewards', icon: Gift, color: '#FFD700' },
    { key: 'areas' as const, label: 'Aree', icon: Circle, color: '#00D1FF' },
    { key: 'notes' as const, label: 'Note', icon: FileText, color: '#a855f7' },
  ];

  return (
    <div
      className="fixed right-4 z-[100]"
      style={{ 
        top: 'calc(env(safe-area-inset-top, 0px) + 96px)',
        pointerEvents: 'auto' 
      }}
    >
      {/* Collapsed state - Pill button */}
      {!isExpanded && (
        <button
          onClick={() => setIsExpanded(true)}
          className="flex items-center gap-2 px-4 py-2 bg-black/80 backdrop-blur-xl rounded-full border border-cyan-500/20 hover:border-cyan-500/40 transition-all"
        >
          <Layers className="w-4 h-4 text-cyan-400" />
          <span className="text-xs text-white font-bold font-orbitron">LAYERS</span>
        </button>
      )}

      {/* Expanded state - Full panel */}
      {isExpanded && (
        <div className="flex flex-col gap-2 bg-black/80 backdrop-blur-xl rounded-2xl p-3 border border-cyan-500/20 min-w-[160px]">
          <div 
            className="flex items-center justify-between mb-2 pb-2 border-b border-white/10 cursor-pointer"
            onClick={() => setIsExpanded(false)}
          >
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span className="text-xs text-white font-bold font-orbitron">LAYERS</span>
            </div>
            <ChevronUp className="w-4 h-4 text-cyan-400" />
          </div>
          
          {layerConfigs.map(({ key, label, icon: Icon, color }) => (
            <Button
              key={key}
              variant="ghost"
              size="sm"
              onClick={() => onToggle(key)}
              className={`justify-start gap-2 transition-all ${
                layers[key]
                  ? 'bg-white/10 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
              style={{
                borderLeft: layers[key] ? `3px solid ${color}` : '3px solid transparent'
              }}
            >
              <Icon className="w-4 h-4" style={{ color: layers[key] ? color : undefined }} />
              <span className="text-xs">{label}</span>
              <div className={`ml-auto w-2 h-2 rounded-full ${layers[key] ? 'bg-green-500' : 'bg-gray-600'}`} />
            </Button>
          ))}
        </div>
      )}
    </div>
  );
};

// Missing import
function Hexagon(props: any) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    </svg>
  );
}

export default LayerTogglePanel;

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
