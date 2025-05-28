
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bomb, Scissors, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface Wire {
  id: number;
  color: string;
  isCut: boolean;
  isCorrect: boolean;
}

const DisarmTheBombGame: React.FC = () => {
  const [wires, setWires] = useState<Wire[]>([]);
  const [timeLeft, setTimeLeft] = useState(60); // 60 seconds
  const [isGameComplete, setIsGameComplete] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [isDefused, setIsDefused] = useState(false);
  const [instructions, setInstructions] = useState<string[]>([]);

  const wireColors = ['red', 'blue', 'yellow', 'green', 'black', 'white'];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (gameStarted && !isGameComplete && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setIsGameComplete(true);
            toast.error('💥 Tempo scaduto! La bomba è esplosa!');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameStarted, isGameComplete, timeLeft]);

  const generateBomb = () => {
    const shuffledColors = [...wireColors].sort(() => Math.random() - 0.5).slice(0, 5);
    const newWires: Wire[] = shuffledColors.map((color, index) => ({
      id: index,
      color,
      isCut: false,
      isCorrect: false
    }));

    // Generate cutting sequence and instructions
    const correctSequence = Math.floor(Math.random() * 3); // 0, 1, or 2
    const newInstructions: string[] = [];

    switch (correctSequence) {
      case 0:
        // Cut red wire first, then blue
        const redIndex = newWires.findIndex(w => w.color === 'red');
        const blueIndex = newWires.findIndex(w => w.color === 'blue');
        if (redIndex !== -1) newWires[redIndex].isCorrect = true;
        if (blueIndex !== -1) newWires[blueIndex].isCorrect = true;
        newInstructions.push('Taglia prima il filo rosso, poi quello blu');
        break;
      case 1:
        // Cut the last wire
        newWires[newWires.length - 1].isCorrect = true;
        newInstructions.push('Taglia l\'ultimo filo');
        break;
      case 2:
        // Cut all wires except black
        newWires.forEach(wire => {
          if (wire.color !== 'black') wire.isCorrect = true;
        });
        newInstructions.push('Taglia tutti i fili tranne quello nero');
        break;
    }

    return { newWires, newInstructions };
  };

  const startGame = () => {
    const { newWires, newInstructions } = generateBomb();
    setWires(newWires);
    setInstructions(newInstructions);
    setTimeLeft(60);
    setIsGameComplete(false);
    setGameStarted(true);
    setIsDefused(false);
  };

  const cutWire = async (wireId: number) => {
    if (isGameComplete) return;

    const updatedWires = wires.map(wire => 
      wire.id === wireId ? { ...wire, isCut: true } : wire
    );
    setWires(updatedWires);

    const cutWire = updatedWires.find(w => w.id === wireId);
    
    if (cutWire && !cutWire.isCorrect) {
      // Wrong wire cut - bomb explodes
      setIsGameComplete(true);
      toast.error('💥 Filo sbagliato! La bomba è esplosa!');
      return;
    }

    // Check if all correct wires are cut
    const allCorrectCut = updatedWires
      .filter(w => w.isCorrect)
      .every(w => w.isCut);

    if (allCorrectCut) {
      setIsGameComplete(true);
      setIsDefused(true);
      
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const score = Math.max(1000 + (timeLeft * 10), 100);
          
          // Save progress using type assertion
          await (supabase as any)
            .from('user_minigames_progress')
            .upsert({
              user_id: user.id,
              game_key: 'disarm_bomb',
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
              bonus_type: 'disarm_bomb_completion',
              game_reference: 'disarm_bomb',
              used: false
            });
        }
      } catch (error) {
        console.error('Error saving game progress:', error);
      }
      
      toast.success(`💚 Bomba disinnescata! Punteggio: ${1000 + (timeLeft * 10)}`);
    }
  };

  const resetGame = () => {
    setWires([]);
    setTimeLeft(60);
    setIsGameComplete(false);
    setGameStarted(false);
    setIsDefused(false);
    setInstructions([]);
  };

  const getWireColorClass = (color: string) => {
    const colorMap: Record<string, string> = {
      red: 'bg-red-500',
      blue: 'bg-blue-500',
      yellow: 'bg-yellow-500',
      green: 'bg-green-500',
      black: 'bg-black',
      white: 'bg-gray-200'
    };
    return colorMap[color] || 'bg-gray-400';
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <Bomb className="h-6 w-6 text-red-500" />
          Disarm the Bomb
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {!gameStarted ? (
          <div className="text-center space-y-4">
            <p>Disinnesca la bomba tagliando i fili nell'ordine corretto!</p>
            <Button onClick={startGame} className="w-full">
              Inizia Missione
            </Button>
          </div>
        ) : (
          <>
            <div className="text-center">
              <Badge 
                variant={timeLeft <= 10 ? "destructive" : "outline"}
                className="text-lg font-mono"
              >
                {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
              </Badge>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold">Istruzioni:</h4>
              {instructions.map((instruction, index) => (
                <p key={index} className="text-sm bg-yellow-100 p-2 rounded">
                  {instruction}
                </p>
              ))}
            </div>

            <div className="space-y-3">
              {wires.map((wire) => (
                <div key={wire.id} className="flex items-center gap-3">
                  <div 
                    className={`w-full h-4 rounded ${getWireColorClass(wire.color)} ${
                      wire.isCut ? 'opacity-30' : ''
                    }`}
                  />
                  <Button
                    onClick={() => cutWire(wire.id)}
                    disabled={wire.isCut || isGameComplete}
                    size="sm"
                    variant="outline"
                  >
                    <Scissors className="h-4 w-4" />
                  </Button>
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
              <div className={`text-center font-semibold ${
                isDefused ? 'text-green-600' : 'text-red-600'
              }`}>
                {isDefused ? '🎉 Bomba disinnescata!' : '💥 Game Over!'}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default DisarmTheBombGame;
