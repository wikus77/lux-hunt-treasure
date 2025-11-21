
import React from 'react';
import { motion } from 'framer-motion';
import { UserRankBadge } from '@/components/leaderboard/UserRankBadge';
import { Avatar } from '@/components/ui/avatar';
import { Trophy, Star, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface Player {
  id: number;
  name: string;
  avatar: string;
  points: number;
  rank: number;
  cluesFound: number;
  areasExplored: number;
}

interface LeaderboardTopUsersProps {
  players: Player[];
}

export function LeaderboardTopUsers({ players }: LeaderboardTopUsersProps) {
  const { toast } = useToast();

  const handleInvite = (player: Player) => {
    toast({
      title: "Invito inviato!",
      description: `Hai invitato ${player.name} a unirsi alla tua squadra.`
    });
  };

  if (players.length < 3) return null;

  return (
    <div className="relative my-6">
      <div className="absolute inset-0 bg-gradient-to-b from-purple-500/10 via-transparent to-transparent opacity-30" />

      <div className="grid grid-cols-3 gap-2 lg:gap-4 relative">
        {/* Secondo posto */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-col items-center text-center pt-6"
        >
          <div className="relative mb-2">
            <div className="absolute inset-0 bg-gradient-to-b from-slate-300/20 to-transparent rounded-full blur-md -z-10" />
            <Avatar className="w-16 h-16 lg:w-20 lg:h-20 ring-2 ring-slate-300 ring-offset-2 ring-offset-black/50">
              <img src={players[1].avatar} alt={players[1].name} className="object-cover" />
            </Avatar>
            <div className="absolute -bottom-2 right-0">
              <UserRankBadge rank={2} size="md" animate />
            </div>
          </div>
          
          <h3 className="text-slate-200 font-bold text-sm mt-2 truncate max-w-full">{players[1].name}</h3>
          <p className="text-slate-300 text-xs">{players[1].points} pts</p>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleInvite(players[1])}
            className="mt-1 text-xs h-6 px-2 text-slate-300 hover:text-slate-100"
          >
            Invita
          </Button>
        </motion.div>

        {/* Primo posto */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center text-center -mt-4"
        >
          <div className="relative">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 -translate-y-full">
              <Trophy className="h-8 w-8 text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.7)]" />
            </div>
            <div className="absolute -inset-2 bg-gradient-to-b from-yellow-400/30 to-transparent rounded-full blur-md -z-10" />
            <Avatar className="w-20 h-20 lg:w-24 lg:h-24 ring-2 ring-yellow-400 ring-offset-2 ring-offset-black/50">
              <img src={players[0].avatar} alt={players[0].name} className="object-cover" />
            </Avatar>
            <div className="absolute -bottom-2 right-0">
              <UserRankBadge rank={1} size="lg" animate />
            </div>
          </div>
          
          <h3 className="text-yellow-400 font-bold mt-2 truncate max-w-full">{players[0].name}</h3>
          <p className="text-yellow-500 text-sm font-mono">{players[0].points} pts</p>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleInvite(players[0])}
            className="mt-2 border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10"
          >
            Invita
          </Button>
        </motion.div>

        {/* Terzo posto */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex flex-col items-center text-center pt-6"
        >
          <div className="relative mb-2">
            <div className="absolute inset-0 bg-gradient-to-b from-amber-700/20 to-transparent rounded-full blur-md -z-10" />
            <Avatar className="w-16 h-16 lg:w-20 lg:h-20 ring-2 ring-amber-700 ring-offset-2 ring-offset-black/50">
              <img src={players[2].avatar} alt={players[2].name} className="object-cover" />
            </Avatar>
            <div className="absolute -bottom-2 right-0">
              <UserRankBadge rank={3} size="md" animate />
            </div>
          </div>
          
          <h3 className="text-amber-200 font-bold text-sm mt-2 truncate max-w-full">{players[2].name}</h3>
          <p className="text-amber-300/80 text-xs">{players[2].points} pts</p>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleInvite(players[2])}
            className="mt-1 text-xs h-6 px-2 text-amber-300 hover:text-amber-200"
          >
            Invita
          </Button>
        </motion.div>
      </div>
      
      {/* Linea separatrice decorativa */}
      <div className="mt-6 horizontal-line"></div>
    </div>
  );
}
