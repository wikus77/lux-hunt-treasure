
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, RotateCcw, Target } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface MapPoint {
  id: number;
  x: number;
  y: number;
  isTarget: boolean;
  isSelected: boolean;
  label: string;
}

const FindMapPointGame: React.FC = () => {
  const [points, setPoints] = useState<MapPoint[]>([]);
  const [targetPoint, setTargetPoint] = useState<MapPoint | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [isGameComplete, setIsGameComplete] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [clue, setClue] = useState('');

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning && !isGameComplete) {
      interval = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, isGameComplete]);

  const generateMap = () => {
    const newPoints: MapPoint[] = [];
    const locations = [
      'Roma', 'Milano', 'Napoli', 'Torino', 'Palermo',
      'Genova', 'Bologna', 'Firenze', 'Bari', 'Catania'
    ];

    for (let i = 0; i < 8; i++) {
      newPoints.push({
        id: i,
        x: Math.random() * 300 + 50, // Random position within map bounds
        y: Math.random() * 200 + 50,
        isTarget: false,
        isSelected: false,
        label: locations[i]
      });
    }

    // Set one point as target
    const targetIndex = Math.floor(Math.random() * newPoints.length);
    newPoints[targetIndex].isTarget = true;
    
    return { newPoints, target: newPoints[targetIndex] };
  };

  const generateClue = (target: MapPoint) => {
    const quadrantClues = [
      target.x < 175 && target.y < 125 ? 'nord-ovest' : '',
      target.x >= 175 && target.y < 125 ? 'nord-est' : '',
      target.x < 175 && target.y >= 125 ? 'sud-ovest' : '',
      target.x >= 175 && target.y >= 125 ? 'sud-est' : ''
    ].filter(Boolean)[0];

    const clues = [
      `La destinazione si trova nel quadrante ${quadrantClues}`,
      `Cerca una città che inizia con "${target.label[0]}"`,
      `La località target ha ${target.label.length} lettere`,
    ];

    return clues[Math.floor(Math.random() * clues.length)];
  };

  const startGame = () => {
    const { newPoints, target } = generateMap();
    setPoints(newPoints);
    setTargetPoint(target);
    setClue(generateClue(target));
    setAttempts(0);
    setIsGameComplete(false);
    setGameStarted(true);
    setTimeElapsed(0);
    setIsTimerRunning(true);
  };

  const selectPoint = async (pointId: number) => {
    if (isGameComplete) return;

    const selectedPoint = points.find(p => p.id === pointId);
    if (!selectedPoint) return;

    setAttempts(prev => prev + 1);

    if (selectedPoint.isTarget) {
      setIsGameComplete(true);
      setIsTimerRunning(false);
      
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const score = Math.max(1000 - (attempts * 100) - timeElapsed, 100);
          
          // Save progress using type assertion
          await (supabase as any)
            .from('user_minigames_progress')
            .upsert({
              user_id: user.id,
              game_key: 'find_map_point',
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
              bonus_type: 'find_map_point_completion',
              game_reference: 'find_map_point',
              used: false
            });
        }
      } catch (error) {
        console.error('Error saving game progress:', error);
      }
      
      toast.success(`🎯 Destinazione trovata! Punteggio: ${1000 - (attempts * 100) - timeElapsed}`);
    } else {
      const distance = Math.sqrt(
        Math.pow(selectedPoint.x - (targetPoint?.x || 0), 2) +
        Math.pow(selectedPoint.y - (targetPoint?.y || 0), 2)
      );
      
      const hint = distance < 100 ? 'Molto vicino!' : distance < 150 ? 'Vicino' : 'Lontano';
      toast.info(`${hint} - Distanza: ${Math.round(distance)}km`);
    }

    setPoints(prev => prev.map(p => 
      p.id === pointId ? { ...p, isSelected: true } : p
    ));
  };

  const resetGame = () => {
    setPoints([]);
    setTargetPoint(null);
    setAttempts(0);
    setIsGameComplete(false);
    setGameStarted(false);
    setTimeElapsed(0);
    setIsTimerRunning(false);
    setClue('');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <MapPin className="h-6 w-6 text-blue-500" />
          Find Map Point
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {!gameStarted ? (
          <div className="text-center space-y-4">
            <p>Trova la destinazione segreta sulla mappa usando gli indizi!</p>
            <Button onClick={startGame} className="w-full">
              Inizia Missione
            </Button>
          </div>
        ) : (
          <>
            <div className="flex justify-between text-sm">
              <Badge variant="outline">Tentativi: {attempts}</Badge>
              <Badge variant="outline">Tempo: {formatTime(timeElapsed)}</Badge>
            </div>

            <div className="bg-blue-50 p-3 rounded border">
              <h4 className="font-semibold mb-2">Indizio:</h4>
              <p className="text-sm">{clue}</p>
            </div>

            <div className="relative bg-green-100 w-full h-64 rounded border-2 border-green-300 overflow-hidden">
              {points.map((point) => (
                <div
                  key={point.id}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
                  style={{ left: point.x, top: point.y }}
                  onClick={() => selectPoint(point.id)}
                >
                  <div className="relative group">
                    <div className={`w-4 h-4 rounded-full border-2 ${
                      point.isSelected 
                        ? point.isTarget 
                          ? 'bg-green-500 border-green-700' 
                          : 'bg-red-500 border-red-700'
                        : 'bg-blue-500 border-blue-700 hover:bg-blue-600'
                    }`} />
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {point.label}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <Button onClick={resetGame} variant="outline" className="flex-1">
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
            </div>

            {isGameComplete && (
              <div className="text-center text-green-600 font-semibold">
                <Target className="h-6 w-6 mx-auto mb-2" />
                🎉 Destinazione trovata con successo!
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default FindMapPointGame;
