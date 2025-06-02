
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { GameCard } from '@/components/games/GameCard';
import { gameData, GameType } from '@/components/games/memory-hack/gameData';
import { useGameLogic } from '@/hooks/useGameLogic';
import { useNotifications } from '@/hooks/useNotifications';
import { useBuzzSound } from '@/hooks/useBuzzSound';
import MemoryHackGame from '@/components/games/MemoryHackGame';
import DisarmTheBombGame from '@/components/games/DisarmTheBombGame';
import FlashInterrogationGame from '@/components/games/FlashInterrogationGame';
import CrackTheCombinationGame from '@/components/games/CrackTheCombinationGame';
import SatelliteTrackingGame from '@/components/games/SatelliteTrackingGame';
import FindMapPointGame from '@/components/games/FindMapPointGame';
import UnifiedHeader from "@/components/layout/UnifiedHeader";
import BottomNavigation from "@/components/layout/BottomNavigation";

const Games = () => {
  const [selectedGame, setSelectedGame] = useState<GameType | null>(null);
  const [gameCompleted, setGameCompleted] = useState<Record<GameType, boolean>>({
    'memory-hack': false,
    'disarm-bomb': false,
    'flash-interrogation': false,
    'crack-combination': false,
    'satellite-tracking': false,
    'find-map-point': false,
  });

  const { addNotification } = useNotifications();
  const { playSound } = useBuzzSound();

  const { score, level, gameStats, updateStats } = useGameLogic();

  const handleGameComplete = (gameType: GameType, points: number) => {
    setGameCompleted(prev => ({ ...prev, [gameType]: true }));
    updateStats(points);
    playSound();
    addNotification({
      title: "🏆 Missione Completata!",
      description: `Hai ottenuto ${points} punti nel gioco ${gameData[gameType].title}!`
    });
  };

  const renderGame = () => {
    if (!selectedGame) return null;

    // Since the game components don't accept onBack prop, we'll render them without it
    // and handle navigation through other means
    switch (selectedGame) {
      case 'memory-hack':
        return <MemoryHackGame />;
      case 'disarm-bomb':
        return <DisarmTheBombGame />;
      case 'flash-interrogation':
        return <FlashInterrogationGame />;
      case 'crack-combination':
        return <CrackTheCombinationGame />;
      case 'satellite-tracking':
        return <SatelliteTrackingGame />;
      case 'find-map-point':
        return <FindMapPointGame />;
      default:
        return null;
    }
  };

  if (selectedGame) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#131524]/70 to-black" style={{ overflow: 'hidden' }}>
        {/* Fixed Header */}
        <div className="fixed top-0 left-0 right-0 z-50">
          <UnifiedHeader />
        </div>
        
        {/* CRITICAL FIX: Main content with proper scroll containment */}
        <main
          style={{
            paddingTop: 'calc(72px + 47px)', // Header height + safe zone top
            paddingBottom: 'calc(64px + 34px)', // Bottom nav + safe zone bottom
            maxHeight: '100dvh',
            overflowY: 'auto',
            overflowX: 'hidden',
            position: 'relative',
            zIndex: 0
          }}
        >
          <div className="container mx-auto px-3">
            <button
              onClick={() => setSelectedGame(null)}
              className="mb-4 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
            >
              ← Torna ai giochi
            </button>
            {renderGame()}
          </div>
        </main>
        <BottomNavigation />
      </div>
    );
  }

  return (
    <motion.div 
      className="min-h-screen bg-gradient-to-b from-[#131524]/70 to-black w-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      style={{ overflow: 'hidden' }}
    >
      {/* Fixed Header */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <UnifiedHeader />
      </div>
      
      {/* CRITICAL FIX: Main content with proper scroll containment */}
      <main
        style={{
          paddingTop: 'calc(72px + 47px)', // Header height + safe zone top
          paddingBottom: 'calc(64px + 34px)', // Bottom nav + safe zone bottom
          maxHeight: '100dvh',
          overflowY: 'auto',
          overflowX: 'hidden',
          position: 'relative',
          zIndex: 0
        }}
      >
        <div className="container mx-auto">
          <motion.h1
            className="text-4xl font-orbitron font-bold text-[#00D1FF] text-center mt-6 mb-8"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            style={{ textShadow: "0 0 10px rgba(0, 209, 255, 0.6), 0 0 20px rgba(0, 209, 255, 0.3)" }}
          >
            M1SSION GAMES
          </motion.h1>
          
          {/* Game Stats */}
          <motion.div
            className="max-w-4xl mx-auto mb-8 px-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <div className="glass-card p-4 text-center">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <div className="text-2xl font-bold text-[#00D1FF]">{score}</div>
                  <div className="text-gray-400 text-sm">Punti Totali</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-[#F059FF]">{level}</div>
                  <div className="text-gray-400 text-sm">Livello Agente</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-[#00FF88]">{gameStats.gamesPlayed}</div>
                  <div className="text-gray-400 text-sm">Missioni</div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Games Grid */}
          <div className="max-w-4xl mx-auto px-3">
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              {Object.entries(gameData).map(([gameType, game]) => (
                <GameCard
                  key={gameType}
                  game={game}
                  isCompleted={gameCompleted[gameType as GameType]}
                  onPlay={() => setSelectedGame(gameType as GameType)}
                />
              ))}
            </motion.div>
          </div>
        </div>
      </main>
      
      <BottomNavigation />
    </motion.div>
  );
};

export default Games;
