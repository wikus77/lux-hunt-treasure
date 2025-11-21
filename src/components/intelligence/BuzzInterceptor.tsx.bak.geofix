// © 2025 Joseph MULÉ – M1SSION™ - ALL RIGHTS RESERVED - NIYVORA KFT

import React, { useState, useEffect } from 'react';
import { Zap, Radio, Activity, AlertTriangle, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface BuzzSignal {
  id: string;
  frequency: number;
  strength: number;
  location: { lat: number; lng: number };
  timestamp: Date;
  decoded: boolean;
  message?: string;
}

const BuzzInterceptor: React.FC = () => {
  const [isIntercepting, setIsIntercepting] = useState(false);
  const [signals, setSignals] = useState<BuzzSignal[]>([]);
  const [interceptProgress, setInterceptProgress] = useState(0);
  const [frequencyRange, setFrequencyRange] = useState({ min: 2400, max: 2500 });

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isIntercepting) {
      interval = setInterval(() => {
        // Simula l'intercettazione di segnali BUZZ casuali
        if (Math.random() < 0.3) {
          generateRandomSignal();
        }
        
        setInterceptProgress(prev => {
          if (prev >= 100) {
            return 0; // Reset per continuare l'intercettazione
          }
          return prev + 10;
        });
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isIntercepting]);

  const generateRandomSignal = () => {
    const signal: BuzzSignal = {
      id: crypto.randomUUID(),
      frequency: Math.random() * (frequencyRange.max - frequencyRange.min) + frequencyRange.min,
      strength: Math.random() * 100,
      location: {
        lat: 46.0 + (Math.random() - 0.5) * 0.1,
        lng: 8.0 + (Math.random() - 0.5) * 0.1
      },
      timestamp: new Date(),
      decoded: Math.random() < 0.4, // 40% chance di decodifica
      message: Math.random() < 0.4 ? getRandomMessage() : undefined
    };

    setSignals(prev => [signal, ...prev.slice(0, 9)]); // Mantieni solo gli ultimi 10
    
    if (signal.decoded && signal.message) {
      toast.success('Segnale BUZZ decodificato!');
    }
  };

  const getRandomMessage = () => {
    const messages = [
      "COORDINATE: 46.0000, 8.0000",
      "SETTORE ALPHA: ANOMALIA RILEVATA",
      "PROTOCOLLO M1SSION: FASE 3 ATTIVA",
      "SEGNALE DEBOLE - RIPETERE SCANSIONE",
      "ZONA CRITICA: ACCESSO LIMITATO",
      "FREQUENZA MODULATA - DECRITTAZIONE RICHIESTA"
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  };

  const handleToggleInterception = () => {
    setIsIntercepting(!isIntercepting);
    if (!isIntercepting) {
      toast.success('Intercettazione BUZZ avviata');
    } else {
      toast.info('Intercettazione BUZZ arrestata');
      setInterceptProgress(0);
    }
  };

  const getStrengthColor = (strength: number) => {
    if (strength > 70) return 'text-red-500';
    if (strength > 40) return 'text-yellow-500';
    return 'text-green-500';
  };

  const getFrequencyBand = (frequency: number) => {
    if (frequency < 2420) return 'LOW';
    if (frequency < 2460) return 'MID';
    return 'HIGH';
  };

  return (
    <div className="h-full overflow-y-auto pb-20 space-y-8" style={{
      height: 'calc(100dvh - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px) - 80px)',
      paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 80px)'
    }}>
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-4 mb-4">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-primary flex items-center justify-center shadow-xl shadow-cyan-500/20">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-foreground">BUZZ Interceptor</h3>
        </div>
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <AlertTriangle className="w-4 h-4" />
          <span>Disponibile dalla Settimana 4</span>
        </div>
      </div>

      {/* Control Panel */}
      <Card className="border-2 border-cyan-500/20 rounded-2xl bg-card/60 backdrop-blur-md shadow-2xl shadow-cyan-500/10">
        <CardHeader className="border-b-0">
          <CardTitle className="text-xl text-center bg-gradient-to-r from-cyan-400 to-primary bg-clip-text text-transparent flex items-center justify-between">
            <span>Pannello di Controllo</span>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${isIntercepting ? 'bg-red-500 animate-pulse' : 'bg-gray-500'}`} />
              <span className="text-sm">{isIntercepting ? 'ATTIVO' : 'STANDBY'}</span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Frequenza Min (MHz)</label>
              <input
                type="number"
                value={frequencyRange.min}
                onChange={(e) => setFrequencyRange({...frequencyRange, min: parseInt(e.target.value)})}
                className="w-full h-12 px-4 rounded-xl bg-muted/60 border-2 border-border/50 text-foreground backdrop-blur-md focus:ring-2 focus:ring-cyan-400/40 focus:border-cyan-400 transition-all duration-300"
                disabled={isIntercepting}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Frequenza Max (MHz)</label>
              <input
                type="number"
                value={frequencyRange.max}
                onChange={(e) => setFrequencyRange({...frequencyRange, max: parseInt(e.target.value)})}
                className="w-full h-12 px-4 rounded-xl bg-muted/60 border-2 border-border/50 text-foreground backdrop-blur-md focus:ring-2 focus:ring-cyan-400/40 focus:border-cyan-400 transition-all duration-300"
                disabled={isIntercepting}
              />
            </div>
          </div>

          {isIntercepting && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Scansione frequenze...</span>
                <span>{interceptProgress}%</span>
              </div>
              <Progress value={interceptProgress} className="h-2" />
            </div>
          )}

          <Button 
            onClick={handleToggleInterception}
            variant={isIntercepting ? "destructive" : "default"}
            className={`w-full rounded-xl py-4 shadow-2xl hover:shadow-2xl transition-all duration-300 ${
              !isIntercepting ? 'bg-gradient-to-r from-cyan-500 via-primary to-primary/80 hover:from-cyan-400 hover:to-primary/90 shadow-cyan-500/30 hover:shadow-cyan-500/50' : ''
            }`}
          >
            <Radio className="w-4 h-4 mr-2" />
            {isIntercepting ? 'Arresta Intercettazione' : 'Avvia Intercettazione'}
          </Button>
        </CardContent>
      </Card>

      {/* Signal Feed */}
      <Card className="border-2 border-cyan-500/20 rounded-2xl bg-card/60 backdrop-blur-md shadow-2xl shadow-cyan-500/10">
        <CardHeader className="border-b-0">
          <CardTitle className="text-xl text-center bg-gradient-to-r from-cyan-400 to-primary bg-clip-text text-transparent flex items-center justify-between">
            <span>Feed Segnali BUZZ</span>
            <Badge variant="secondary">{signals.length} segnali</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {signals.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
                {isIntercepting ? 'In attesa di segnali...' : 'Avvia intercettazione per rilevare segnali BUZZ'}
              </div>
            ) : (
              signals.map((signal) => (
                <div key={signal.id} className="p-4 bg-muted/60 rounded-2xl border-2 border-border/50 backdrop-blur-md hover:border-cyan-400/30 transition-all duration-300">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${signal.decoded ? 'bg-green-500' : 'bg-yellow-500'}`} />
                      <div>
                        <div className="font-medium text-sm">
                          {signal.frequency.toFixed(2)} MHz
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {signal.timestamp.toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className="text-xs">
                        {getFrequencyBand(signal.frequency)}
                      </Badge>
                      <div className={`text-sm font-bold ${getStrengthColor(signal.strength)}`}>
                        {signal.strength.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-xs text-muted-foreground mb-2 font-mono">
                    📍 {signal.location.lat.toFixed(6)}, {signal.location.lng.toFixed(6)}
                  </div>
                  
                  {signal.decoded && signal.message && (
                    <div className="mt-3 p-2 bg-primary/10 rounded border border-primary/20">
                      <div className="flex items-center gap-2 mb-1">
                        <Eye className="w-3 h-3 text-primary" />
                        <span className="text-xs font-medium text-primary">DECODIFICATO</span>
                      </div>
                      <div className="text-sm font-mono text-foreground">
                        {signal.message}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BuzzInterceptor;