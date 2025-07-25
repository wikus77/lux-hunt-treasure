// Mini-gioco Memory Hack - Memorizza sequenze di codici
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Play, RotateCcw, Star, Clock, Target } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCapacitorHardware } from '@/hooks/useCapacitorHardware';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import SafeAreaWrapper from '@/components/ui/SafeAreaWrapper';

interface GameState {
  sequence: number[];
  playerSequence: number[];
  currentLevel: number;
  score: number;
  gamePhase: 'waiting' | 'showing' | 'input' | 'correct' | 'wrong' | 'complete';
  timeRemaining: number;
  showingIndex: number;
}

interface GameStats {
  totalGames: number;
  bestScore: number;
  averageScore: number;
  totalTime: number;
}

const MemoryHackGame: React.FC = () => {
  const navigate = useNavigate();
  const { vibrate, playSound } = useCapacitorHardware();
  const { toast } = useToast();
  
  const [gameState, setGameState] = useState<GameState>({
    sequence: [],
    playerSequence: [],
    currentLevel: 1,
    score: 0,
    gamePhase: 'waiting',
    timeRemaining: 30,
    showingIndex: -1
  });

  const [gameStats, setGameStats] = useState<GameStats>({
    totalGames: 0,
    bestScore: 0,
    averageScore: 0,
    totalTime: 0
  });

  const [isGameActive, setIsGameActive] = useState(false);
  const [startTime, setStartTime] = useState<number>(0);

  // Colori per i tasti
  const colors = [
    'hsl(0, 100%, 50%)',    // Rosso
    'hsl(120, 100%, 40%)',  // Verde
    'hsl(240, 100%, 50%)',  // Blu
    'hsl(60, 100%, 50%)',   // Giallo
    'hsl(300, 100%, 50%)',  // Magenta
    'hsl(180, 100%, 40%)',  // Ciano
    'hsl(30, 100%, 50%)',   // Arancione
    'hsl(270, 100%, 50%)'   // Viola
  ];

  // Carica statistiche
  useEffect(() => {
    const savedStats = localStorage.getItem('memory_hack_stats');
    if (savedStats) {
      setGameStats(JSON.parse(savedStats));
    }
  }, []);

  // Timer di gioco
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isGameActive && gameState.gamePhase === 'input' && gameState.timeRemaining > 0) {
      interval = setInterval(() => {
        setGameState(prev => {
          if (prev.timeRemaining <= 1) {
            handleGameOver();
            return { ...prev, timeRemaining: 0, gamePhase: 'wrong' };
          }
          return { ...prev, timeRemaining: prev.timeRemaining - 1 };
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isGameActive, gameState.gamePhase, gameState.timeRemaining]);

  // Genera nuova sequenza
  const generateSequence = useCallback((level: number): number[] => {
    const sequenceLength = Math.min(3 + level, 12); // Max 12 elementi
    let sequence: number[] = [];
    for (let i = 0; i < sequenceLength; i++) {
      const randomNumber = Math.floor(Math.random() * 8); // 8 colori disponibili
      sequence = [...sequence, randomNumber];
    }
    return sequence;
  }, []);

  // Inizia nuovo gioco
  const startNewGame = () => {
    const newSequence = generateSequence(1);
    setGameState({
      sequence: newSequence,
      playerSequence: [],
      currentLevel: 1,
      score: 0,
      gamePhase: 'showing',
      timeRemaining: 30,
      showingIndex: 0
    });
    setIsGameActive(true);
    setStartTime(Date.now());
    vibrate(100);
    playSound('start');
    
    // Mostra sequenza
    showSequence(newSequence);
  };

  // Mostra sequenza ai giocatori
  const showSequence = async (sequence: number[]) => {
    for (let i = 0; i < sequence.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 800));
      setGameState(prev => ({ ...prev, showingIndex: i }));
      playSound('beep');
      vibrate(50);
      
      await new Promise(resolve => setTimeout(resolve, 600));
      setGameState(prev => ({ ...prev, showingIndex: -1 }));
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    // Inizia fase input
    setGameState(prev => ({ 
      ...prev, 
      gamePhase: 'input',
      timeRemaining: Math.max(20, 40 - prev.currentLevel * 2) // Tempo diminuisce con il livello
    }));
  };

  // Gestione input giocatore
  const handleColorPress = (colorIndex: number) => {
    if (gameState.gamePhase !== 'input') return;

    const newPlayerSequence = [...gameState.playerSequence, colorIndex];
    const isCorrect = newPlayerSequence[newPlayerSequence.length - 1] === 
                     gameState.sequence[newPlayerSequence.length - 1];

    if (!isCorrect) {
      // Errore
      setGameState(prev => ({ ...prev, gamePhase: 'wrong' }));
      handleGameOver();
      playSound('error');
      vibrate(300);
      return;
    }

    // Input corretto
    setGameState(prev => ({ ...prev, playerSequence: newPlayerSequence }));
    playSound('success');
    vibrate(50);

    // Verifica se sequenza completata
    if (newPlayerSequence.length === gameState.sequence.length) {
      handleLevelComplete(newPlayerSequence.length);
    }
  };

  // Livello completato
  const handleLevelComplete = (sequenceLength: number) => {
    const levelScore = sequenceLength * 100 + gameState.timeRemaining * 10;
    const newScore = gameState.score + levelScore;
    const newLevel = gameState.currentLevel + 1;

    setGameState(prev => ({ 
      ...prev, 
      score: newScore,
      currentLevel: newLevel,
      gamePhase: 'correct'
    }));

    playSound('level_complete');
    vibrate(200);

    toast({
      title: 'Livello Completato!',
      description: `+${levelScore} punti. Livello ${newLevel}`
    });

    // Prossimo livello dopo 2 secondi
    setTimeout(() => {
      if (newLevel <= 10) { // Max 10 livelli
        const newSequence = generateSequence(newLevel);
        setGameState(prev => ({
          ...prev,
          sequence: newSequence,
          playerSequence: [],
          gamePhase: 'showing',
          showingIndex: 0
        }));
        showSequence(newSequence);
      } else {
        // Gioco completato
        setGameState(prev => ({ ...prev, gamePhase: 'complete' }));
        handleGameComplete();
      }
    }, 2000);
  };

  // Gioco completato
  const handleGameComplete = () => {
    setIsGameActive(false);
    const finalTime = Math.floor((Date.now() - startTime) / 1000);
    
    playSound('victory');
    vibrate(500);

    toast({
      title: 'Gioco Completato!',
      description: `Hai completato tutti i livelli! Score: ${gameState.score}`
    });

    updateStats(gameState.score, finalTime, true);
  };

  // Game over
  const handleGameOver = () => {
    setIsGameActive(false);
    const finalTime = Math.floor((Date.now() - startTime) / 1000);
    
    toast({
      title: 'Game Over',
      description: `Livello raggiunto: ${gameState.currentLevel}`
    });

    updateStats(gameState.score, finalTime, false);
  };

  // Aggiorna statistiche
  const updateStats = (score: number, time: number, completed: boolean) => {
    const newStats: GameStats = {
      totalGames: gameStats.totalGames + 1,
      bestScore: Math.max(gameStats.bestScore, score),
      averageScore: Math.floor((gameStats.averageScore * gameStats.totalGames + score) / (gameStats.totalGames + 1)),
      totalTime: gameStats.totalTime + time
    };

    setGameStats(newStats);
    localStorage.setItem('memory_hack_stats', JSON.stringify(newStats));
  };

  // Reset gioco
  const resetGame = () => {
    setGameState({
      sequence: [],
      playerSequence: [],
      currentLevel: 1,
      score: 0,
      gamePhase: 'waiting',
      timeRemaining: 30,
      showingIndex: -1
    });
    setIsGameActive(false);
  };

  const getButtonStyle = (index: number) => {
    const isShowing = gameState.showingIndex === index;
    const isInSequence = gameState.sequence[gameState.showingIndex] === index && gameState.gamePhase === 'showing';
    
    return {
      backgroundColor: colors[index],
      opacity: (isShowing || isInSequence) ? 1 : 0.6,
      transform: (isShowing || isInSequence) ? 'scale(1.1)' : 'scale(1)',
      boxShadow: (isShowing || isInSequence) ? `0 0 20px ${colors[index]}` : 'none'
    };
  };

  return (
    <SafeAreaWrapper className="min-h-screen bg-background">
      <div className="p-4 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="glass-card"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-orbitron font-bold">Memory Hack</h1>
          <div className="w-10" />
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="glass-card p-3">
            <div className="text-center">
              <div className="text-lg font-bold text-primary">{gameState.score}</div>
              <div className="text-xs text-muted-foreground">Score</div>
            </div>
          </Card>
          <Card className="glass-card p-3">
            <div className="text-center">
              <div className="text-lg font-bold text-secondary">{gameState.currentLevel}</div>
              <div className="text-xs text-muted-foreground">Livello</div>
            </div>
          </Card>
          <Card className="glass-card p-3">
            <div className="text-center">
              <div className="text-lg font-bold text-accent">{gameState.timeRemaining}s</div>
              <div className="text-xs text-muted-foreground">Tempo</div>
            </div>
          </Card>
        </div>

        {/* Progress Timer */}
        {gameState.gamePhase === 'input' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Tempo rimasto</span>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </div>
            <Progress 
              value={(gameState.timeRemaining / (40 - gameState.currentLevel * 2)) * 100}
              className="h-2"
            />
          </motion.div>
        )}

        {/* Game Status */}
        <Card className="glass-card neon-border">
          <CardContent className="p-4 text-center">
            <AnimatePresence mode="wait">
              {gameState.gamePhase === 'waiting' && (
                <motion.div
                  key="waiting"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-3"
                >
                  <Target className="h-12 w-12 mx-auto text-primary" />
                  <h2 className="text-xl font-orbitron font-bold">Memory Hack</h2>
                  <p className="text-muted-foreground">
                    Memorizza la sequenza di colori e riproducila correttamente
                  </p>
                  <Button onClick={startNewGame} className="neon-border">
                    <Play className="h-4 w-4 mr-2" />
                    Inizia Missione
                  </Button>
                </motion.div>
              )}

              {gameState.gamePhase === 'showing' && (
                <motion.div
                  key="showing"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-2"
                >
                  <div className="text-lg font-orbitron">Memorizza la sequenza</div>
                  <div className="text-sm text-muted-foreground">
                    Sequenza {gameState.showingIndex + 1} di {gameState.sequence.length}
                  </div>
                </motion.div>
              )}

              {gameState.gamePhase === 'input' && (
                <motion.div
                  key="input"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-2"
                >
                  <div className="text-lg font-orbitron text-primary">Riproduci la sequenza</div>
                  <div className="text-sm text-muted-foreground">
                    {gameState.playerSequence.length} di {gameState.sequence.length}
                  </div>
                </motion.div>
              )}

              {gameState.gamePhase === 'correct' && (
                <motion.div
                  key="correct"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="space-y-2"
                >
                  <Star className="h-12 w-12 mx-auto text-green-500" />
                  <div className="text-lg font-orbitron text-green-500">Sequenza Corretta!</div>
                  <div className="text-sm text-muted-foreground">Prossimo livello...</div>
                </motion.div>
              )}

              {gameState.gamePhase === 'wrong' && (
                <motion.div
                  key="wrong"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="space-y-3"
                >
                  <div className="h-12 w-12 mx-auto bg-destructive rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">X</span>
                  </div>
                  <div className="text-lg font-orbitron text-destructive">Sequenza Errata</div>
                  <div className="text-sm text-muted-foreground">Score finale: {gameState.score}</div>
                  <Button onClick={resetGame} variant="outline">
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Riprova
                  </Button>
                </motion.div>
              )}

              {gameState.gamePhase === 'complete' && (
                <motion.div
                  key="complete"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0 }}
                  className="space-y-3"
                >
                  <Star className="h-16 w-16 mx-auto text-yellow-500" />
                  <div className="text-xl font-orbitron text-yellow-500">Missione Completata!</div>
                  <div className="text-lg">Score: {gameState.score}</div>
                  <Badge variant="outline" className="text-green-500 border-green-500">
                    Tutti i livelli superati
                  </Badge>
                  <Button onClick={resetGame} className="neon-border">
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Nuova Missione
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>

        {/* Color Grid */}
        {(gameState.gamePhase === 'showing' || gameState.gamePhase === 'input') && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="grid grid-cols-4 gap-3"
          >
            {colors.map((color, index) => (
              <motion.button
                key={index}
                style={getButtonStyle(index)}
                onClick={() => handleColorPress(index)}
                disabled={gameState.gamePhase !== 'input'}
                className="aspect-square rounded-lg transition-all duration-200 disabled:cursor-not-allowed"
                whileTap={{ scale: 0.95 }}
              />
            ))}
          </motion.div>
        )}

        {/* Statistics */}
        <Card className="glass-card">
          <CardContent className="p-4">
            <h3 className="font-orbitron font-bold mb-3">Statistiche</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <div className="text-muted-foreground">Partite giocate</div>
                <div className="font-bold">{gameStats.totalGames}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Miglior score</div>
                <div className="font-bold text-primary">{gameStats.bestScore}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Score medio</div>
                <div className="font-bold">{gameStats.averageScore}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Tempo totale</div>
                <div className="font-bold">{Math.floor(gameStats.totalTime / 60)}m</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </SafeAreaWrapper>
  );
};

export default MemoryHackGame;