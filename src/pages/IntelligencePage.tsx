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
        <div className="flex-1 relative min-h-[40vh] max-h-[60vh] w-full bg-black/20 border-b-2 border-cyan-500/20">
          
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
                onClick={() => setActiveModule('finalshotmap')}
              >
                🎯 FINAL SHOT
              </button>
            </div>
          </div>

          {/* Map Content or Active Module */}
          <div className="absolute inset-0 w-full h-full">
            {activeModule ? (
              <div className="w-full h-full p-4 overflow-y-auto">
                {modules.find(m => m.id === activeModule)?.component}
              </div>
            ) : (
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

        {/* Intelligence Modules Grid - Below Map */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden w-full" style={{ 
          paddingBottom: 'calc(120px + env(safe-area-inset-bottom, 0px))',
          marginTop: '2rem'
        }}>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 w-full max-w-screen-xl mx-auto px-4">
            
            {modules.map((module) => (
              <div
                key={module.id}
                className={`bg-black/70 backdrop-blur-xl rounded-xl p-4 text-white shadow-[0_0_12px_rgba(255,255,255,0.1)] border border-white/10 transition-all duration-300 max-h-[180px] overflow-y-auto ${
                  activeModule === module.id 
                    ? 'ring-2 ring-primary/50 bg-black/80' 
                    : 'hover:bg-black/75 hover:border-white/20'
                } ${
                  module.available 
                    ? 'cursor-pointer hover:scale-[1.02]' 
                    : 'opacity-50 cursor-not-allowed'
                }`}
                onClick={() => module.available && setActiveModule(activeModule === module.id ? null : module.id)}
              >
                <div className="flex items-center gap-2 mb-3">
                  <module.icon className="w-4 h-4 text-primary flex-shrink-0" />
                  <span className="text-sm font-semibold text-white uppercase tracking-wider">
                    {module.name}
                  </span>
                  {!module.available && (
                    <span className="text-xs text-muted-foreground ml-auto flex-shrink-0">
                      Week {module.weekRequired}+
                    </span>
                  )}
                </div>
                
                <div className="text-xs text-white/80 leading-relaxed mb-2">
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
                
                {activeModule === module.id && module.available && (
                  <div className="pt-2 border-t border-white/10">
                    <span className="text-xs text-primary font-medium uppercase tracking-wide">● ACTIVE MODULE</span>
                  </div>
                )}
              </div>
            ))}
            
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
    </SafeAreaWrapper>
  );
};

export default IntelligencePage;