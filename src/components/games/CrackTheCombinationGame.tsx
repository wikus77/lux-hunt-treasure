
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lock, Unlock, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface CombinationLock {
  position: number;
  value: number;
  targetValue: number;
}

const CrackTheCombinationGame: React.FC = () => {
  const [locks, setLocks] = useState<CombinationLock[]>([]);
  const [attempts, setAttempts] = useState(0);
  const [isGameComplete, setIsGameComplete] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [hints, setHints] = useState<string[]>([]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning && !isGameComplete) {
      interval = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, isGameComplete]);

  const generateCombination = () => {
    const newLocks: CombinationLock[] = [];
    for (let i = 0; i < 4; i++) {
      newLocks.push({
        position: i,
        value: 0,
        targetValue: Math.floor(Math.random() * 10)
      });
    }
    return newLocks;
  };

  const startGame = () => {
    const newLocks = generateCombination();
    setLocks(newLocks);
    setAttempts(0);
    setIsGameComplete(false);
    setGameStarted(true);
    setTimeElapsed(0);
    setIsTimerRunning(true);
    setHints([]);
    
    // Generate initial hints
    const initialHints = [
      `Prima cifra: ${newLocks[0].targetValue % 2 === 0 ? 'pari' : 'dispari'}`,
      `Somma totale: ${newLocks.reduce((sum, lock) => sum + lock.targetValue, 0)}`,
    ];
    setHints(initialHints);
  };

  const adjustLock = (position: number, direction: 'up' | 'down') => {
    if (isGameComplete) return;

    setLocks(prev => prev.map(lock => {
      if (lock.position === position) {
        let newValue = lock.value;
        if (direction === 'up') {
          newValue = (newValue + 1) % 10;
        } else {
          newValue = newValue === 0 ? 9 : newValue - 1;
        }
        return { ...lock, value: newValue };
      }
      return lock;
    }));
  };

  const checkCombination = async () => {
    if (!gameStarted) return;

    const isCorrect = locks.every(lock => lock.value === lock.targetValue);
    setAttempts(prev => prev + 1);

    if (isCorrect) {
      setIsGameComplete(true);
      setIsTimerRunning(false);
      
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const score = Math.max(1000 - (attempts * 50) - timeElapsed, 100);
          
          // Save progress using type assertion
          await (supabase as any)
            .from('user_minigames_progress')
            .upsert({
              user_id: user.id,
              game_key: 'crack_combination',
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
              bonus_type: 'crack_combination_completion',
              game_reference: 'crack_combination',
              used: false
            });
        }
      } catch (error) {
        console.error('Error saving game progress:', error);
      }
      
      toast.success(`Combinazione craccata! Punteggio: ${1000 - (attempts * 50) - timeElapsed}`);
    } else {
      // Provide feedback
      const correctPositions = locks.filter(lock => lock.value === lock.targetValue).length;
      toast.info(`${correctPositions} cifre corrette nella posizione giusta`);
      
      // Add more hints after failed attempts
      if (attempts >= 3 && hints.length < 3) {
        const maxDigit = Math.max(...locks.map(l => l.targetValue));
        setHints(prev => [...prev, `Cifra più alta: ${maxDigit}`]);
      }
    }
  };

  const resetGame = () => {
    setLocks([]);
    setAttempts(0);
    setIsGameComplete(false);
    setGameStarted(false);
    setTimeElapsed(0);
    setIsTimerRunning(false);
    setHints([]);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          {isGameComplete ? <Unlock className="h-6 w-6 text-green-500" /> : <Lock className="h-6 w-6" />}
          Crack the Combination
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {!gameStarted ? (
          <div className="text-center space-y-4">
            <p>Trova la combinazione a 4 cifre usando gli indizi!</p>
            <Button onClick={startGame} className="w-full">
              Inizia Gioco
            </Button>
          </div>
        ) : (
          <>
            <div className="flex justify-between text-sm">
              <Badge variant="outline">Tentativi: {attempts}</Badge>
              <Badge variant="outline">Tempo: {formatTime(timeElapsed)}</Badge>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {locks.map((lock) => (
                <div key={lock.position} className="text-center space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => adjustLock(lock.position, 'up')}
                  >
                    ↑
                  </Button>
                  <div className="w-12 h-12 border-2 border-gray-300 rounded flex items-center justify-center text-xl font-bold">
                    {lock.value}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => adjustLock(lock.position, 'down')}
                  >
                    ↓
                  </Button>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold">Indizi:</h4>
              {hints.map((hint, index) => (
                <p key={index} className="text-sm text-gray-600">{hint}</p>
              ))}
            </div>

            <div className="flex gap-2">
              <Button onClick={checkCombination} className="flex-1" disabled={isGameComplete}>
                Verifica
              </Button>
              <Button onClick={resetGame} variant="outline" size="icon">
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>

            {isGameComplete && (
              <div className="text-center text-green-600 font-semibold">
                🎉 Combinazione craccata con successo!
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default CrackTheCombinationGame;
