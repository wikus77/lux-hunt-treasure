
import React, { useState, useEffect, lazy, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { useGameLogic } from "./memory-hack/useGameLogic";
import GameErrorBoundary from "./GameErrorBoundary";

// Lazy load game components con fallback migliorati
const GameStats = lazy(() => import("./memory-hack/GameStats"));
const GameControls = lazy(() => import("./memory-hack/GameControls"));
const GameCard = lazy(() => import("./memory-hack/GameCard"));

const GameLoadingFallback = () => (
  <div className="flex items-center justify-center p-8">
    <div className="flex flex-col items-center gap-2">
      <Spinner size="md" className="text-[#00D1FF]" />
      <p className="text-gray-400 text-sm">Caricamento componenti...</p>
    </div>
  </div>
);

const GameErrorFallback = () => (
  <Card className="p-6 border-red-500/30 bg-red-900/20">
    <div className="text-center">
      <AlertTriangle className="mx-auto h-8 w-8 text-red-400 mb-2" />
      <h3 className="text-red-400 font-semibold mb-2">
        Errore di caricamento
      </h3>
      <p className="text-gray-400 text-sm mb-4">
        Impossibile caricare alcuni componenti del gioco. Riprova più tardi.
      </p>
      <Button
        onClick={() => window.location.reload()}
        variant="outline"
        className="border-red-500 text-red-400"
      >
        Ricarica pagina
      </Button>
    </div>
  </Card>
);

const MemoryHackGame: React.FC = () => {
  const {
    cards,
    flippedCards,
    matchedPairs,
    moves,
    isGameComplete,
    gameStarted,
    timeElapsed,
    startGame,
    flipCard,
    resetGame
  } = useGameLogic();

  const [isCompleted, setIsCompleted] = useState(false);

  // Calculate score
  const score = Math.max(1000 - (moves * 10) - timeElapsed, 100);
  
  // Calculate game status
  const gameStatus = isGameComplete ? 'completed' : (gameStarted ? 'playing' : 'waiting');

  useEffect(() => {
    if (isGameComplete && !isCompleted) {
      setIsCompleted(true);
      
      // Track mission completed event
      if (typeof window !== 'undefined' && window.plausible) {
        window.plausible('mission_completed');
      }
      
      toast.success("Missione completata!", {
        description: `Hai completato il Memory Hack in ${moves} mosse!`
      });
    }
  }, [isGameComplete, isCompleted, moves]);

  const handleCardClick = (cardId: number) => {
    flipCard(cardId);
  };

  const handleResetGame = () => {
    resetGame();
    setIsCompleted(false);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-cyan-400 mb-2">Memory Hack</h2>
        <p className="text-gray-300">Trova tutte le coppie per hackerare il sistema</p>
      </div>

      <GameErrorBoundary fallback={<GameErrorFallback />}>
        <Suspense fallback={<GameLoadingFallback />}>
          <GameStats 
            moves={moves}
            timeElapsed={timeElapsed}
            score={score}
          />

          <GameControls 
            gameStatus={gameStatus}
            onResetGame={handleResetGame}
            onStartGame={startGame}
          />
        </Suspense>
      </GameErrorBoundary>

      {gameStarted && (
        <GameErrorBoundary fallback={<GameErrorFallback />}>
          <Suspense fallback={<GameLoadingFallback />}>
            <div className="grid gap-4 mx-auto max-w-2xl grid-cols-4">
              {cards.map((card) => (
                <GameCard
                  key={card.id}
                  card={card}
                  isFlipped={flippedCards.includes(card.id)}
                  isMatched={card.isMatched}
                  onClick={handleCardClick}
                  disabled={!gameStarted || isGameComplete}
                />
              ))}
            </div>
          </Suspense>
        </GameErrorBoundary>
      )}

      {isGameComplete && (
        <Card className="p-6 bg-green-900/20 border-green-500/30">
          <div className="text-center">
            <h3 className="text-xl font-bold text-green-400 mb-2">
              🎉 Sistema Hackerato!
            </h3>
            <p className="text-gray-300 mb-4">
              Hai completato la missione in {moves} mosse e {Math.floor(timeElapsed / 60)}:{(timeElapsed % 60).toString().padStart(2, '0')} minuti!
            </p>
            <Badge variant="outline" className="text-cyan-400 border-cyan-400">
              Punteggio: {score}
            </Badge>
          </div>
        </Card>
      )}
    </div>
  );
};

export default MemoryHackGame;
