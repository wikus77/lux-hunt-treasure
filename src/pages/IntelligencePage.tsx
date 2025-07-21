// © 2025 Joseph MULÉ – M1SSION™ - ALL RIGHTS RESERVED - NIYVORA KFT

import React, { useEffect, useState } from 'react';
import { Brain, Target, BookOpen, Radar, Zap, Crosshair, Archive, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SafeAreaWrapper from '@/components/ui/SafeAreaWrapper';
import CoordinateSelector from '@/components/intelligence/CoordinateSelector';
import ClueJournal from '@/components/intelligence/ClueJournal';
import GeoRadarTool from '@/components/intelligence/GeoRadarTool';
import BuzzInterceptor from '@/components/intelligence/BuzzInterceptor';
import PrecisionResult from '@/components/intelligence/PrecisionResult';
import ClueArchive from '@/components/intelligence/ClueArchive';
import FinalShotManager from '@/components/intelligence/FinalShotManager';
import FinalShotPage from '@/components/intelligence/FinalShotPage';
import WeeklyCluesIntegration from '@/components/intelligence/WeeklyCluesIntegration';

const IntelligencePage: React.FC = () => {
  const [activeModule, setActiveModule] = useState<string | null>(null);
  const [modulesExpanded, setModulesExpanded] = useState(false);
  
  // TODO: Get these from actual mission state
  const currentWeek = 1;
  const finalShotFailed = false;

  // Intelligence modules configuration
  const modules = [
    {
      id: 'coordinates',
      name: 'Coordinate Selector',
      icon: Target,
      component: <CoordinateSelector />,
      available: true,
      weekRequired: 1
    },
    {
      id: 'journal',
      name: 'Clue Journal',
      icon: BookOpen,
      component: <ClueJournal />,
      available: true,
      weekRequired: 1
    },
    {
      id: 'archive',
      name: 'Archivio Indizi',
      icon: Archive,
      component: <ClueArchive />,
      available: true,
      weekRequired: 1
    },
    {
      id: 'weeklyClues',
      name: 'Indizi Settimanali',
      icon: BookOpen,
      component: <WeeklyCluesIntegration />,
      available: true,
      weekRequired: 1
    },
    {
      id: 'radar',
      name: 'Geo Radar',
      icon: Radar,
      component: <GeoRadarTool />,
      available: currentWeek >= 3,
      weekRequired: 3
    },
    {
      id: 'interceptor',
      name: 'BUZZ Interceptor',
      icon: Zap,
      component: <BuzzInterceptor />,
      available: currentWeek >= 4,
      weekRequired: 4
    },
    {
      id: 'finalshot',
      name: 'Final Shot',
      icon: Target,
      component: <FinalShotManager />,
      available: true,
      weekRequired: 5
    },
    {
      id: 'finalshotmap',
      name: 'Final Shot Mappa',
      icon: Crosshair,
      component: <FinalShotPage />,
      available: true,
      weekRequired: 5
    },
    {
      id: 'precision',
      name: 'Precision Result',
      icon: Crosshair,
      component: <PrecisionResult />,
      available: finalShotFailed,
      weekRequired: 5
    }
  ];

  // Log mount for debugging
  useEffect(() => {
    console.log('🧠 IntelligencePage mounted successfully');
    console.log('🧠 Current path:', window.location.pathname);
    
    // Force scroll to top on iOS
    if (typeof window !== 'undefined') {
      window.scrollTo(0, 0);
    }
    
    return () => {
      console.log('🧠 IntelligencePage unmounting');
    };
  }, []);

  return (
    <SafeAreaWrapper className="h-full bg-background">
      <div className="flex flex-col h-[100dvh] w-full overflow-hidden" style={{
        paddingTop: 'calc(env(safe-area-inset-top, 0px) + 20px)',
        paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 80px)'
      }}>
        
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-background/95 via-background/90 to-background/95 backdrop-blur-sm">
          <div className="flex flex-col items-center text-center">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 via-primary to-primary/80 flex items-center justify-center shadow-2xl shadow-cyan-500/20 mb-3">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold">
              <span className="text-cyan-400 glow-text">M1</span>
              <span className="text-white">SSION INTELLIGENCE PANEL™</span>
            </h1>
            <p className="text-muted-foreground mt-2 text-sm sm:text-base">
              Advanced tactical tools for mission analysis and coordination
            </p>
          </div>
        </div>

        {/* FULLSCREEN MODULE AREA - SINGLE RENDERING ONLY */}
        <div className="flex-1 w-full relative bg-black/20 border-b-2 border-cyan-500/20 overflow-hidden">
          {activeModule ? (
            <div className="absolute inset-0 w-full h-full overflow-y-auto">
              {/* Close Module Button */}
              <button
                onClick={() => {
                  setActiveModule(null);
                  setModulesExpanded(true);
                }}
                className="absolute top-4 left-4 z-50 bg-black/80 backdrop-blur-sm text-white/70 hover:text-white text-lg p-2 hover:bg-white/10 rounded-full transition-all shadow-lg"
              >
                ✕
              </button>
              
              {/* Module Content Container - SCROLLABLE AND SIZED CORRECTLY */}
              <div className="w-full h-full min-h-[calc(100dvh-env(safe-area-inset-top,0px)-env(safe-area-inset-bottom,0px)-160px)]">
                {modules.find(m => m.id === activeModule)?.component}
              </div>
            </div>
          ) : (
            // Default Placeholder - When no module selected
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-black/30 to-black/60 backdrop-blur-sm">
              <div className="text-center text-white p-6">
                <MapPin className="w-16 h-16 mx-auto mb-4 text-cyan-400" />
                <h3 className="text-xl font-bold mb-2">Mappa Tattica M1SSION™</h3>
                <p className="text-sm text-white/80 mb-4">Seleziona un modulo di intelligence dal pannello sottostante</p>
                <p className="text-xs text-white/60">Moduli disponibili: Final Shot Mappa, Geo Radar, Clue Journal e altri</p>
              </div>
            </div>
          )}
        </div>

        {/* COLLAPSIBLE MODULES MENU - FIXED BOTTOM SECTION */}
        <div className="fixed bottom-0 left-0 right-0 z-[9999]" style={{ 
          paddingBottom: 'calc(80px + env(safe-area-inset-bottom, 0px))',
          zIndex: 9999999
        }}>
          {/* Module Selection Button */}
          <div className="bg-black/90 backdrop-blur-xl border-t-2 border-cyan-500/20 p-4">
            <button
              onClick={() => setModulesExpanded(!modulesExpanded)}
              className="w-full bg-black/70 backdrop-blur-xl rounded-xl p-4 text-white shadow-[0_0_12px_rgba(255,255,255,0.1)] border border-white/10 hover:bg-black/80 hover:border-white/20 transition-all duration-300"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Brain className="w-5 h-5 text-cyan-400" />
                  <span className="font-semibold uppercase tracking-wider">Moduli Intelligence</span>
                  {activeModule && (
                    <span className="text-xs text-cyan-400 bg-cyan-400/20 px-2 py-1 rounded-full">
                      {modules.find(m => m.id === activeModule)?.name} ATTIVO
                    </span>
                  )}
                </div>
                <div className={`transition-transform duration-300 ${modulesExpanded ? 'rotate-180' : ''}`}>
                  ▼
                </div>
              </div>
              <div className="text-xs text-white/60 mt-2 text-left">
                {modulesExpanded ? 'Tocca per chiudere i moduli' : 'Tocca per aprire i moduli di intelligence'}
              </div>
            </button>
          </div>

          {/* MODULES GRID - SELECTOR ONLY, NO CONTENT */}
          <div className={`transition-all duration-500 overflow-hidden ${
            modulesExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
          }`}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 px-4 pb-4 bg-black/90 backdrop-blur-xl">
              {modules.map((module) => {
                const isCurrentlyActive = activeModule === module.id;
                
                return (
                  <div
                    key={module.id}
                    className={`bg-black/70 backdrop-blur-xl rounded-xl p-4 text-white shadow-[0_0_12px_rgba(255,255,255,0.1)] border transition-all duration-300 ${
                      isCurrentlyActive 
                        ? 'border-cyan-500/80 bg-cyan-500/20' 
                        : 'border-white/10'
                    } ${
                      module.available 
                        ? 'cursor-pointer hover:scale-[1.02] hover:bg-black/80 hover:border-cyan-500/30' 
                        : 'opacity-50 cursor-not-allowed'
                    }`}
                    onClick={() => {
                      if (module.available) {
                        console.log('🧠 Module selected:', module.id, module.name);
                        setActiveModule(module.id);
                        setModulesExpanded(false);
                      }
                    }}
                  >
                    {/* Module Header - SELECTORS ONLY */}
                    <div className="flex items-center gap-2 mb-3">
                      <module.icon className="w-5 h-5 text-cyan-400 flex-shrink-0" />
                      <span className="text-sm font-semibold text-white uppercase tracking-wider">
                        {module.name}
                      </span>
                      {isCurrentlyActive && (
                        <span className="text-xs text-cyan-400 ml-auto flex-shrink-0 font-bold">
                          ● ATTIVO
                        </span>
                      )}
                      {!module.available && (
                        <span className="text-xs text-muted-foreground ml-auto flex-shrink-0">
                          Week {module.weekRequired}+
                        </span>
                      )}
                    </div>
                    
                    {/* Module Description */}
                    <div className="text-xs text-white/80 leading-relaxed mb-3">
                      {module.id === 'coordinates' && 'Select target coordinates for tactical operations'}
                      {module.id === 'journal' && 'Document and analyze discovered clues'}
                      {module.id === 'archive' && 'Archive of all collected clues and evidence from previous missions'}
                      {module.id === 'weeklyClues' && 'Weekly intelligence briefings and strategic updates'}
                      {module.id === 'radar' && 'Advanced geo-radar scanning capabilities'}
                      {module.id === 'interceptor' && 'BUZZ signal interception and analysis'}
                      {module.id === 'finalshot' && 'Execute the final tactical shot when ready'}
                      {module.id === 'finalshotmap' && 'Interactive map for final shot coordinate selection'}
                      {module.id === 'precision' && 'High-precision targeting results and analysis'}
                    </div>
                    
                    {/* Module Status */}
                    {module.available && (
                      <div className="flex items-center justify-between pt-2 border-t border-white/10">
                        <span className={`text-xs font-medium uppercase tracking-wide ${
                          isCurrentlyActive ? 'text-cyan-400' : 'text-cyan-400'
                        }`}>
                          {isCurrentlyActive ? '● ATTIVO' : '● DISPONIBILE'}
                        </span>
                        <span className="text-xs text-white/60">
                          {isCurrentlyActive ? 'Visualizzato sopra' : 'Tocca per aprire'}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>
    </SafeAreaWrapper>
  );
};

export default IntelligencePage;