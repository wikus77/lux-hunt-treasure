
// FILE CREADO O MODIFICATO — BY JOSEPH MULE
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useToast } from "@/hooks/use-toast";
import { useNotifications } from '@/hooks/useNotifications';
import { useBuzzSound } from '@/hooks/useBuzzSound';
import { CreateTeamDialog } from '@/components/leaderboard/CreateTeamDialog';
import { LeaderboardTopUsers } from '@/components/leaderboard/LeaderboardTopUsers';
import { LeaderboardHeader } from '@/components/leaderboard/LeaderboardHeader';
import { LeaderboardSearch } from '@/components/leaderboard/LeaderboardSearch';
import { LeaderboardProgress } from '@/components/leaderboard/LeaderboardProgress';
import { LeaderboardTabs } from '@/components/leaderboard/LeaderboardTabs';
import { useLeaderboardData } from '@/hooks/useLeaderboardData';
import { useIsMobile } from '@/hooks/use-mobile';
// BottomNavigation gestita da GlobalLayout
import UnifiedHeader from "@/components/layout/UnifiedHeader";

const samplePlayers = Array.from({ length: 50 }, (_, i) => ({
  id: i + 1,
  name: `Giocatore ${i + 1}`,
  avatar: `https://avatar.vercel.sh/player${i + 1}`,
  points: Math.floor(10000 - i * 30 + Math.random() * 20),
  rank: i + 1,
  cluesFound: Math.floor(50 - i * 0.3 + Math.random() * 10),
  areasExplored: Math.floor(20 - i * 0.1 + Math.random() * 5),
  team: i % 5 === 0 ? "Team Alpha" : i % 7 === 0 ? "Team Omega" : i % 3 === 0 ? "Team Gamma" : null,
  country: i % 4 === 0 ? "🇮🇹" : i % 3 === 0 ? "🇬🇧" : i % 5 === 0 ? "🇺🇸" : "🇪🇺",
  badges: i < 5 ? ["top10", "explorer"] : i < 15 ? ["explorer"] : i % 7 === 0 ? ["active"] : [],
  dailyChange: i % 3 === 0 ? Math.floor(Math.random() * 3) + 1 : i % 7 === 0 ? -Math.floor(Math.random() * 3) - 1 : 0,
}));

const sampleTeams = [
  { id: 1, name: "Team Alpha", members: 12, totalPoints: 42500, rank: 1, badges: ["top"] },
  { id: 2, name: "Team Omega", members: 8, totalPoints: 38700, rank: 2, badges: ["top"] },
  { id: 3, name: "Team Gamma", members: 15, totalPoints: 35600, rank: 3, badges: ["top"] },
  { id: 4, name: "Team Delta", members: 6, totalPoints: 29800, rank: 4, badges: [] },
  { id: 5, name: "Team Epsilon", members: 10, totalPoints: 27500, rank: 5, badges: [] },
];

const Leaderboard = () => {
  const [activeTab, setActiveTab] = useState<'players' | 'teams'>('players');
  const [showCreateTeamDialog, setShowCreateTeamDialog] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<any>(null);
  const { toast } = useToast();
  const { addNotification } = useNotifications();
  const { playSound } = useBuzzSound();
  const isMobile = useIsMobile();

  const {
    filter,
    setFilter,
    searchQuery,
    setSearchQuery,
    filteredPlayers,
    isLoading,
    handleLoadMore,
    hasMorePlayers
  } = useLeaderboardData(samplePlayers);

  const handleInvite = (player: any) => {
    setSelectedPlayer(player);
    toast({
      title: "Invito inviato!",
      description: `Hai invitato ${player.name} a unirsi alla tua squadra.`
    });
    playSound();
  };

  const handleCreateTeamAndInvite = (player: any) => {
    setSelectedPlayer(player);
    setShowCreateTeamDialog(true);
  };

  const simulateRankChange = () => {
    const randomIndex = Math.floor(Math.random() * 10);
    const direction = Math.random() > 0.5 ? 1 : -1;
    const player = samplePlayers[randomIndex];
    const change = direction * (Math.floor(Math.random() * 2) + 1);
    
    const message = change > 0 
      ? `${player.name} è salito di ${change} posizioni!` 
      : `${player.name} è sceso di ${Math.abs(change)} posizioni!`;
    
    addNotification({
      title: "Aggiornamento Classifica",
      description: message
    });
    
    if (player.rank - change <= 10 && player.rank > 10) {
      playSound();
      addNotification({
        title: "🏆 Traguardo Importante!",
        description: `${player.name} è entrato nella TOP 10!`
      });
    }
  };

  useEffect(() => {
    const timer = setInterval(() => {
      if (Math.random() > 0.7) {
        simulateRankChange();
      }
    }, 15000 + Math.random() * 15000);
    
    return () => clearInterval(timer);
  }, []);

  // 🎨 SOFT NATIVE: Apple-like design update
  return (
    <motion.div 
      className="sn-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      style={{ 
        height: '100dvh',
        overflow: 'hidden',
        position: 'relative',
        background: 'linear-gradient(180deg, #FFFFFF 0%, #F8F9FA 100%)',
      }}
    >
      {/* Fixed Header - 🎨 SOFT NATIVE: Light glass header */}
      <header 
        className="fixed top-0 left-0 right-0 z-50"
        style={{
          height: '72px',
          paddingTop: 'env(safe-area-inset-top, 47px)',
          background: 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
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
        <div className="container mx-auto">
          {/* 🎨 SOFT NATIVE: Clean section title */}
          <motion.div
            className="sn-card-elevated mb-6 mx-3 relative"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <h1 className="sn-section-title text-center" style={{ marginBottom: 0 }}>
              <span style={{ color: 'var(--sn-accent)' }}>Classi</span>
              <span style={{ color: 'var(--sn-text-primary)' }}>fica</span>
            </h1>
          </motion.div>
          
          {/* 🎨 SOFT NATIVE: Header filtri */}
          <motion.div
            className="sn-card mb-4 mx-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <LeaderboardHeader 
              onSimulateRankChange={simulateRankChange}
              onFilterChange={setFilter}
            />
          </motion.div>

          {/* 🎨 SOFT NATIVE: Ricerca */}
          <motion.div
            className="sn-card mb-4 mx-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <LeaderboardSearch value={searchQuery} onChange={setSearchQuery} />
          </motion.div>

          {/* 🎨 SOFT NATIVE: Top 3 Podio */}
          <motion.div
            className="sn-card-elevated sn-leaderboard-podium mb-4 mx-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <LeaderboardTopUsers players={samplePlayers.slice(0, 3)} />
          </motion.div>

          {/* 🎨 SOFT NATIVE: Lista principale */}
          <motion.div
            className="sn-card mb-4 mx-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <LeaderboardTabs 
              filteredPlayers={filteredPlayers}
              isLoading={isLoading}
              hasMorePlayers={hasMorePlayers}
              sampleTeams={sampleTeams}
              onLoadMore={handleLoadMore}
              onInvite={handleInvite}
              onCreateTeam={handleCreateTeamAndInvite}
              onTabChange={setActiveTab}
            />
          </motion.div>

          {/* 🎨 SOFT NATIVE: Progress personale */}
          <motion.div
            className="sn-card mb-6 mx-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <LeaderboardProgress currentPosition={42} totalPlayers={100} />
          </motion.div>
        </div>
      </main>
      
      <CreateTeamDialog
        open={showCreateTeamDialog}
        onClose={() => setShowCreateTeamDialog(false)}
        player={selectedPlayer}
      />
      
      {/* BottomNavigation gestita da GlobalLayout */}
    </motion.div>
  );
};

export default Leaderboard;

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
