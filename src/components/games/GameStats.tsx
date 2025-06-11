
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Target, Clock, Star } from "lucide-react";

interface GameStatsProps {
  totalGamesPlayed: number;
  totalScore: number;
  bestScore: number;
  averageTime: number;
  completionRate: number;
}

const GameStats: React.FC<GameStatsProps> = ({
  totalGamesPlayed,
  totalScore,
  bestScore,
  averageTime,
  completionRate
}) => {
  const stats = [
    {
      label: 'Partite Totali',
      value: totalGamesPlayed,
      icon: Target,
      color: 'text-blue-400'
    },
    {
      label: 'Punteggio Totale',
      value: totalScore.toLocaleString(),
      icon: Star,
      color: 'text-yellow-400'
    },
    {
      label: 'Record Personale',
      value: bestScore.toLocaleString(),
      icon: Trophy,
      color: 'text-green-400'
    },
    {
      label: 'Tempo Medio',
      value: `${averageTime}s`,
      icon: Clock,
      color: 'text-purple-400'
    }
  ];

  return (
    <Card className="bg-gray-900/50 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-400" />
          Statistiche Giochi
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 mb-4">
          {stats.map((stat, index) => (
            <div key={index} className="bg-gray-800/50 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
                <span className="text-xs text-gray-400">{stat.label}</span>
              </div>
              <div className={`text-lg font-bold ${stat.color}`}>
                {stat.value}
              </div>
            </div>
          ))}
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Tasso di Completamento</span>
            <span className="text-white">{completionRate}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-green-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${completionRate}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default GameStats;
