// FILE CREATO O MODIFICATO — BY JOSEPH MULE
// 🔒 AAA+ Analytics Integration (17/01/2026)
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { GameCard } from '@/components/games/GameCard';
import { gameData, GameType } from '@/components/games/memory-hack/gameData';
import { useGameLogic } from '@/hooks/useGameLogic';
import { useNotifications } from '@/hooks/useNotifications';
import { useBuzzSound } from '@/hooks/useBuzzSound';
import { useDynamicIslandSafety } from "@/hooks/useDynamicIslandSafety";
import { useDynamicIsland } from "@/hooks/useDynamicIsland";
import { useMissionManager } from '@/hooks/useMissionManager';
import GameErrorBoundary from '@/components/games/GameErrorBoundary';
import MemoryHackGame from '@/components/games/MemoryHackGame';
import DisarmTheBombGame from '@/components/games/DisarmTheBombGame';
import FlashInterrogationGame from '@/components/games/FlashInterrogationGame';
import CrackTheCombinationGame from '@/components/games/CrackTheCombinationGame';
import SatelliteTrackingGame from '@/components/games/SatelliteTrackingGame';
import FindMapPointGame from '@/components/games/FindMapPointGame';
import UnifiedHeader from "@/components/layout/UnifiedHeader";
import BottomNavigation from "@/components/layout/BottomNavigation";
import { trackMinigame, GameId } from '@/lib/analytics';

// 🔒 Convert GameType to GameId for analytics
const gameTypeToGameId = (gameType: GameType): GameId => {
  const mapping: Record<GameType, GameId> = {
    'memory-hack': 'memory_hack',
    'disarm-bomb': 'bomb_defuse',
    'flash-interrogation': 'flash_interrogation',
    'crack-combination': 'crack_combination',
    'satellite-tracking': 'satellite_tracking',
    'find-map-point': 'find_map_point',
  };
  return mapping[gameType];
};

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
  const { startActivity, updateActivity, endActivity } = useDynamicIsland();
  const { currentMission } = useMissionManager();

  // 🔒 AAA+ Analytics: Track game session
  const currentRunIdRef = useRef<string | null>(null);
  const gameStartTimeRef = useRef<number | null>(null);

  // Attiva il sistema di sicurezza Dynamic Island
  useDynamicIslandSafety();

  // 🔒 AAA+ Analytics: Track when a game is opened/started
  useEffect(() => {
    if (selectedGame) {
      const runId = `run_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      currentRunIdRef.current = runId;
      gameStartTimeRef.current = Date.now();
      
      // Track game opened
      trackMinigame('minigame_opened', {
        game_id: gameTypeToGameId(selectedGame),
        run_id: runId,
      });
      
      // Track game started (after brief delay for "actual start")
      setTimeout(() => {
        trackMinigame('minigame_started', {
          game_id: gameTypeToGameId(selectedGame),
          run_id: runId,
        });
      }, 500);
    } else if (currentRunIdRef.current && gameStartTimeRef.current) {
      // Game was abandoned (user clicked back without completing)
      const duration = Date.now() - gameStartTimeRef.current;
      if (duration > 2000) { // Only track if played for at least 2 seconds
        // Note: We can't know which game was abandoned after state reset
        // This is handled by the back button click
      }
      currentRunIdRef.current = null;
      gameStartTimeRef.current = null;
    }
  }, [selectedGame]);

  // Dynamic Island integration for GAMES - New minigame unlocked con logging avanzato
  useEffect(() => {
    const checkNewMinigames = () => {
      const unlockedGames = Object.entries(gameCompleted).filter(([_, completed]) => !completed);
      
      if (unlockedGames.length > 0 && score >= 100) {
        const [gameType, _] = unlockedGames[0];
        const gameName = gameData[gameType as GameType].title;
        
        console.log('🎮 GAMES: Starting Dynamic Island for new minigame:', gameName);
        startActivity({
          missionId: `game-unlock-${Date.now()}`,
          title: "🧩 Minigioco sbloccato",
          status: `${gameName} disponibile`,
          progress: 0,
          timeLeft: 1800,
        });
      }
    };

    checkNewMinigames();
  }, [score, gameCompleted, startActivity]);

  // Cleanup migliorato con controllo specifico per giochi
  useEffect(() => {
    return () => {
      // Solo chiudere se è relativo ai giochi
      if (currentMission?.name?.includes('Minigioco') || currentMission?.name?.includes('🧩')) {
        console.log('🎮 GAMES: Cleaning up game-related Live Activity');
        endActivity();
      }
    };
  }, [endActivity, currentMission]);

  const handleGameComplete = (gameType: GameType, points: number) => {
    setGameCompleted(prev => ({ ...prev, [gameType]: true }));
    updateStats(points);
    playSound();
    addNotification({
      title: "🏆 Missione Completata!",
      description: `Hai ottenuto ${points} punti nel gioco ${gameData[gameType].title}!`
    });

    // Update Dynamic Island with completion
    updateActivity({
      status: `${gameData[gameType].title} completato`,
      progress: 100,
    });

    // 🔒 AAA+ Analytics: Track game completed
    const duration = gameStartTimeRef.current 
      ? Date.now() - gameStartTimeRef.current 
      : undefined;
    
    trackMinigame('minigame_completed', {
      game_id: gameTypeToGameId(gameType),
      run_id: currentRunIdRef.current || undefined,
      score: points,
      duration_ms: duration,
      result: 'win',
    });
    
    // Reset tracking refs
    currentRunIdRef.current = null;
    gameStartTimeRef.current = null;
  };

  // 🔒 AAA+ Analytics: Handle game abandonment
  const handleBackToGames = () => {
    if (selectedGame && currentRunIdRef.current && gameStartTimeRef.current) {
      const duration = Date.now() - gameStartTimeRef.current;
      
      // Only track abandon if played for at least 2 seconds
      if (duration > 2000) {
        trackMinigame('minigame_abandoned', {
          game_id: gameTypeToGameId(selectedGame),
          run_id: currentRunIdRef.current,
          duration_ms: duration,
          result: 'quit',
        });
      }
    }
    
    currentRunIdRef.current = null;
    gameStartTimeRef.current = null;
    setSelectedGame(null);
  };

  const renderGame = () => {
    if (!selectedGame) return null;

    // Wrap each game component in GameErrorBoundary
    const gameComponent = (() => {
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
    })();

    return (
      <GameErrorBoundary>
        {gameComponent}
      </GameErrorBoundary>
    );
  };

  if (selectedGame) {
    return (
      <div 
        className="bg-gradient-to-b from-[#131524]/70 to-black"
        style={{ 
          height: '100dvh',
          overflow: 'hidden',
          position: 'relative'
        }}
      >
        {/* Fixed Header */}
        <header 
          className="fixed top-0 left-0 right-0 z-50"
          style={{
            height: '72px',
            paddingTop: 'env(safe-area-inset-top, 47px)',
            background: 'rgba(19, 21, 33, 0.55)',
            backdropFilter: 'blur(12px)'
          }}
        >
          <UnifiedHeader />
        </header>
        
        {/* Main scrollable content */}
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
          <div className="container mx-auto px-3">
            <button
              onClick={handleBackToGames}
              className="mb-4 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
            >
              ← Torna ai giochi
            </button>
            {renderGame()}
          </div>
        </main>
        
        {/* Bottom Navigation - Uniform positioning like Home */}
        <div 
          id="mission-bottom-nav-container"
          style={{ 
            position: 'fixed', 
            bottom: 0, 
            left: 0, 
            right: 0, 
            width: '100vw',
            zIndex: 10000,
            isolation: 'isolate',
            transform: 'translateZ(0)',
            willChange: 'transform',
            display: 'block',
            visibility: 'visible',
            opacity: 1
          } as React.CSSProperties}
        >
          <BottomNavigation />
        </div>
      </div>
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
      {/* Fixed Header */}
      <header 
        className="fixed top-0 left-0 right-0 z-50"
        style={{
          height: '72px',
          paddingTop: 'env(safe-area-inset-top, 47px)',
          background: 'rgba(19, 21, 33, 0.55)',
          backdropFilter: 'blur(12px)'
        }}
      >
        <UnifiedHeader />
      </header>
      
      {/* Main scrollable content */}
      <main
        style={{
          paddingTop: 'calc(72px + env(safe-area-inset-top, 47px) + 60px)',
          paddingBottom: 'calc(80px + env(safe-area-inset-bottom, 34px))',
          height: '100dvh',
          overflowY: 'auto',
          position: 'relative',
          zIndex: 0
        }}
      >
        <div className="container mx-auto">
          {/* 🔐 FIRMATO: BY JOSEPH MULÈ — CEO di NIYVORA KFT™ - Colorazione dinamica titolo */}
          <motion.h1
            className="text-4xl font-orbitron font-bold text-center mt-6 mb-8"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <span 
              className="text-[#00F7FF]"
              style={{ textShadow: "0 0 10px rgba(0, 247, 255, 0.6), 0 0 20px rgba(0, 247, 255, 0.3)" }}
            >
              M1
            </span>
            <span 
              className="text-white"
              style={{ textShadow: "0 0 10px rgba(255, 255, 255, 0.6), 0 0 20px rgba(255, 255, 255, 0.3)" }}
            >
              SSION GAMES
            </span>
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
      
      {/* Bottom Navigation - Uniform positioning like Home */}
      <div 
        id="mission-bottom-nav-container"
        style={{ 
          position: 'fixed', 
          bottom: 0, 
          left: 0, 
          right: 0, 
          width: '100vw',
          zIndex: 10000,
          isolation: 'isolate',
          transform: 'translateZ(0)',
          willChange: 'transform',
          display: 'block',
          visibility: 'visible',
          opacity: 1
        } as React.CSSProperties}
      >
        <BottomNavigation />
      </div>
    </motion.div>
  );
};

export default Games;
