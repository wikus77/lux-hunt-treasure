
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Satellite, RotateCcw, Target } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface SatelliteData {
  id: number;
  x: number;
  y: number;
  speed: number;
  direction: number;
  isTarget: boolean;
  isTracked: boolean;
}

const SatelliteTrackingGame: React.FC = () => {
  const [satellites, setSatellites] = useState<SatelliteData[]>([]);
  const [targetSatellite, setTargetSatellite] = useState<SatelliteData | null>(null);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isGameComplete, setIsGameComplete] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [score, setScore] = useState(0);
  const [isTracking, setIsTracking] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (gameStarted && !isGameComplete) {
      interval = setInterval(() => {
        // Move satellites
        setSatellites(prev => prev.map(sat => ({
          ...sat,
          x: (sat.x + Math.cos(sat.direction) * sat.speed + 400) % 400,
          y: (sat.y + Math.sin(sat.direction) * sat.speed + 300) % 300
        })));
        
        // Countdown timer
        setTimeLeft(prev => {
          if (prev <= 1) {
            finishGame();
            return 0;
          }
          return prev - 1;
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [gameStarted, isGameComplete]);

  const generateSatellites = () => {
    const newSatellites: SatelliteData[] = [];
    for (let i = 0; i < 6; i++) {
      newSatellites.push({
        id: i,
        x: Math.random() * 350 + 25,
        y: Math.random() * 250 + 25,
        speed: Math.random() * 2 + 1,
        direction: Math.random() * Math.PI * 2,
        isTarget: false,
        isTracked: false
      });
    }
    
    // Set one as target
    const targetIndex = Math.floor(Math.random() * newSatellites.length);
    newSatellites[targetIndex].isTarget = true;
    
    return { newSatellites, target: newSatellites[targetIndex] };
  };

  const startGame = () => {
    const { newSatellites, target } = generateSatellites();
    setSatellites(newSatellites);
    setTargetSatellite(target);
    setTimeLeft(30);
    setIsGameComplete(false);
    setGameStarted(true);
    setScore(0);
    setIsTracking(false);
  };

  const trackSatellite = async (satelliteId: number) => {
    if (isTracking || isGameComplete) return;
    
    setIsTracking(true);
    const satellite = satellites.find(s => s.id === satelliteId);
    
    if (satellite?.isTarget) {
      setScore(prev => prev + 100);
      setSatellites(prev => prev.map(s => 
        s.id === satelliteId ? { ...s, isTracked: true } : s
      ));
      
      // Generate new target
      setTimeout(() => {
        const { newSatellites, target } = generateSatellites();
        setSatellites(newSatellites);
        setTargetSatellite(target);
        setIsTracking(false);
      }, 1000);
      
      toast.success('🎯 Satellite target tracciato!');
    } else {
      setScore(prev => Math.max(0, prev - 20));
      toast.error('❌ Satellite sbagliato!');
      
      setTimeout(() => {
        setIsTracking(false);
      }, 500);
    }
  };

  const finishGame = async () => {
    setIsGameComplete(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Save progress using type assertion
        await (supabase as any)
          .from('user_minigames_progress')
          .upsert({
            user_id: user.id,
            game_key: 'satellite_tracking',
            score: score,
            completed: true,
            last_played: new Date().toISOString()
          }, {
            onConflict: 'user_id,game_key'
          });

        // Award bonus
        await (supabase as any)
          .from('user_buzz_bonuses')
          .insert({
            user_id: user.id,
            bonus_type: 'satellite_tracking_completion',
            game_reference: 'satellite_tracking',
            used: false
          });
      }
    } catch (error) {
      console.error('Error saving game progress:', error);
    }
    
    toast.success(`🛰️ Missione completata! Punteggio finale: ${score}`);
  };

  const resetGame = () => {
    setSatellites([]);
    setTargetSatellite(null);
    setTimeLeft(30);
    setIsGameComplete(false);
    setGameStarted(false);
    setScore(0);
    setIsTracking(false);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <Satellite className="h-6 w-6 text-blue-500" />
          Satellite Tracking
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {!gameStarted ? (
          <div className="text-center space-y-4">
            <p>Traccia i satelliti target in movimento nel tempo limite!</p>
            <Button onClick={startGame} className="w-full">
              Inizia Tracking
            </Button>
          </div>
        ) : (
          <>
            <div className="flex justify-between text-sm">
              <Badge variant="outline">Tempo: {timeLeft}s</Badge>
              <Badge variant="outline">Punteggio: {score}</Badge>
            </div>

            {targetSatellite && (
              <div className="bg-blue-50 p-3 rounded">
                <p className="text-sm font-semibold">
                  🎯 Target: Satellite #{targetSatellite.id + 1}
                  <span className="text-red-500 ml-2">● Rosso</span>
                </p>
              </div>
            )}

            <div className="relative bg-black w-full h-64 rounded border-2 border-gray-300 overflow-hidden">
              {satellites.map((satellite) => (
                <div
                  key={satellite.id}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
                  style={{ 
                    left: satellite.x, 
                    top: satellite.y,
                    transition: 'all 0.1s linear'
                  }}
                  onClick={() => trackSatellite(satellite.id)}
                >
                  <div className={`w-3 h-3 rounded-full ${
                    satellite.isTarget 
                      ? 'bg-red-500 animate-pulse' 
                      : satellite.isTracked
                      ? 'bg-green-500'
                      : 'bg-white'
                  } border border-gray-400`} />
                </div>
              ))}
              
              {/* Grid overlay */}
              <div className="absolute inset-0 pointer-events-none">
                {Array.from({length: 8}).map((_, i) => (
                  <div key={i} className="absolute w-full h-px bg-green-500 opacity-20" 
                       style={{top: `${(i + 1) * 12.5}%`}} />
                ))}
                {Array.from({length: 10}).map((_, i) => (
                  <div key={i} className="absolute h-full w-px bg-green-500 opacity-20" 
                       style={{left: `${(i + 1) * 10}%`}} />
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={resetGame} variant="outline" className="flex-1">
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
            </div>

            {isGameComplete && (
              <div className="text-center text-blue-600 font-semibold">
                <Target className="h-6 w-6 mx-auto mb-2" />
                🎉 Missione di tracking completata!
                <p className="text-sm mt-1">Punteggio finale: {score}</p>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default SatelliteTrackingGame;
