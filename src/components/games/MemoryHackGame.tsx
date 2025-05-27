
import React from 'react';
import GameCard from './memory-hack/GameCard';
import GameStats from './memory-hack/GameStats';
import GameControls from './memory-hack/GameControls';
import { useGameLogic } from './memory-hack/useGameLogic';

const MemoryHackGame = () => {
  const {
    gameState,
    cards,
    matchedPairs,
    errors,
    timeLeft,
    isProcessing,
    handleCardClick,
    initializeGame,
    resetGame
  } = useGameLogic();

  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-black/60 backdrop-blur-md border border-white/10 rounded-xl">
      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-orbitron font-bold mb-2">
          <span className="text-[#00D1FF]">MEMORY</span> <span className="text-white">HACK</span>
        </h2>
        <p className="text-white/70 font-sans">Trova tutte le coppie in 45 secondi</p>
      </div>

      {/* Game Stats */}
      {gameState === 'playing' && (
        <GameStats 
          timeLeft={timeLeft}
          errors={errors}
          matchedPairs={matchedPairs}
          totalPairs={8}
        />
      )}

      {/* Game Board */}
      {gameState === 'playing' && (
        <div className="grid grid-cols-4 gap-3 mb-6">
          {cards.map((card) => (
            <GameCard
              key={card.id}
              card={card}
              onClick={handleCardClick}
              disabled={isProcessing}
            />
          ))}
        </div>
      )}

      {/* Game Controls */}
      <div className="text-center">
        <GameControls
          gameState={gameState}
          errors={errors}
          onStartGame={initializeGame}
          onResetGame={resetGame}
        />
      </div>
    </div>
  );
};

export default MemoryHackGame;
