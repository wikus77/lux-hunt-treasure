
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import UnifiedHeader from "@/components/layout/UnifiedHeader";
import BottomNavigation from "@/components/layout/BottomNavigation";
import GameCard from "@/components/games/GameCard";
import MemoryHackGame from "@/components/games/MemoryHackGame";
import CipherDecodeGame from "@/components/games/CipherDecodeGame";
import TimeTrialGame from "@/components/games/TimeTrialGame";
import GameStats from "@/components/games/GameStats";

const Games = () => {
  const [selectedGame, setSelectedGame] = useState<string | null>(null);

  const games = [
    {
      id: 'memory-hack',
      title: 'Memory Hack',
      description: 'Testa la tua memoria con questo gioco di abbinamento simboli Mission',
      difficulty: 'Medio' as const,
      rewards: '100-500 punti',
      isLocked: false,
      progress: 75
    },
    {
      id: 'cipher-decode',
      title: 'Decodifica Cipher',
      description: 'Decifra i codici segreti dell\'antica Roma',
      difficulty: 'Difficile' as const,
      rewards: '200-800 punti',
      isLocked: false, // Unlocked for developers
      progress: 25
    },
    {
      id: 'time-trial',
      title: 'Corsa Contro il Tempo',
      description: 'Risolvi enigmi Mission in tempo limitato',
      difficulty: 'Facile' as const,
      rewards: '50-300 punti',
      isLocked: false, // Unlocked for developers
      progress: 50
    }
  ];

  const mockStats = {
    totalGamesPlayed: 12,
    totalScore: 3450,
    bestScore: 875,
    averageTime: 45,
    completionRate: 83
  };

  const handleGameSelect = (gameId: string) => {
    const game = games.find(g => g.id === gameId);
    if (game && !game.isLocked) {
      setSelectedGame(gameId);
    }
  };

  const handleBackToMenu = () => {
    setSelectedGame(null);
  };

  if (selectedGame === 'memory-hack') {
    return (
      <motion.div 
        className="bg-gradient-to-b from-[#131524]/70 to-black w-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        style={{ 
          height: '100dvh',
          overflow: 'hidden',
          position: 'relative'
        }}
      >
        <header 
          className="fixed top-0 left-0 right-0 z-50"
          style={{
            height: '72px',
            paddingTop: 'env(safe-area-inset-top, 47px)',
            backgroundColor: 'rgba(19, 21, 36, 0.7)',
            backdropFilter: 'blur(12px)'
          }}
        >
          <UnifiedHeader />
        </header>
        
        <main
          style={{
            paddingTop: 'calc(72px + env(safe-area-inset-top, 47px) + 40px)',
            paddingBottom: 'calc(80px + env(safe-area-inset-bottom, 34px))',
            height: '100dvh',
            overflowY: 'auto',
            position: 'relative',
            zIndex: 0
          }}
        >
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={handleBackToMenu}
                className="text-blue-400 hover:text-blue-300 transition-colors"
              >
                ← Torna ai Giochi
              </button>
            </div>
            
            <MemoryHackGame />
          </div>
        </main>
        
        <BottomNavigation />
      </motion.div>
    );
  }

  if (selectedGame === 'cipher-decode') {
    return (
      <motion.div 
        className="bg-gradient-to-b from-[#131524]/70 to-black w-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        style={{ 
          height: '100dvh',
          overflow: 'hidden',
          position: 'relative'
        }}
      >
        <header 
          className="fixed top-0 left-0 right-0 z-50"
          style={{
            height: '72px',
            paddingTop: 'env(safe-area-inset-top, 47px)',
            backgroundColor: 'rgba(19, 21, 36, 0.7)',
            backdropFilter: 'blur(12px)'
          }}
        >
          <UnifiedHeader />
        </header>
        
        <main
          style={{
            paddingTop: 'calc(72px + env(safe-area-inset-top, 47px) + 40px)',
            paddingBottom: 'calc(80px + env(safe-area-inset-bottom, 34px))',
            height: '100dvh',
            overflowY: 'auto',
            position: 'relative',
            zIndex: 0
          }}
        >
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={handleBackToMenu}
                className="text-blue-400 hover:text-blue-300 transition-colors"
              >
                ← Torna ai Giochi
              </button>
            </div>
            
            <CipherDecodeGame />
          </div>
        </main>
        
        <BottomNavigation />
      </motion.div>
    );
  }

  if (selectedGame === 'time-trial') {
    return (
      <motion.div 
        className="bg-gradient-to-b from-[#131524]/70 to-black w-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        style={{ 
          height: '100dvh',
          overflow: 'hidden',
          position: 'relative'
        }}
      >
        <header 
          className="fixed top-0 left-0 right-0 z-50"
          style={{
            height: '72px',
            paddingTop: 'env(safe-area-inset-top, 47px)',
            backgroundColor: 'rgba(19, 21, 36, 0.7)',
            backdropFilter: 'blur(12px)'
          }}
        >
          <UnifiedHeader />
        </header>
        
        <main
          style={{
            paddingTop: 'calc(72px + env(safe-area-inset-top, 47px) + 40px)',
            paddingBottom: 'calc(80px + env(safe-area-inset-bottom, 34px))',
            height: '100dvh',
            overflowY: 'auto',
            position: 'relative',
            zIndex: 0
          }}
        >
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={handleBackToMenu}
                className="text-blue-400 hover:text-blue-300 transition-colors"
              >
                ← Torna ai Giochi
              </button>
            </div>
            
            <TimeTrialGame />
          </div>
        </main>
        
        <BottomNavigation />
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="bg-gradient-to-b from-[#131524]/70 to-black w-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      style={{ 
        height: '100dvh',
        overflow: 'hidden',
        position: 'relative'
      }}
    >
      <header 
        className="fixed top-0 left-0 right-0 z-50"
        style={{
          height: '72px',
          paddingTop: 'env(safe-area-inset-top, 47px)',
          backgroundColor: 'rgba(19, 21, 36, 0.7)',
          backdropFilter: 'blur(12px)'
        }}
      >
        <UnifiedHeader />
      </header>
      
      <main
        style={{
          paddingTop: 'calc(72px + env(safe-area-inset-top, 47px) + 40px)',
          paddingBottom: 'calc(80px + env(safe-area-inset-bottom, 34px))',
          height: '100dvh',
          overflowY: 'auto',
          position: 'relative',
          zIndex: 0
        }}
      >
        <div className="container mx-auto px-4">
          <motion.h1
            className="text-4xl font-orbitron font-bold text-[#00D1FF] text-center mb-8"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            style={{ textShadow: "0 0 10px rgba(0, 209, 255, 0.6), 0 0 20px rgba(0, 209, 255, 0.3)" }}
          >
            GIOCHI MISSION
          </motion.h1>
          
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {games.map((game) => (
              <GameCard
                key={game.id}
                title={game.title}
                description={game.description}
                difficulty={game.difficulty}
                rewards={game.rewards}
                isLocked={game.isLocked}
                progress={game.progress}
                onPlay={() => handleGameSelect(game.id)}
              />
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <GameStats {...mockStats} />
          </motion.div>
        </div>
      </main>
      
      <BottomNavigation />
    </motion.div>
  );
};

export default Games;
