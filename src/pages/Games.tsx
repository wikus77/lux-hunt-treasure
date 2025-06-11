
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import UnifiedHeader from "@/components/layout/UnifiedHeader";
import BottomNavigation from "@/components/layout/BottomNavigation";
import GameCard from "@/components/games/GameCard";
import MemoryHackGame from "@/components/games/MemoryHackGame";
import CipherDecodeGame from "@/components/games/CipherDecodeGame";
import TimeTrialGame from "@/components/games/TimeTrialGame";
import GameStats from "@/components/games/GameStats";
import { useAuth } from '@/hooks/useAuth';

const Games = () => {
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const { user } = useAuth();

  // SURGICAL FIX: All 6 games restored with developer access
  const isDeveloper = user?.email === 'wikus77@hotmail.it' || localStorage.getItem('developer_access') === 'granted';

  const games = [
    {
      id: 'memory-hack',
      title: 'Memory Hack',
      description: 'Testa la tua memoria con questo gioco di abbinamento simboli Mission',
      difficulty: 'Medio' as const,
      rewards: '100-500 punti',
      isLocked: false, // SURGICAL FIX: All unlocked
      progress: 75
    },
    {
      id: 'cipher-decode',
      title: 'Decodifica Cipher',
      description: 'Decifra i codici segreti dell\'antica Roma',
      difficulty: 'Difficile' as const,
      rewards: '200-800 punti',
      isLocked: false, // SURGICAL FIX: All unlocked
      progress: 60
    },
    {
      id: 'time-trial',
      title: 'Corsa Contro il Tempo',
      description: 'Risolvi enigmi Mission in tempo limitato',
      difficulty: 'Facile' as const,
      rewards: '50-300 punti',
      isLocked: false, // SURGICAL FIX: All unlocked
      progress: 80
    },
    {
      id: 'agent-infiltration',
      title: 'Infiltrazione Agente',
      description: 'Missioni stealth e infiltrazione segreta',
      difficulty: 'Difficile' as const,
      rewards: '300-900 punti',
      isLocked: false, // SURGICAL FIX: All unlocked for restoration
      progress: 45
    },
    {
      id: 'code-breaker',
      title: 'Code Breaker Elite',
      description: 'Decifratura codici di alta sicurezza',
      difficulty: 'Molto Difficile' as const,
      rewards: '400-1200 punti',
      isLocked: false, // SURGICAL FIX: All unlocked for restoration
      progress: 30
    },
    {
      id: 'tactical-ops',
      title: 'Operazioni Tattiche',
      description: 'Strategia militare e operazioni speciali',
      difficulty: 'Estremo' as const,
      rewards: '500-1500 punti',
      isLocked: false, // SURGICAL FIX: All unlocked for restoration
      progress: 15
    }
  ];

  // SURGICAL FIX: Enhanced stats with all games included
  const mockStats = {
    totalGamesPlayed: 24, // Updated for 6 games
    totalScore: 6750, // Enhanced total
    bestScore: 1450, // Enhanced best score
    averageTime: 52, // Updated average
    completionRate: 78 // Updated completion rate
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

  // SURGICAL FIX: Game rendering with all 6 games available
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

  // SURGICAL FIX: Placeholder games for the additional 3 games
  if (['agent-infiltration', 'code-breaker', 'tactical-ops'].includes(selectedGame || '')) {
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
            
            <div className="m1ssion-glass-card p-6 text-center">
              <h2 className="text-2xl font-orbitron font-bold text-[#00D1FF] mb-4">
                {games.find(g => g.id === selectedGame)?.title}
              </h2>
              <p className="text-white/70 mb-6">
                {games.find(g => g.id === selectedGame)?.description}
              </p>
              <div className="text-yellow-400 font-bold text-lg mb-4">
                🎮 GIOCO IN SVILUPPO
              </div>
              <p className="text-white/60 mb-6">
                Questo gioco è attualmente in fase di sviluppo e sarà disponibile presto.
                {isDeveloper && <span className="block mt-2 text-green-400">👨‍💻 DEVELOPER: Gioco sbloccato per test</span>}
              </p>
              <button
                onClick={handleBackToMenu}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded transition-colors"
              >
                Torna al Menu
              </button>
            </div>
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
            {isDeveloper && <span className="text-green-400 text-lg block mt-2">👨‍💻 DEVELOPER MODE - TUTTI I GIOCHI SBLOCCATI</span>}
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
