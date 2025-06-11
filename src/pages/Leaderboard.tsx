
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

const sampleTeams = [
  { id: 1, name: "Team Alpha", members: 0, totalPoints: 0, rank: 1, badges: [] }, // LANCIO: Reset teams
  { id: 2, name: "Team Omega", members: 0, totalPoints: 0, rank: 2, badges: [] },
  { id: 3, name: "Team Gamma", members: 0, totalPoints: 0, rank: 3, badges: [] },
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
    hasMorePlayers,
    refreshLeaderboard
  } = useLeaderboardData();

  // LANCIO: Auto-refresh leaderboard to get real data
  useEffect(() => {
    const interval = setInterval(() => {
      refreshLeaderboard();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [refreshLeaderboard]);

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
    if (filteredPlayers.length === 0) {
      addNotification({
        title: "🚀 LANCIO RESET",
        description: "Classifica azzerata per il test del 19 luglio!"
      });
      return;
    }

    const randomIndex = Math.floor(Math.random() * Math.min(10, filteredPlayers.length));
    const player = filteredPlayers[randomIndex];
    
    if (player) {
      const message = `${player.name} è in classifica con ${player.points} punti!`;
      
      addNotification({
        title: "Aggiornamento Classifica",
        description: message
      });
      
      if (player.rank <= 10) {
        playSound();
        addNotification({
          title: "🏆 Traguardo Importante!",
          description: `${player.name} è nella TOP 10!`
        });
      }
    }
  };

  const topThreePlayers = filteredPlayers.slice(0, 3);

  return (
    <motion.div 
      className="bg-gradient-to-b from-[#131524]/70 to-black"
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
          backgroundColor: 'rgba(19, 21, 36, 0.7)',
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
        <div className="container mx-auto">
          <motion.h1
            className="text-4xl font-bold text-[#00D1FF] text-center mt-6 mb-8"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            style={{ textShadow: "0 0 10px rgba(0, 209, 255, 0.6), 0 0 20px rgba(0, 209, 255, 0.3)" }}
          >
            CLASSIFICA LANCIO
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
              <LeaderboardTopUsers players={topThreePlayers} />
              
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
              
              <LeaderboardProgress 
                currentPosition={filteredPlayers.length > 0 ? filteredPlayers.length : 1} 
                totalPlayers={filteredPlayers.length || 1} 
              />
            </motion.div>
          </div>
        </div>
      </main>
      
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
