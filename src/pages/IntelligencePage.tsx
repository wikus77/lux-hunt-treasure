// © 2025 Joseph MULÉ – M1SSION™ - ALL RIGHTS RESERVED - NIYVORA KFT

import React, { useEffect, useState } from 'react';
import { Brain, Target, BookOpen, Radar, Zap, Crosshair, Archive } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SafeAreaWrapper from '@/components/ui/SafeAreaWrapper';
import CoordinateSelector from '@/components/intelligence/CoordinateSelector';
import ClueJournal from '@/components/intelligence/ClueJournal';
import GeoRadarTool from '@/components/intelligence/GeoRadarTool';
import BuzzInterceptor from '@/components/intelligence/BuzzInterceptor';
import PrecisionResult from '@/components/intelligence/PrecisionResult';
import ClueArchive from '@/components/intelligence/ClueArchive';
import FinalShotManager from '@/components/intelligence/FinalShotManager';

type ToolType = 'coordinates' | 'journal' | 'radar' | 'interceptor' | 'precision' | 'archive' | 'finalshot';

const IntelligencePage: React.FC = () => {
  const [activeTool, setActiveTool] = useState<ToolType>('coordinates');
  
  // TODO: Get these from actual mission state
  const currentWeek = 1;
  const finalShotFailed = false;

  const tools = [
    {
      id: 'coordinates' as ToolType,
      name: 'Coordinate Selector',
      icon: Target,
      available: true, // Always available
      weekRequired: 1
    },
    {
      id: 'journal' as ToolType,
      name: 'Clue Journal',
      icon: BookOpen,
      available: true, // Always available
      weekRequired: 1
    },
    {
      id: 'archive' as ToolType,
      name: 'Archivio Indizi',
      icon: Archive,
      available: true, // Always available
      weekRequired: 1
    },
    {
      id: 'radar' as ToolType,
      name: 'Geo Radar',
      icon: Radar,
      available: true, // Temporarily unlocked for testing
      weekRequired: 3
    },
    {
      id: 'interceptor' as ToolType,
      name: 'BUZZ Interceptor',
      icon: Zap,
      available: true, // Temporarily unlocked for testing
      weekRequired: 4
    },
    {
      id: 'finalshot' as ToolType,
      name: 'Final Shot',
      icon: Target,
      available: true, // Available in final week
      weekRequired: 5
    },
    {
      id: 'precision' as ToolType,
      name: 'Precision Result',
      icon: Crosshair,
      available: finalShotFailed, // Only after failed final shot
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
      case 'finalshot':
        return <FinalShotManager />;
      case 'precision':
        return <PrecisionResult />;
      default:
        return <CoordinateSelector />;
    }
  };

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
        <div className="p-6 bg-gradient-to-r from-background/95 via-background/90 to-background/95 backdrop-blur-sm">
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-400 via-primary to-primary/80 flex items-center justify-center shadow-2xl shadow-cyan-500/20 mb-4">
              <Brain className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-4xl font-bold">
              <span className="text-cyan-400 glow-text">M1</span>
              <span className="text-white">SSION INTELLIGENCE PANEL™</span>
            </h1>
            <p className="text-muted-foreground mt-3 text-lg">
              Advanced tactical tools for mission analysis and coordination
            </p>
          </div>
        </div>

        <div className="flex h-full">
        {/* Tool Selector Sidebar */}
        <div className="w-80 p-6 bg-gradient-to-b from-background/60 via-background/50 to-background/60 backdrop-blur-md">
          <div className="space-y-4">
            {tools.map((tool) => (
              <Button
                key={tool.id}
                variant={activeTool === tool.id ? "default" : "ghost"}
                className={`w-full justify-start h-16 text-left rounded-2xl border-2 transition-all duration-300 ${
                  activeTool === tool.id 
                    ? 'bg-gradient-to-r from-cyan-500 via-primary to-primary/80 border-cyan-400/50 shadow-2xl shadow-cyan-500/30 text-white' 
                    : 'bg-card/40 border-border/50 hover:bg-card/70 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10 backdrop-blur-sm'
                } ${
                  !tool.available 
                    ? 'opacity-50 cursor-not-allowed' 
                    : ''
                }`}
                onClick={() => tool.available && setActiveTool(tool.id)}
                disabled={!tool.available}
              >
                <tool.icon className="w-6 h-6 mr-4 flex-shrink-0" />
                <div className="flex flex-col items-start min-w-0">
                  <span className="text-base font-medium truncate w-full">
                    {tool.name}
                  </span>
                  {!tool.available && (
                    <span className="text-sm opacity-70">
                      Unlocks Week {tool.weekRequired}
                    </span>
                  )}
                </div>
              </Button>
            ))}
          </div>
        </div>

        {/* Tool Content Area */}
        <div className="flex-1 min-h-0">
          <div className="h-full overflow-auto p-6 bg-gradient-to-br from-background/90 via-background/85 to-background/90">
            <div className="max-w-4xl mx-auto">
              {renderActiveTool()}
            </div>
          </div>
        </div>
        </div>
      </div>
    </SafeAreaWrapper>
  );
};

export default IntelligencePage;