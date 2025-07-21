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
  const [mapStyle, setMapStyle] = useState('satellite');
  const [modulesExpanded, setModulesExpanded] = useState(false);
  const [fullScreenModule, setFullScreenModule] = useState<string | null>(null);
  
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

        {/* Full Width Tactical Map */}
        <div className={`relative w-full bg-black/20 border-b-2 border-cyan-500/20 transition-all duration-300 ${
          fullScreenModule ? 'h-[20vh]' : 'flex-1 min-h-[50vh] max-h-[70vh]'
        }`}>
          
          {/* Map Overlay Controls - Top Right */}
          <div className="absolute top-4 right-4 z-40 flex flex-wrap gap-2">
            <div className="flex gap-1 bg-black/60 backdrop-blur-sm rounded-full p-1">
              <button 
                className="px-3 py-1 text-xs text-white/90 hover:text-white hover:bg-white/10 rounded-full transition-all"
                onClick={() => setMapStyle('satellite')}
              >
                🛰️ Satellite
              </button>
              <button 
                className="px-3 py-1 text-xs text-white/90 hover:text-white hover:bg-white/10 rounded-full transition-all"
                onClick={() => setMapStyle('dark')}
              >
                🌑 Dark Military
              </button>
              <button 
                className="px-3 py-1 text-xs text-white/90 hover:text-white hover:bg-white/10 rounded-full transition-all"
                onClick={() => setMapStyle('terrain')}
              >
                🏔️ Terrain
              </button>
              <button 
                className="px-3 py-1 text-xs text-white/90 hover:text-white hover:bg-white/10 rounded-full transition-all"
                onClick={() => setMapStyle('standard')}
              >
                🗺️ Standard
              </button>
            </div>
            
            {/* FINAL SHOT Button Overlay */}
            <div className="bg-black/60 backdrop-blur-sm rounded-full p-1">
              <button 
                className="px-3 py-1 text-xs text-white/90 hover:text-white hover:bg-white/10 rounded-full transition-all font-semibold"
                onClick={() => {
                  setActiveModule('finalshotmap');
                  setFullScreenModule('finalshotmap');
                  setModulesExpanded(false);
                }}
              >
                🎯 FINAL SHOT
              </button>
            </div>
          </div>

          {/* Dynamic Content Area - Shows selected module content or placeholder */}
          <div className="absolute inset-0 w-full h-full">
            {activeModule && !fullScreenModule ? (
              // Module content in main area
              <div className="w-full h-full">
                {modules.find(m => m.id === activeModule)?.component}
              </div>
            ) : (
              // Placeholder when no module selected
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-black/30 to-black/60 backdrop-blur-sm">
                <div className="text-center text-white p-6">
                  <MapPin className="w-16 h-16 mx-auto mb-4 text-cyan-400" />
                  <h3 className="text-xl font-bold mb-2">Mappa Tattica M1SSION™</h3>
                  <p className="text-sm text-white/80 mb-4">Seleziona un modulo di intelligence dal pannello sottostante</p>
                  <p className="text-xs text-white/60">Mappa interattiva disponibile nei moduli Final Shot</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Full Screen Module Container */}
        {fullScreenModule && (
          <div className="flex-1 relative bg-black/90 backdrop-blur-xl border-t-2 border-cyan-500/20">
            {/* Full Screen Module Header */}
            <div className="absolute top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-sm border-b border-cyan-500/20 p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {modules.find(m => m.id === fullScreenModule)?.icon && (
                    <div className="w-6 h-6 text-cyan-400">
                      {React.createElement(modules.find(m => m.id === fullScreenModule)!.icon, { className: "w-6 h-6" })}
                    </div>
                  )}
                  <span className="text-white font-semibold uppercase tracking-wider text-sm">
                    {modules.find(m => m.id === fullScreenModule)?.name}
                  </span>
                </div>
                <button
                  onClick={() => {
                    setFullScreenModule(null);
                    setActiveModule(null);
                    setModulesExpanded(true);
                  }}
                  className="text-white/70 hover:text-white text-lg p-1 hover:bg-white/10 rounded"
                >
                  ✕
                </button>
              </div>
            </div>
            
            {/* Full Screen Module Content */}
            <div className="absolute inset-0 pt-16 pb-4 px-4 overflow-y-auto">
              {modules.find(m => m.id === fullScreenModule)?.component}
            </div>
          </div>
        )}

        {/* Intelligence Modules Stack - Mobile-First Collapsible */}
        {!fullScreenModule && (
          <div className="relative" style={{ 
            paddingBottom: 'calc(80px + env(safe-area-inset-bottom, 0px))'
          }}>
            {/* Modules Toggle Button */}
            <div className="sticky top-0 z-40 bg-black/90 backdrop-blur-xl border-t-2 border-cyan-500/20 p-4">
              <button
                onClick={() => setModulesExpanded(!modulesExpanded)}
                className="w-full bg-black/70 backdrop-blur-xl rounded-xl p-4 text-white shadow-[0_0_12px_rgba(255,255,255,0.1)] border border-white/10 hover:bg-black/80 hover:border-white/20 transition-all duration-300"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Brain className="w-5 h-5 text-cyan-400" />
                    <span className="font-semibold uppercase tracking-wider">Moduli Intelligence</span>
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

            {/* Collapsible Modules Grid */}
            <div className={`transition-all duration-500 overflow-hidden ${
              modulesExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
            }`}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 px-4 pb-4">
                {modules.map((module) => (
                  <div
                    key={module.id}
                    className={`bg-black/70 backdrop-blur-xl rounded-xl p-4 text-white shadow-[0_0_12px_rgba(255,255,255,0.1)] border border-white/10 transition-all duration-300 ${
                      module.available 
                        ? 'cursor-pointer hover:scale-[1.02] hover:bg-black/80 hover:border-cyan-500/30' 
                        : 'opacity-50 cursor-not-allowed'
                    }`}
                    onClick={() => {
                      if (module.available) {
                        setActiveModule(module.id);
                        setFullScreenModule(module.id);
                        setModulesExpanded(false);
                      }
                    }}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <module.icon className="w-5 h-5 text-cyan-400 flex-shrink-0" />
                      <span className="text-sm font-semibold text-white uppercase tracking-wider">
                        {module.name}
                      </span>
                      {!module.available && (
                        <span className="text-xs text-muted-foreground ml-auto flex-shrink-0">
                          Week {module.weekRequired}+
                        </span>
                      )}
                    </div>
                    
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
                    
                    {module.available && (
                      <div className="flex items-center justify-between pt-2 border-t border-white/10">
                        <span className="text-xs text-cyan-400 font-medium uppercase tracking-wide">● DISPONIBILE</span>
                        <span className="text-xs text-white/60">Tocca per aprire</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </SafeAreaWrapper>
  );
};

export default IntelligencePage;