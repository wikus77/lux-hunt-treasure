
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Medal, Award, Crown } from "lucide-react";

interface LeaderboardEntry {
  rank: number;
  username: string;
  score: number;
  missions: number;
  isCurrentUser?: boolean;
}

const mockLeaderboardData: LeaderboardEntry[] = [
  { rank: 1, username: "AgentRoma", score: 15420, missions: 12 },
  { rank: 2, username: "ColosseumHunter", score: 14350, missions: 11 },
  { rank: 3, username: "VaticanExplorer", score: 13180, missions: 10 },
  { rank: 4, username: "TevereSeeker", score: 12890, missions: 9 },
  { rank: 5, username: "ForumMaster", score: 11750, missions: 8 },
  { rank: 6, username: "TU", score: 8420, missions: 6, isCurrentUser: true },
  { rank: 7, username: "PantheonFinder", score: 7950, missions: 5 },
  { rank: 8, username: "RomanLegend", score: 6830, missions: 4 },
  { rank: 9, username: "EternalSeeker", score: 5640, missions: 3 },
  { rank: 10, username: "MissionRookie", score: 3210, missions: 2 }
];

const UserLeaderboard: React.FC = () => {
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className="w-5 h-5 text-yellow-400" />;
      case 2: return <Trophy className="w-5 h-5 text-gray-300" />;
      case 3: return <Medal className="w-5 h-5 text-amber-600" />;
      default: return <Award className="w-4 h-4 text-gray-500" />;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return 'bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 border-yellow-400';
      case 2: return 'bg-gradient-to-r from-gray-400/20 to-gray-500/20 border-gray-300';
      case 3: return 'bg-gradient-to-r from-amber-500/20 to-amber-600/20 border-amber-600';
      default: return 'bg-gray-800/50 border-gray-700';
    }
  };

  return (
    <Card className="bg-gray-900/50 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-400" />
          Classifica Settimanale
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {mockLeaderboardData.map((entry) => (
            <div
              key={entry.rank}
              className={`
                flex items-center justify-between p-3 rounded-lg border transition-all duration-200
                ${entry.isCurrentUser 
                  ? 'bg-blue-900/30 border-blue-400 ring-1 ring-blue-400' 
                  : getRankColor(entry.rank)
                }
                ${entry.rank <= 3 ? 'hover:scale-[1.02]' : ''}
              `}
            >
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  {getRankIcon(entry.rank)}
                  <span className={`font-bold ${entry.rank <= 3 ? 'text-lg' : 'text-sm'}`}>
                    #{entry.rank}
                  </span>
                </div>
                <div>
                  <div className={`font-medium ${entry.isCurrentUser ? 'text-blue-300' : 'text-white'}`}>
                    {entry.username}
                    {entry.isCurrentUser && (
                      <span className="ml-2 text-xs bg-blue-500 px-2 py-1 rounded-full">TU</span>
                    )}
                  </div>
                  <div className="text-xs text-gray-400">
                    {entry.missions} missioni completate
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className={`font-bold ${entry.rank <= 3 ? 'text-lg' : 'text-sm'} ${
                  entry.rank === 1 ? 'text-yellow-400' :
                  entry.rank === 2 ? 'text-gray-300' :
                  entry.rank === 3 ? 'text-amber-600' :
                  entry.isCurrentUser ? 'text-blue-300' : 'text-white'
                }`}>
                  {entry.score.toLocaleString()}
                </div>
                <div className="text-xs text-gray-400">punti</div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 p-3 bg-gray-800/50 rounded-lg border border-gray-600">
          <div className="text-sm text-gray-400 text-center">
            La classifica si aggiorna ogni settimana
          </div>
          <div className="text-xs text-gray-500 text-center mt-1">
            Completa più missioni per scalare la classifica!
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserLeaderboard;
