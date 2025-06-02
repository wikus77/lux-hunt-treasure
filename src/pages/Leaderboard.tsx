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
import BottomNavigation from '@/components/layout/BottomNavigation';
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

  return (
    <motion.div 
      className="min-h-screen bg-gradient-to-b from-[#131524]/70 to-black overflow-x-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      style={{ 
        paddingTop: 'env(safe-area-inset-top, 47px)',
        paddingBottom: 'calc(64px + env(safe-area-inset-bottom, 34px))'
      }}
    >
      <UnifiedHeader />
      
      {/* Content positioned below header - CRITICAL FIX: Explicit spacing */}
      <div 
        className="w-full overflow-y-auto"
        style={{ 
          // FIXED: Safe zone (47px) + header height (72px) = 119px total
          paddingTop: '119px',
          marginTop: 0,
          maxHeight: 'calc(100vh - 119px - 64px - env(safe-area-inset-bottom, 34px))'
        }}
      />
      
      <div className="container mx-auto">
        <motion.h1
          className="text-4xl font-bold text-[#00D1FF] text-center mt-6 mb-8"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          style={{ textShadow: "0 0 10px rgba(0, 209, 255, 0.6), 0 0 20px rgba(0, 209, 255, 0.3)" }}
        >
          CLASSIFICA
        </motion.h1>
        
        <div className="max-w-4xl mx-auto px-3 sm:px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-4 sm:space-y-6 glass-card"
          >
            <LeaderboardHeader 
              onSimulateRankChange={simulateRankChange}
              onFilterChange={setFilter}
            />
            <LeaderboardSearch value={searchQuery} onChange={setSearchQuery} />
            <LeaderboardTopUsers players={samplePlayers.slice(0, 3)} />
            
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
            
            <LeaderboardProgress currentPosition={42} totalPlayers={100} />
          </motion.div>
        </div>
      </div>
      
      <CreateTeamDialog
        open={showCreateTeamDialog}
        onClose={() => setShowCreateTeamDialog(false)}
        player={selectedPlayer}
      />
      
      <BottomNavigation />
    </motion.div>
  );
};

export default Leaderboard;
