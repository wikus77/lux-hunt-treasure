// © 2025 Joseph MULÉ – M1SSION™ - ALL RIGHTS RESERVED - NIYVORA KFT

import React, { useState } from 'react';
import { X, Brain, Target, BookOpen, Radar, Zap, Crosshair } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import CoordinateSelector from './CoordinateSelector';
import ClueJournal from './ClueJournal';
import GeoRadarTool from './GeoRadarTool';
import BuzzInterceptor from './BuzzInterceptor';
import PrecisionResult from './PrecisionResult';

interface IntelligencePanelProps {
  isOpen: boolean;
  onClose: () => void;
  currentWeek: number;
  finalShotFailed?: boolean;
}

type ToolType = 'coordinates' | 'journal' | 'radar' | 'interceptor' | 'precision';

const IntelligencePanel: React.FC<IntelligencePanelProps> = ({
  isOpen,
  onClose,
  currentWeek,
  finalShotFailed = false
}) => {
  const [activeTool, setActiveTool] = useState<ToolType>('coordinates');

  const tools = [
    {
      id: 'coordinates' as ToolType,
      name: 'Coordinate Selector',
      icon: Target,
      available: true,
      weekRequired: 1
    },
    {
      id: 'journal' as ToolType,
      name: 'Clue Journal',
      icon: BookOpen,
      available: true,
      weekRequired: 1
    },
    {
      id: 'radar' as ToolType,
      name: 'Geo Radar',
      icon: Radar,
      available: currentWeek >= 3,
      weekRequired: 3
    },
    {
      id: 'interceptor' as ToolType,
      name: 'BUZZ Interceptor',
      icon: Zap,
      available: currentWeek >= 4,
      weekRequired: 4
    },
    {
      id: 'precision' as ToolType,
      name: 'Precision Result',
      icon: Crosshair,
      available: finalShotFailed,
      weekRequired: 5
    }
  ];

  const renderActiveTool = () => {
    switch (activeTool) {
      case 'coordinates':
        return <CoordinateSelector />;
      case 'journal':
        return <ClueJournal />;
      case 'radar':
        return <GeoRadarTool />;
      case 'interceptor':
        return <BuzzInterceptor />;
      case 'precision':
        return <PrecisionResult />;
      default:
        return <CoordinateSelector />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl h-[95vh] bg-background border border-border overflow-hidden">
        <DialogHeader className="border-b border-border pb-4">
          <DialogTitle className="flex items-center gap-3 text-2xl font-bold text-foreground">
            <Brain className="w-8 h-8 text-primary" />
            M1SSION INTELLIGENCE PANEL™
          </DialogTitle>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={onClose}
            className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"
          >
            <X className="w-5 h-5" />
          </Button>
        </DialogHeader>

        <div className="flex flex-col h-full overflow-hidden">
          {/* Map Section - Expanded Priority */}
          <div className="flex-1 min-h-[70vh] max-h-[75vh] relative">
            <div className="absolute inset-0 z-10">
              {renderActiveTool()}
            </div>
            
            {/* Map Overlay Controls - Top Right */}
            <div className="absolute top-4 right-4 z-40 flex flex-wrap gap-2">
              <div className="flex gap-1 bg-black/60 backdrop-blur-sm rounded-full p-1">
                <button className="px-3 py-1 text-xs text-white/90 hover:text-white hover:bg-white/10 rounded-full transition-all">
                  🛰️ Satellite
                </button>
                <button className="px-3 py-1 text-xs text-white/90 hover:text-white hover:bg-white/10 rounded-full transition-all">
                  🌑 Dark
                </button>
                <button className="px-3 py-1 text-xs text-white/90 hover:text-white hover:bg-white/10 rounded-full transition-all">
                  🏔️ Terrain
                </button>
                <button className="px-3 py-1 text-xs text-white/90 hover:text-white hover:bg-white/10 rounded-full transition-all">
                  🗺️ Standard
                </button>
              </div>
            </div>
          </div>

          {/* Intelligence Modules Grid - Below Map */}
          <div className="mt-8 overflow-y-auto overflow-x-hidden" style={{ paddingBottom: 'calc(80px + env(safe-area-inset-bottom, 0px))' }}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-8">
              {tools.map((tool) => (
                <div
                  key={tool.id}
                  className={`bg-black/70 backdrop-blur-xl rounded-xl p-4 text-white 
                    shadow-[0_0_12px_rgba(255,255,255,0.1)] border border-white/10 
                    transition-all duration-300 max-h-[160px] overflow-y-auto ${
                    activeTool === tool.id 
                      ? 'ring-2 ring-primary/50 bg-black/80 scale-[1.02]' 
                      : 'hover:bg-black/75 hover:border-white/20 hover:shadow-[0_0_16px_rgba(255,255,255,0.15)]'
                  } ${
                    !tool.available 
                      ? 'opacity-50 cursor-not-allowed' 
                      : 'cursor-pointer hover:scale-[1.02]'
                  }`}
                  onClick={() => tool.available && setActiveTool(tool.id)}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <tool.icon className="w-4 h-4 text-primary flex-shrink-0" />
                    <span className="text-sm font-semibold text-white uppercase tracking-wider truncate">
                      {tool.name}
                    </span>
                    {!tool.available && (
                      <span className="text-xs text-muted-foreground ml-auto flex-shrink-0">
                        Week {tool.weekRequired}+
                      </span>
                    )}
                  </div>
                  
                  <div className="text-xs text-white/80 leading-relaxed mb-2">
                    {tool.id === 'coordinates' && 'Select target coordinates for tactical operations'}
                    {tool.id === 'journal' && 'Document and analyze discovered clues'}
                    {tool.id === 'radar' && 'Advanced geo-radar scanning capabilities'}
                    {tool.id === 'interceptor' && 'BUZZ signal interception and analysis'}
                    {tool.id === 'precision' && 'High-precision targeting results'}
                  </div>
                  
                  {activeTool === tool.id && (
                    <div className="pt-2 border-t border-white/10">
                      <span className="text-xs text-primary font-medium uppercase tracking-wide">
                        ● ACTIVE MODULE
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Additional Intelligence Sections */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
              {/* Archivio Indizi */}
              <div className="bg-black/70 backdrop-blur-xl rounded-xl p-4 text-white shadow-[0_0_12px_rgba(255,255,255,0.1)] border border-white/10 max-h-[160px] overflow-y-auto">
                <div className="flex items-center gap-2 mb-3">
                  <BookOpen className="w-4 h-4 text-primary" />
                  <span className="text-sm font-semibold text-white uppercase tracking-wider">Archivio Indizi</span>
                </div>
                <div className="text-xs text-white/80 leading-relaxed">
                  Archive of all collected clues and evidence from previous missions
                </div>
              </div>

              {/* Indizi Settimanali */}
              <div className="bg-black/70 backdrop-blur-xl rounded-xl p-4 text-white shadow-[0_0_12px_rgba(255,255,255,0.1)] border border-white/10 max-h-[160px] overflow-y-auto">
                <div className="flex items-center gap-2 mb-3">
                  <Target className="w-4 h-4 text-primary" />
                  <span className="text-sm font-semibold text-white uppercase tracking-wider">Indizi Settimanali</span>
                </div>
                <div className="text-xs text-white/80 leading-relaxed">
                  Weekly intelligence briefings and strategic updates
                </div>
              </div>

              {/* Week 5 Unlocks */}
              <div className={`bg-black/70 backdrop-blur-xl rounded-xl p-4 text-white shadow-[0_0_12px_rgba(255,255,255,0.1)] border border-white/10 max-h-[160px] overflow-y-auto ${
                currentWeek >= 5 ? 'ring-2 ring-primary/50' : 'opacity-50'
              }`}>
                <div className="flex items-center gap-2 mb-3">
                  <Crosshair className="w-4 h-4 text-primary" />
                  <span className="text-sm font-semibold text-white uppercase tracking-wider">Week 5 Unlocks</span>
                </div>
                <div className="text-xs text-white/80 leading-relaxed">
                  {currentWeek >= 5 ? 'Advanced tactical systems now available' : 'Unlocks at Week 5'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default IntelligencePanel;