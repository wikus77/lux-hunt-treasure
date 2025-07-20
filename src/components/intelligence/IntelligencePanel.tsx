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
      <DialogContent className="max-w-6xl h-[90vh] bg-background border border-border">
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

        <div className="flex h-full gap-6 pt-4">
          {/* Tool Selector Sidebar */}
          <div className="w-64 border-r border-border pr-6">
            <div className="space-y-2">
              {tools.map((tool) => (
                <Button
                  key={tool.id}
                  variant={activeTool === tool.id ? "default" : "ghost"}
                  className={`w-full justify-start h-12 ${
                    !tool.available 
                      ? 'opacity-50 cursor-not-allowed' 
                      : 'hover:bg-muted'
                  }`}
                  onClick={() => tool.available && setActiveTool(tool.id)}
                  disabled={!tool.available}
                >
                  <tool.icon className="w-5 h-5 mr-3" />
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-medium">{tool.name}</span>
                    {!tool.available && (
                      <span className="text-xs text-muted-foreground">
                        Week {tool.weekRequired}+
                      </span>
                    )}
                  </div>
                </Button>
              ))}
            </div>
          </div>

          {/* Tool Content Area */}
          <div className="flex-1 min-h-0">
            <div className="h-full overflow-auto">
              {renderActiveTool()}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default IntelligencePanel;