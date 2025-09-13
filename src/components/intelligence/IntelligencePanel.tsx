// © 2025 Joseph MULÉ – M1SSION™ - ALL RIGHTS RESERVED - NIYVORA KFT

import React, { useState, useEffect } from 'react';
import { X, Brain, Target, BookOpen, Radar, Zap, Crosshair } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import CoordinateSelector from './CoordinateSelector';
import ClueJournal from './ClueJournal';
import GeoRadarTool from './GeoRadarTool';
import BuzzInterceptor from './BuzzInterceptor';
import PrecisionResult from './PrecisionResult';
import ClueArchive from './ClueArchive';
import FinalShotPage from './FinalShotPage';

interface IntelligencePanelProps {
  isOpen: boolean;
  onClose: () => void;
  currentWeek: number;
  finalShotFailed?: boolean;
  initialTool?: ToolType;
}

type ToolType = 'coordinates' | 'journal' | 'radar' | 'interceptor' | 'precision' | 'archive' | 'finalshot' | 'finalshotmap';

const IntelligencePanel: React.FC<IntelligencePanelProps> = ({
  isOpen,
  onClose,
  currentWeek,
  finalShotFailed = false,
  initialTool
}) => {
  const [activeTool, setActiveTool] = useState<ToolType>(initialTool ?? 'coordinates');

  useEffect(() => {
    if (initialTool && isOpen) {
      setActiveTool(initialTool);
    }
  }, [initialTool, isOpen]);

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
      case 'archive':
        return <ClueArchive />;
      case 'radar':
        return <GeoRadarTool />;
      case 'interceptor':
        return <BuzzInterceptor />;
      case 'precision':
        return <PrecisionResult />;
      case 'finalshot':
      case 'finalshotmap':
        return <FinalShotPage />;
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
          {/* Map Section - Full Width Priority */}
          <div className="flex-1 min-h-[60vh] max-h-[70vh] relative w-full">
            <div className="absolute inset-0 z-10 w-full">
              {renderActiveTool()}
            </div>
            
            {/* Map Overlay Controls - Top Right */}
            <div className="absolute top-4 right-4 z-40 flex flex-wrap gap-2">
              <div className="flex gap-1 bg-black/60 backdrop-blur-sm rounded-full p-1">
                <button 
                  type="button"
                  className="px-3 py-1 text-xs text-white/90 hover:text-white hover:bg-white/10 rounded-full transition-all cursor-pointer"
                  onClick={() => {
                    console.log('Satellite view toggled');
                    // Satellite view functionality can be implemented here
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      console.log('Satellite view toggled via keyboard');
                    }
                  }}
                  tabIndex={0}
                  role="button"
                  aria-label="Toggle satellite view"
                >
                  🛰️ Satellite
                </button>
                <button 
                  type="button"
                  className="px-3 py-1 text-xs text-white/90 hover:text-white hover:bg-white/10 rounded-full transition-all cursor-pointer"
                  onClick={() => console.log('Dark Military view')}
                >
                  🌑 Dark Military
                </button>
                <button 
                  type="button"
                  className="px-3 py-1 text-xs text-white/90 hover:text-white hover:bg-white/10 rounded-full transition-all cursor-pointer"
                  onClick={() => console.log('Terrain view')}
                >
                  🏔️ Terrain
                </button>
                <button 
                  type="button"
                  className="px-3 py-1 text-xs text-white/90 hover:text-white hover:bg-white/10 rounded-full transition-all cursor-pointer"
                  onClick={() => console.log('Standard view')}
                >
                  🗺️ Standard
                </button>
              </div>
              
              {/* FINAL SHOT Button Overlay */}
              <div className="bg-black/60 backdrop-blur-sm rounded-full p-1">
                <button 
                  type="button"
                  className="px-3 py-1 text-xs text-white/90 hover:text-white hover:bg-white/10 rounded-full transition-all font-semibold cursor-pointer"
                  onClick={() => setActiveTool('finalshotmap')}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setActiveTool('finalshotmap');
                    }
                  }}
                  aria-label="Apri Final Shot Mappa"
                >
                  🎯 FINAL SHOT
                </button>
              </div>
            </div>
          </div>

          {/* All Intelligence Modules Grid - Below Map - MOBILE SCROLLABLE FIX */}
          <div className="mt-8 w-full intelligence-scroll-container" style={{ 
            paddingBottom: 'calc(120px + env(safe-area-inset-bottom, 0px))',
            maxHeight: 'calc(100dvh - 50vh - 160px)',
            overflowY: 'auto',
            overflowX: 'hidden',
            WebkitOverflowScrolling: 'touch',
            scrollBehavior: 'smooth'
          }}>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 w-full max-w-screen-xl mx-auto px-4">
              
              {/* Coordinate Selector */}
              <div className={`bg-black/70 backdrop-blur-xl rounded-xl p-4 text-white shadow-[0_0_12px_rgba(255,255,255,0.1)] border border-white/10 transition-all duration-300 max-h-[180px] overflow-y-auto ${
                activeTool === 'coordinates' ? 'ring-2 ring-primary/50 bg-black/80' : 'hover:bg-black/75 hover:border-white/20'
              } cursor-pointer hover:scale-[1.02]`} 
              role="button"
              tabIndex={0}
              onClick={() => setActiveTool('coordinates')}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setActiveTool('coordinates');
                }
              }}>
                <div className="flex items-center gap-2 mb-3">
                  <Target className="w-4 h-4 text-primary flex-shrink-0" />
                  <span className="text-sm font-semibold text-white uppercase tracking-wider">Coordinate Selector</span>
                </div>
                <div className="text-xs text-white/80 leading-relaxed mb-2">
                  Select target coordinates for tactical operations
                </div>
                {activeTool === 'coordinates' && (
                  <div className="pt-2 border-t border-white/10">
                    <span className="text-xs text-primary font-medium uppercase tracking-wide">● ACTIVE MODULE</span>
                  </div>
                )}
              </div>

              {/* Clue Journal */}
              <div className={`bg-black/70 backdrop-blur-xl rounded-xl p-4 text-white shadow-[0_0_12px_rgba(255,255,255,0.1)] border border-white/10 transition-all duration-300 max-h-[180px] overflow-y-auto ${
                activeTool === 'journal' ? 'ring-2 ring-primary/50 bg-black/80' : 'hover:bg-black/75 hover:border-white/20'
              } cursor-pointer hover:scale-[1.02]`} 
              role="button"
              tabIndex={0}
              onClick={() => setActiveTool('journal')}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setActiveTool('journal');
                }
              }}>
                <div className="flex items-center gap-2 mb-3">
                  <BookOpen className="w-4 h-4 text-primary flex-shrink-0" />
                  <span className="text-sm font-semibold text-white uppercase tracking-wider">Clue Journal</span>
                </div>
                <div className="text-xs text-white/80 leading-relaxed mb-2">
                  Document and analyze discovered clues
                </div>
                {activeTool === 'journal' && (
                  <div className="pt-2 border-t border-white/10">
                    <span className="text-xs text-primary font-medium uppercase tracking-wide">● ACTIVE MODULE</span>
                  </div>
                )}
              </div>

              {/* Archivio Indizi */}
              <div className={`bg-black/70 backdrop-blur-xl rounded-xl p-4 text-white shadow-[0_0_12px_rgba(255,255,255,0.1)] border border-white/10 max-h-[180px] overflow-y-auto transition-all duration-300 ${
                activeTool === 'archive' ? 'ring-2 ring-primary/50 bg-black/80' : 'hover:bg-black/75 hover:border-white/20'
              } cursor-pointer hover:scale-[1.02]`}
              role="button"
              tabIndex={0}
              onClick={() => setActiveTool('archive')}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setActiveTool('archive');
                }
              }}>
                <div className="flex items-center gap-2 mb-3">
                  <BookOpen className="w-4 h-4 text-primary flex-shrink-0" />
                  <span className="text-sm font-semibold text-white uppercase tracking-wider">Archivio Indizi</span>
                </div>
                <div className="text-xs text-white/80 leading-relaxed">
                  Archive of all collected clues and evidence from previous missions
                </div>
              </div>

              {/* Indizi Settimanali */}
              <div className="bg-black/70 backdrop-blur-xl rounded-xl p-4 text-white shadow-[0_0_12px_rgba(255,255,255,0.1)] border border-white/10 max-h-[180px] overflow-y-auto hover:bg-black/75 hover:border-white/20 transition-all duration-300 cursor-pointer hover:scale-[1.02]"
                role="button"
                tabIndex={0}
                onClick={() => console.log('Indizi Settimanali clicked')}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    console.log('Indizi Settimanali activated via keyboard');
                  }
                }}
                aria-label="Visualizza Indizi Settimanali">
                <div className="flex items-center gap-2 mb-3">
                  <Target className="w-4 h-4 text-primary flex-shrink-0" />
                  <span className="text-sm font-semibold text-white uppercase tracking-wider">Indizi Settimanali</span>
                </div>
                <div className="text-xs text-white/80 leading-relaxed">
                  Weekly intelligence briefings and strategic updates
                </div>
              </div>

              {/* Geo Radar */}
              <div className={`bg-black/70 backdrop-blur-xl rounded-xl p-4 text-white shadow-[0_0_12px_rgba(255,255,255,0.1)] border border-white/10 transition-all duration-300 max-h-[180px] overflow-y-auto ${
                !tools.find(t => t.id === 'radar')?.available ? 'opacity-50 cursor-not-allowed' : 
                (activeTool === 'radar' ? 'ring-2 ring-primary/50 bg-black/80' : 'hover:bg-black/75 hover:border-white/20 cursor-pointer hover:scale-[1.02]')
              }`} 
              role="button"
              tabIndex={tools.find(t => t.id === 'radar')?.available ? 0 : -1}
              onClick={() => tools.find(t => t.id === 'radar')?.available && setActiveTool('radar')}
              onKeyDown={(e) => {
                if ((e.key === 'Enter' || e.key === ' ') && tools.find(t => t.id === 'radar')?.available) {
                  e.preventDefault();
                  setActiveTool('radar');
                }
              }}>
                <div className="flex items-center gap-2 mb-3">
                  <Radar className="w-4 h-4 text-primary flex-shrink-0" />
                  <span className="text-sm font-semibold text-white uppercase tracking-wider">Geo Radar</span>
                  {!tools.find(t => t.id === 'radar')?.available && (
                    <span className="text-xs text-muted-foreground ml-auto flex-shrink-0">Week 3+</span>
                  )}
                </div>
                <div className="text-xs text-white/80 leading-relaxed mb-2">
                  Advanced geo-radar scanning capabilities
                </div>
                {activeTool === 'radar' && tools.find(t => t.id === 'radar')?.available && (
                  <div className="pt-2 border-t border-white/10">
                    <span className="text-xs text-primary font-medium uppercase tracking-wide">● ACTIVE MODULE</span>
                  </div>
                )}
              </div>

              {/* BUZZ Interceptor */}
              <div className={`bg-black/70 backdrop-blur-xl rounded-xl p-4 text-white shadow-[0_0_12px_rgba(255,255,255,0.1)] border border-white/10 transition-all duration-300 max-h-[180px] overflow-y-auto ${
                !tools.find(t => t.id === 'interceptor')?.available ? 'opacity-50 cursor-not-allowed' : 
                (activeTool === 'interceptor' ? 'ring-2 ring-primary/50 bg-black/80' : 'hover:bg-black/75 hover:border-white/20 cursor-pointer hover:scale-[1.02]')
              }`} 
              role="button"
              tabIndex={tools.find(t => t.id === 'interceptor')?.available ? 0 : -1}
              onClick={() => tools.find(t => t.id === 'interceptor')?.available && setActiveTool('interceptor')}
              onKeyDown={(e) => {
                if ((e.key === 'Enter' || e.key === ' ') && tools.find(t => t.id === 'interceptor')?.available) {
                  e.preventDefault();
                  setActiveTool('interceptor');
                }
              }}>
                <div className="flex items-center gap-2 mb-3">
                  <Zap className="w-4 h-4 text-primary flex-shrink-0" />
                  <span className="text-sm font-semibold text-white uppercase tracking-wider">BUZZ Interceptor</span>
                  {!tools.find(t => t.id === 'interceptor')?.available && (
                    <span className="text-xs text-muted-foreground ml-auto flex-shrink-0">Week 4+</span>
                  )}
                </div>
                <div className="text-xs text-white/80 leading-relaxed mb-2">
                  BUZZ signal interception and analysis
                </div>
                {activeTool === 'interceptor' && tools.find(t => t.id === 'interceptor')?.available && (
                  <div className="pt-2 border-t border-white/10">
                    <span className="text-xs text-primary font-medium uppercase tracking-wide">● ACTIVE MODULE</span>
                  </div>
                )}
              </div>

              {/* Final Shot */}
              <div className="bg-black/70 backdrop-blur-xl rounded-xl p-4 text-white shadow-[0_0_12px_rgba(255,255,255,0.1)] border border-white/10 max-h-[180px] overflow-y-auto hover:bg-black/75 hover:border-white/20 transition-all duration-300 cursor-pointer"
                role="button"
                tabIndex={0}
                onClick={() => setActiveTool('finalshot')}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setActiveTool('finalshot');
                  }
                }}>
                <div className="flex items-center gap-2 mb-3">
                  <Crosshair className="w-4 h-4 text-primary flex-shrink-0" />
                  <span className="text-sm font-semibold text-white uppercase tracking-wider">Final Shot</span>
                </div>
                <div className="text-xs text-white/80 leading-relaxed">
                  Execute the final tactical shot when ready
                </div>
              </div>

              {/* Final Shot Mappa */}
              <div className="bg-black/70 backdrop-blur-xl rounded-xl p-4 text-white shadow-[0_0_12px_rgba(255,255,255,0.1)] border border-white/10 max-h-[180px] overflow-y-auto hover:bg-black/75 hover:border-white/20 transition-all duration-300 cursor-pointer hover:scale-[1.02]"
                role="button"
                tabIndex={0}
                onClick={() => setActiveTool('finalshotmap')}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setActiveTool('finalshotmap');
                  }
                }}
                aria-label="Apri Final Shot Mappa">
                <div className="flex items-center gap-2 mb-3">
                  <Target className="w-4 h-4 text-primary flex-shrink-0" />
                  <span className="text-sm font-semibold text-white uppercase tracking-wider">Final Shot Mappa</span>
                </div>
                <div className="text-xs text-white/80 leading-relaxed">
                  Interactive map for final shot coordinate selection
                </div>
              </div>

              {/* Precision Result */}
              <div className={`bg-black/70 backdrop-blur-xl rounded-xl p-4 text-white shadow-[0_0_12px_rgba(255,255,255,0.1)] border border-white/10 transition-all duration-300 max-h-[180px] overflow-y-auto ${
                !finalShotFailed ? 'opacity-50 cursor-not-allowed' : 
                (activeTool === 'precision' ? 'ring-2 ring-primary/50 bg-black/80' : 'hover:bg-black/75 hover:border-white/20 cursor-pointer hover:scale-[1.02]')
              }`} 
              role="button"
              tabIndex={finalShotFailed ? 0 : -1}
              onClick={() => finalShotFailed && setActiveTool('precision')}
              onKeyDown={(e) => {
                if ((e.key === 'Enter' || e.key === ' ') && finalShotFailed) {
                  e.preventDefault();
                  setActiveTool('precision');
                }
              }}>
                <div className="flex items-center gap-2 mb-3">
                  <Crosshair className="w-4 h-4 text-primary flex-shrink-0" />
                  <span className="text-sm font-semibold text-white uppercase tracking-wider">Precision Result</span>
                  {!finalShotFailed && (
                    <span className="text-xs text-muted-foreground ml-auto flex-shrink-0">After Failed Shot</span>
                  )}
                </div>
                <div className="text-xs text-white/80 leading-relaxed mb-2">
                  High-precision targeting results and analysis
                </div>
                {activeTool === 'precision' && finalShotFailed && (
                  <div className="pt-2 border-t border-white/10">
                    <span className="text-xs text-primary font-medium uppercase tracking-wide">● ACTIVE MODULE</span>
                  </div>
                )}
              </div>

              {/* Week 5 Unlocks */}
              <div className={`bg-black/70 backdrop-blur-xl rounded-xl p-4 text-white shadow-[0_0_12px_rgba(255,255,255,0.1)] border border-white/10 max-h-[180px] overflow-y-auto transition-all duration-300 ${
                currentWeek >= 5 ? 'ring-2 ring-primary/50 hover:bg-black/75 hover:border-white/20' : 'opacity-50'
              }`}>
                <div className="flex items-center gap-2 mb-3">
                  <Crosshair className="w-4 h-4 text-primary flex-shrink-0" />
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