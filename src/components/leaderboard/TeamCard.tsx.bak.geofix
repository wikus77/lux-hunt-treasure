
import React from 'react';
import { motion } from 'framer-motion';
import { Users, Trophy, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface TeamCardProps {
  team: {
    id: number;
    name: string;
    members: number;
    totalPoints: number;
    rank: number;
    badges: string[];
  };
}

export function TeamCard({ team }: TeamCardProps) {
  const isTopTeam = team.rank <= 3;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="group"
    >
      <Card className={`relative overflow-hidden ${
        isTopTeam ? 'border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.3)]' : 'border-white/10'
      }`}>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent 
                      translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"/>
        
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`flex items-center justify-center w-12 h-12 rounded-full ${
                team.rank === 1 
                ? 'bg-gradient-to-br from-yellow-400 to-amber-600'
                : team.rank === 2
                ? 'bg-gradient-to-br from-slate-300 to-slate-400'
                : team.rank === 3
                ? 'bg-gradient-to-br from-amber-700 to-amber-800' 
                : 'bg-gradient-to-br from-purple-500/30 to-purple-700/30'
              }`}>
                {team.rank <= 3 
                  ? <Trophy className="h-6 w-6 text-black" /> 
                  : <Users className="h-6 w-6 text-white" />}
              </div>

              <div className="flex-1">
                <div className="flex items-center">
                  <h3 className="text-lg font-bold text-white/90">{team.name}</h3>
                  {team.badges.includes('top') && (
                    <Badge className="ml-2 bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      TOP TEAM
                    </Badge>
                  )}
                </div>
                <div className="text-sm text-gray-400">
                  <div className="flex items-center gap-1">
                    <span>{team.members} membri</span>
                    <span className="mx-1">•</span>
                    <span className="text-purple-400 font-mono">{team.totalPoints.toLocaleString()} PTS</span>
                  </div>
                </div>

                <div className="mt-3">
                  <Progress value={(100 - (team.rank - 1) * 20)} className="h-1.5 bg-gray-900/50">
                    <div 
                      className={`h-full rounded-full ${
                        team.rank === 1 
                        ? 'bg-gradient-to-r from-yellow-400 to-amber-500'
                        : team.rank <= 3
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500'
                        : 'bg-gradient-to-r from-blue-500 to-cyan-500'
                      }`}
                      style={{ width: `${(100 - (team.rank - 1) * 20)}%` }}
                    />
                  </Progress>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-end">
              <span className="text-xl font-bold">#{team.rank}</span>
              <Button variant="ghost" size="sm" className="text-cyan-400 p-0 h-auto hover:bg-transparent hover:text-cyan-300">
                <span className="mr-1 text-sm">Dettagli</span>
                <ArrowRight className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
