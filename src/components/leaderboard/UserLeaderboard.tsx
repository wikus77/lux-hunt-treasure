
import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Medal, Award, Crown, Star, Zap } from "lucide-react";

interface LeaderboardEntry {
  rank: number;
  username: string;
  score: number;
  missions: number;
  isCurrentUser?: boolean;
}

const mockLeaderboardData: LeaderboardEntry[] = [
  { rank: 1, username: "AgentRoma", score: 18420, missions: 15 },
  { rank: 2, username: "ColosseumHunter", score: 16350, missions: 13 },
  { rank: 3, username: "VaticanExplorer", score: 14180, missions: 12 },
  { rank: 4, username: "TevereSeeker", score: 12890, missions: 11 },
  { rank: 5, username: "ForumMaster", score: 11750, missions: 10 },
  { rank: 6, username: "TU", score: 9420, missions: 8, isCurrentUser: true },
  { rank: 7, username: "PantheonFinder", score: 8950, missions: 7 },
  { rank: 8, username: "RomanLegend", score: 7830, missions: 6 },
  { rank: 9, username: "EternalSeeker", score: 6640, missions: 5 },
  { rank: 10, username: "MissionRookie", score: 4210, missions: 3 }
];

const UserLeaderboard: React.FC = () => {
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className="w-6 h-6 text-yellow-400" />;
      case 2: return <Trophy className="w-6 h-6 text-gray-300" />;
      case 3: return <Medal className="w-6 h-6 text-amber-600" />;
      default: return <Award className="w-5 h-5 text-gray-500" />;
    }
  };

  const getRankColor = (rank: number, isCurrentUser: boolean = false) => {
    if (isCurrentUser) {
      return 'bg-gradient-to-r from-blue-900/40 to-cyan-900/40 border-blue-400 shadow-lg shadow-blue-400/20';
    }
    
    switch (rank) {
      case 1: return 'bg-gradient-to-r from-yellow-500/20 to-yellow-600/30 border-yellow-400 shadow-lg shadow-yellow-400/20';
      case 2: return 'bg-gradient-to-r from-gray-400/20 to-gray-500/30 border-gray-300 shadow-lg shadow-gray-300/20';
      case 3: return 'bg-gradient-to-r from-amber-500/20 to-amber-600/30 border-amber-600 shadow-lg shadow-amber-600/20';
      default: return 'bg-gradient-to-r from-gray-800/50 to-gray-900/50 border-gray-700/50 hover:border-gray-600/70';
    }
  };

  const getTextColor = (rank: number, isCurrentUser: boolean = false) => {
    if (isCurrentUser) return 'text-blue-300';
    
    switch (rank) {
      case 1: return 'text-yellow-400';
      case 2: return 'text-gray-300';
      case 3: return 'text-amber-600';
      default: return 'text-white';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Card className="bg-gradient-to-b from-gray-900/80 to-black/90 border-gray-700/50 backdrop-blur-sm shadow-2xl">
        <CardHeader className="pb-4">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <CardTitle className="text-white flex items-center gap-3 text-xl">
              <motion.div
                animate={{ 
                  rotate: [0, 10, -10, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 3
                }}
              >
                <Trophy className="w-6 h-6 text-yellow-400" />
              </motion.div>
              <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent font-orbitron">
                Classifica Settimanale
              </span>
              <Zap className="w-5 h-5 text-cyan-400" />
            </CardTitle>
          </motion.div>
        </CardHeader>
        
        <CardContent className="space-y-3">
          {mockLeaderboardData.map((entry, index) => (
            <motion.div
              key={entry.rank}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05, duration: 0.4 }}
              className={`
                flex items-center justify-between p-4 rounded-xl border transition-all duration-300
                ${getRankColor(entry.rank, entry.isCurrentUser)}
                ${entry.rank <= 3 ? 'hover:scale-[1.02] transform-gpu' : 'hover:bg-gray-800/60'}
                ${entry.isCurrentUser ? 'ring-2 ring-blue-400/50 ring-opacity-50' : ''}
              `}
              whileHover={{ 
                scale: entry.rank <= 3 ? 1.02 : 1.01,
                transition: { duration: 0.2 }
              }}
            >
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                  <motion.div
                    animate={entry.rank <= 3 ? {
                      scale: [1, 1.1, 1],
                      rotate: entry.rank === 1 ? [0, 5, -5, 0] : 0
                    } : {}}
                    transition={{ 
                      duration: 2,
                      repeat: Infinity,
                      repeatDelay: 4
                    }}
                  >
                    {getRankIcon(entry.rank)}
                  </motion.div>
                  
                  <span className={`font-bold text-lg ${
                    entry.rank <= 3 ? 'text-xl' : 'text-base'
                  }`}>
                    #{entry.rank}
                  </span>
                </div>
                
                <div className="flex flex-col">
                  <div className={`font-semibold flex items-center gap-2 ${getTextColor(entry.rank, entry.isCurrentUser)}`}>
                    {entry.username}
                    {entry.isCurrentUser && (
                      <motion.span 
                        className="text-xs bg-blue-500 px-2 py-1 rounded-full font-bold"
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        TU
                      </motion.span>
                    )}
                    {entry.rank <= 3 && (
                      <motion.div
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      </motion.div>
                    )}
                  </div>
                  
                  <div className="text-xs text-gray-400 flex items-center gap-1">
                    <Medal className="w-3 h-3" />
                    {entry.missions} missioni completate
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <motion.div 
                  className={`font-bold ${
                    entry.rank <= 3 ? 'text-xl' : 'text-base'
                  } ${getTextColor(entry.rank, entry.isCurrentUser)}`}
                  animate={entry.rank <= 3 ? {
                    scale: [1, 1.05, 1]
                  } : {}}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    repeatDelay: 3
                  }}
                >
                  {entry.score.toLocaleString()}
                </motion.div>
                <div className="text-xs text-gray-400">punti</div>
              </div>
            </motion.div>
          ))}
          
          <motion.div 
            className="mt-6 p-4 bg-gradient-to-r from-gray-800/50 to-gray-900/50 rounded-xl border border-gray-600/50"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
          >
            <div className="text-sm text-gray-400 text-center mb-2">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Zap className="w-4 h-4 text-cyan-400" />
                <span>La classifica si aggiorna ogni settimana</span>
                <Zap className="w-4 h-4 text-cyan-400" />
              </div>
            </div>
            <div className="text-xs text-gray-500 text-center">
              Completa più missioni per scalare la classifica!
            </div>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default UserLeaderboard;
