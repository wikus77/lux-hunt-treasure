
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
    matchedCards,
    moves,
    timeElapsed,
    gameStatus,
    difficulty,
    score,
    handleCardClick,
    resetGame,
    setDifficulty
  } = useGameLogic();

  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    if (gameStatus === 'completed' && !isCompleted) {
      setIsCompleted(true);
      
      // Track mission completed event
      if (typeof window !== 'undefined' && window.plausible) {
        window.plausible('mission_completed');
      }
      
      toast.success("Missione completata!", {
        description: `Hai completato il Memory Hack in ${moves} mosse!`
      });
    }
  }, [gameStatus, isCompleted, moves]);

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
        difficulty={difficulty}
        onDifficultyChange={setDifficulty}
        onResetGame={() => {
          resetGame();
          setIsCompleted(false);
        }}
        gameStatus={gameStatus}
      />

      <div className={`grid gap-4 mx-auto max-w-2xl ${
        difficulty === 'easy' ? 'grid-cols-4' : 
        difficulty === 'medium' ? 'grid-cols-6' : 'grid-cols-8'
      }`}>
        {cards.map((card) => (
          <GameCard
            key={card.id}
            card={card}
            isFlipped={flippedCards.includes(card.id)}
            isMatched={matchedCards.includes(card.id)}
            onClick={() => handleCardClick(card.id)}
            disabled={gameStatus !== 'playing'}
          />
        ))}
      </div>

      {gameStatus === 'completed' && (
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
