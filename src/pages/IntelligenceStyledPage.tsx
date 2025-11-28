/*
 * 🔐 FIRMATO: BY JOSEPH MULÈ — CEO di NIYVORA KFT™
 * M1SSION™ Intelligence - Styled Settings Page
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  Brain, 
  Target, 
  BookOpen, 
  Radar, 
  Zap, 
  Crosshair, 
  Archive, 
  MapPin,
  Shield,
  Eye,
  Activity,
  Database
} from 'lucide-react';
import { useLocation } from 'wouter';
import AiOrbStage from '@/components/intel/ui/AiOrbStage';
import AIAnalystPanel from '@/components/intel/ai-analyst/AIAnalystPanel';
import { useIntelAnalyst } from '@/hooks/useIntelAnalyst';
import { useMicLevel } from '@/components/intel/hooks/useMicLevel';

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
import { setupRealtimeSubscriptions } from '@/intelligence/context/realtime';

// Keyboard shortcut handler
const useKeyboardShortcut = (key: string, callback: () => void) => {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === key.toLowerCase() && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const target = e.target as HTMLElement;
        if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
          e.preventDefault();
          callback();
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [key, callback]);
};

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
const IntelligenceStyledPage: React.FC = () => {
  const [, setLocation] = useLocation();
  const [panelOpen, setPanelOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Set up realtime subscriptions on mount (with error handling)
  useEffect(() => {
    try {
      const cleanup = setupRealtimeSubscriptions();
      return cleanup;
    } catch (err) {
      console.error('[Intelligence] Realtime setup error:', err);
    }
  }, []);
  
  // AI Analyst hook
  const {
    messages,
    isProcessing,
    status,
    currentMode,
    clues,
    ttsEnabled,
    audioLevel,
    agentContext,
    sendMessage,
    toggleTTS
  } = useIntelAnalyst();
  
  // Fast loading - reduce wait time
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500); // Reduced from 2000ms
    return () => clearTimeout(timer);
  }, []);

  // Feature flag: URL ?intel_ai=1 or default ON
  const aiEnabled = (() => {
    const params = new URLSearchParams(window.location.search);
    const urlFlag = params.get('intel_ai');
    // If ?intel_ai=0 explicitly set, disable; otherwise default ON
    return urlFlag === '0' ? false : true;
  })();
  
  // Microphone level hook
  const { level: micLevel } = useMicLevel(panelOpen && ttsEnabled);
  
  // Keyboard shortcut: A to open/close AI Analyst
  useKeyboardShortcut('a', () => {
    if (aiEnabled) {
      setPanelOpen(prev => !prev);
    }
  });
  const INTEL_ROUTES: Record<string, string> = {
    coordinates: '/intelligence/coordinates',
    journal: '/intelligence/clue-journal',
    archive: '/intelligence/archive',
    radar: '/intelligence/radar',
    interceptor: '/intelligence/interceptor',
    finalshot: '/intelligence/final-shot',
    finalshotmap: '/intelligence/final-shot'
  };

  const intelligenceModules = [
    {
      id: 'coordinates',
      name: 'Coordinate Selector',
      icon: Target,
      description: 'Selezione coordinate per operazioni tattiche',
      status: 'Disponibile',
      level: 'Livello 1'
    },
    {
      id: 'journal',
      name: 'Clue Journal',
      icon: BookOpen,
      description: 'Documentazione e analisi degli indizi',
      status: 'Disponibile',
      level: 'Livello 1'
    },
    {
      id: 'archive',
      name: 'Archivio Indizi',
      icon: Archive,
      description: 'Archivio completo degli indizi raccolti',
      status: 'Disponibile',
      level: 'Livello 1'
    },
    {
      id: 'radar',
      name: 'Geo Radar',
      icon: Radar,
      description: 'Capacità avanzate di scansione geo-radar',
      status: 'Settimana 3+',
      level: 'Livello 3'
    },
    {
      id: 'interceptor',
      name: 'BUZZ Interceptor',
      icon: Zap,
      description: 'Intercettazione e analisi segnali BUZZ',
      status: 'Settimana 4+',
      level: 'Livello 4'
    },
    {
      id: 'finalshot',
      name: 'Final Shot',
      icon: Crosshair,
      description: 'Esecuzione del colpo finale tattico',
      status: 'Settimana 5+',
      level: 'Livello 5'
    }
  ];

  const getStatusColor = (status: string) => {
    if (status === 'Disponibile') return 'bg-green-500/20 text-green-400 border-green-500/30';
    return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Livello 1': return 'text-green-400';
      case 'Livello 3': return 'text-blue-400';
      case 'Livello 4': return 'text-purple-400';
      case 'Livello 5': return 'text-red-400';
      default: return 'text-cyan-400';
    }
  };

  const openModule = (moduleId: string, status?: string) => {
    if (status && status !== 'Disponibile') {
      // Non navigare se il modulo è bloccato
      return;
    }
    
    const path = INTEL_ROUTES[moduleId];
    if (path) setLocation(path);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#070818] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mx-auto" />
          <p className="text-cyan-400 font-orbitron">Caricamento Intelligence...</p>
        </div>
      </div>
    );
  }

  // New Stage UI when AI enabled
  if (aiEnabled) {
    return (
      <>
        {/* Full Stage when panel closed */}
        {!panelOpen && (
          <AiOrbStage
            status={status}
            audioLevel={micLevel || audioLevel}
            onOrbClick={() => setPanelOpen(true)}
            micEnabled={ttsEnabled}
            onMicToggle={toggleTTS}
            onMoreClick={() => setPanelOpen(true)}
            onFinalShotClick={() => setLocation('/intelligence/final-shot')}
          />
        )}
        
        {/* Panel overlays stage when open */}
        <AIAnalystPanel 
          isOpen={panelOpen}
          onClose={() => setPanelOpen(false)}
          messages={messages}
          isProcessing={isProcessing}
          onSendMessage={(msg, mode) => sendMessage(msg, mode)}
          currentMode={currentMode}
          cluesCount={clues.length}
          status={status}
          audioLevel={micLevel || audioLevel}
          agentContext={agentContext}
          ttsEnabled={ttsEnabled}
          onToggleTTS={toggleTTS}
        />
      </>
    );
  }

  // Legacy UI when AI disabled
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background/95 to-background/90">
      <main className="pt-4 pb-20 px-4" data-build="intel-esm-001">
        <div className="max-w-lg mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center space-x-4 mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation('/settings')}
              className="p-2 hover:bg-background/50"
            >
              ←
            </Button>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                Intelligence Panel
              </h1>
              <p className="text-muted-foreground">
                Strumenti di analisi tattica
              </p>
            </div>
          </div>

          {/* Intelligence Overview */}
              <Card className="glass-card border-0 bg-card/50 backdrop-blur-md">
                <CardHeader className="text-center pb-4">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-cyan-400/20 to-cyan-400/10 mb-4 mx-auto">
                    <Brain className="h-10 w-10 text-cyan-400" />
                  </div>
                  <CardTitle className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                    M1SSION Intelligence
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-3 glass-card bg-background/20 border-0">
                      <p className="text-sm text-muted-foreground">Moduli</p>
                      <p className="font-semibold text-lg text-cyan-400">{intelligenceModules.length}</p>
                    </div>
                    <div className="text-center p-3 glass-card bg-background/20 border-0">
                      <p className="text-sm text-muted-foreground">Attivi</p>
                      <p className="font-semibold text-lg text-green-400">
                        {intelligenceModules.filter(m => m.status === 'Disponibile').length}
                      </p>
                    </div>
                    <div className="text-center p-3 glass-card bg-background/20 border-0">
                      <p className="text-sm text-muted-foreground">Livello</p>
                      <p className="font-semibold text-lg text-blue-400">Max 5</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Intelligence Modules */}
              <Card className="glass-card border-0 bg-card/50 backdrop-blur-md">
                <CardHeader>
                  <CardTitle className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent flex items-center gap-2">
                    <Shield className="h-5 w-5 text-blue-400" />
                    Moduli Intelligence
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {intelligenceModules.map((module) => (
                     <div 
                      key={module.id} 
                      className="glass-card p-4 bg-background/20 border-0 cursor-pointer hover:bg-background/30 transition-all duration-200"
                      onClick={() => openModule(module.id, module.status)}
                      onKeyDown={(e) => {
                        if ((e.key === 'Enter' || e.key === ' ') && module.status === 'Disponibile') {
                          e.preventDefault();
                          openModule(module.id);
                        }
                      }}
                      tabIndex={module.status === 'Disponibile' ? 0 : -1}
                      role="button"
                      aria-label={`Accedi a ${module.name}`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="p-2 rounded-lg bg-primary/20 flex-shrink-0">
                          <module.icon className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold text-foreground">{module.name}</h3>
                            <Badge className={getStatusColor(module.status)}>
                              {module.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground/80 mb-2">{module.description}</p>
                          <div className="flex items-center justify-between">
                            <span className={`text-xs font-medium ${getLevelColor(module.level)}`}>
                              {module.level}
                            </span>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="h-7 text-xs"
                              disabled={module.status !== 'Disponibile'}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (module.status === 'Disponibile') openModule(module.id);
                              }}
                              onKeyDown={(e) => {
                                if ((e.key === 'Enter' || e.key === ' ') && module.status === 'Disponibile') {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  openModule(module.id);
                                }
                              }}
                              tabIndex={module.status === 'Disponibile' ? 0 : -1}
                              role="button"
                              aria-label={`Apri ${module.name}`}
                            >
                              {module.status === 'Disponibile' ? 'Accedi' : 'Bloccato'}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Intelligence Stats */}
              <Card className="glass-card border-0 bg-card/50 backdrop-blur-md">
                <CardHeader>
                  <CardTitle className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent flex items-center gap-2">
                    <Activity className="h-5 w-5 text-purple-400" />
                    Statistiche Intelligence
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="glass-card p-4 bg-background/20 border-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Eye className="h-4 w-4 text-blue-400" />
                        <span className="text-sm font-medium">Analisi Completate</span>
                      </div>
                      <span className="text-sm text-blue-400 font-medium">47</span>
                    </div>
                  </div>
                  
                  <div className="glass-card p-4 bg-background/20 border-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Database className="h-4 w-4 text-green-400" />
                        <span className="text-sm font-medium">Indizi Raccolti</span>
                      </div>
                      <span className="text-sm text-green-400 font-medium">124</span>
                    </div>
                  </div>
                  
                  <div className="glass-card p-4 bg-background/20 border-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-yellow-400" />
                        <span className="text-sm font-medium">Precisione Media</span>
                      </div>
                      <span className="text-sm text-yellow-400 font-medium">87.3%</span>
                    </div>
                  </div>
                  
                  <div className="glass-card p-4 bg-background/20 border-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Radar className="h-4 w-4 text-cyan-400" />
                        <span className="text-sm font-medium">Scansioni Radar</span>
                      </div>
                      <span className="text-sm text-cyan-400 font-medium">31</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="glass-card border-0 bg-card/50 backdrop-blur-md">
                <CardHeader>
                  <CardTitle className="text-xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-orange-400" />
                    Azioni Rapide
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full justify-between bg-background/50 border-primary/30 hover:bg-primary/10"
                    onClick={() => openModule('coordinates')}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        openModule('coordinates');
                      }
                    }}
                    tabIndex={0}
                    role="button"
                    aria-label="Apri Intelligence Panel"
                  >
                    <div className="flex items-center space-x-2">
                      <Brain className="h-4 w-4 text-primary" />
                      <span>Apri Intelligence Panel</span>
                    </div>
                    →
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="w-full justify-between bg-background/50 border-primary/30 hover:bg-primary/10"
                    onClick={() => openModule('finalshotmap')}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        openModule('finalshotmap');
                      }
                    }}
                    tabIndex={0}
                    role="button"
                    aria-label="Apri Final Shot Mappa"
                  >
                    <div className="flex items-center space-x-2">
                      <Crosshair className="h-4 w-4 text-red-400" />
                      <span>Final Shot Mappa</span>
                    </div>
                    →
                  </Button>
                </CardContent>
              </Card>
        </div>
      </main>
    </div>
  );
};

export default IntelligenceStyledPage;

/*
 * 🔐 FIRMATO: BY JOSEPH MULÈ — CEO di NIYVORA KFT™
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */