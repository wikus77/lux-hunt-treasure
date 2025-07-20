// © 2025 Joseph MULÉ – M1SSION™ - ALL RIGHTS RESERVED - NIYVORA KFT

import React, { useEffect, useState } from 'react';
import { Brain, Target, BookOpen, Radar, Zap, Crosshair } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SafeAreaWrapper from '@/components/ui/SafeAreaWrapper';
import CoordinateSelector from '@/components/intelligence/CoordinateSelector';
import ClueJournal from '@/components/intelligence/ClueJournal';
import GeoRadarTool from '@/components/intelligence/GeoRadarTool';
import BuzzInterceptor from '@/components/intelligence/BuzzInterceptor';
import PrecisionResult from '@/components/intelligence/PrecisionResult';

type ToolType = 'coordinates' | 'journal' | 'radar' | 'interceptor' | 'precision';

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
        <div className="border-b border-border p-6 bg-background/95 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <Brain className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">
              M1SSION INTELLIGENCE PANEL™
            </h1>
          </div>
          <p className="text-muted-foreground mt-2">
            Advanced tactical tools for mission analysis and coordination
          </p>
        </div>

        <div className="flex h-full">
          {/* Tool Selector Sidebar */}
          <div className="w-80 border-r border-border p-6 bg-background/50">
            <div className="space-y-3">
              {tools.map((tool) => (
                <Button
                  key={tool.id}
                  variant={activeTool === tool.id ? "default" : "ghost"}
                  className={`w-full justify-start h-16 text-left ${
                    !tool.available 
                      ? 'opacity-50 cursor-not-allowed' 
                      : 'hover:bg-muted'
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
                      <span className="text-sm text-muted-foreground">
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
            <div className="h-full overflow-auto p-6">
              {renderActiveTool()}
            </div>
          </div>
        </div>
      </div>
    </SafeAreaWrapper>
  );
};

export default IntelligencePage;