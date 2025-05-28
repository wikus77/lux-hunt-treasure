
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useGameLogic } from "./memory-hack/useGameLogic";
import GameStats from "./memory-hack/GameStats";
import GameControls from "./memory-hack/GameControls";
import GameCard from "./memory-hack/GameCard";

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

      {gameStarted && (
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
