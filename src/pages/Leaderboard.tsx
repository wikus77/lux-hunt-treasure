
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { PlayerCard } from '@/components/leaderboard/PlayerCard';
import { LeaderboardFilters } from '@/components/leaderboard/LeaderboardFilters';
import { useToast } from "@/components/ui/toaster";

// Sample data - Da sostituire con dati reali dall'API
const samplePlayers = [
  { id: 1, name: "Andrew A.", avatar: "https://avatar.vercel.sh/andrew", points: 9800, rank: 1 },
  { id: 2, name: "Danielle R.", avatar: "https://avatar.vercel.sh/danielle", points: 9500, rank: 2 },
  { id: 3, name: "Robert C.", avatar: "https://avatar.vercel.sh/robert", points: 9200, rank: 3 },
  // ... altri giocatori
];

const Leaderboard = () => {
  const [filter, setFilter] = useState<'all' | 'team' | 'country'>('all');
  const { toast } = useToast();

  const handleInvite = (playerName: string) => {
    toast({
      title: "Invito inviato!",
      description: `Hai invitato ${playerName} a unirsi alla tua squadra.`
    });
  };

  return (
    <div className="min-h-screen bg-black text-white pt-4 pb-20">
      <div className="max-w-4xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                  M1SSION
                </span>
              </h1>
              <p className="text-cyan-400 text-lg font-light tracking-wider">INVITE TO SQUAD</p>
            </div>
            <LeaderboardFilters onFilterChange={setFilter} />
          </div>

          <div className="space-y-4">
            {samplePlayers.map((player) => (
              <motion.div
                key={player.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <PlayerCard
                  rank={player.rank}
                  name={player.name}
                  avatar={player.avatar}
                  points={player.points}
                  onInvite={() => handleInvite(player.name)}
                />
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Leaderboard;
