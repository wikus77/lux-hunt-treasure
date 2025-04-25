import React, { useState } from 'react';
import { UserRankBadge } from './UserRankBadge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, TrendingUp, TrendingDown, Users, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { 
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import BriefProfileModal from '@/components/profile/BriefProfileModal';

interface PlayerCardProps {
  player: {
    id: number;
    name: string;
    avatar: string;
    points: number;
    rank: number;
    cluesFound: number;
    areasExplored: number;
    team: string | null;
    country: string;
    badges: string[];
    dailyChange: number;
  };
  onInvite?: (player: any) => void;
  onCreateTeam?: (player: any) => void;
}

export function PlayerCard({ player, onInvite, onCreateTeam }: PlayerCardProps) {
  const isTopPlayer = player.rank <= 10;
  const [showProfile, setShowProfile] = useState(false);
  
  const getBadgeElement = (badge: string) => {
    switch (badge) {
      case 'top10':
        return (
          <Badge 
            key={badge} 
            className="bg-gradient-to-r from-yellow-400/20 to-orange-500/20 text-yellow-300 border border-yellow-500/30"
          >
            TOP 10
          </Badge>
        );
      case 'explorer':
        return (
          <Badge 
            key={badge} 
            className="bg-gradient-to-r from-cyan-400/20 to-blue-500/20 text-cyan-300 border border-cyan-500/30"
          >
            EXPLORER
          </Badge>
        );
      case 'active':
        return (
          <Badge 
            key={badge} 
            className="bg-gradient-to-r from-green-400/20 to-emerald-500/20 text-green-300 border border-green-500/30"
          >
            ATTIVO
          </Badge>
        );
      default:
        return null;
    }
  };
  
  return (
    <motion.div 
      className="relative group"
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.2 }}
    >
      <div className={`glass-card mb-2 overflow-hidden relative transition-all duration-300
                    border ${isTopPlayer ? 'border-cyan-500/50 hover:border-cyan-400/70' : 'border-white/10 hover:border-white/20'} 
                    ${player.rank <= 10 ? 'group-hover:shadow-[0_0_20px_rgba(0,255,255,0.2)]' : ''}`}>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent 
                      translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"/>
        <div className="flex items-center gap-4 p-4">
          <div className="relative cursor-pointer" onClick={() => setShowProfile(true)}>
            <Avatar className={`w-12 h-12 ${player.rank <= 3 
              ? 'ring-2 ring-offset-2 ring-offset-black/50' 
              : 'ring-1 ring-white/10'} ${
              player.rank === 1 
                ? 'ring-yellow-400' 
                : player.rank === 2 
                ? 'ring-slate-300' 
                : player.rank === 3 
                ? 'ring-amber-700'
                : ''
            }`}>
              <AvatarImage src={player.avatar} alt={player.name} className="object-cover" />
              <AvatarFallback>{player.name.charAt(0)}</AvatarFallback>
            </Avatar>
            
            <div className="absolute -bottom-1 -right-1">
              <UserRankBadge rank={player.rank} size="sm" animate={player.rank <= 3} />
            </div>
            
            {player.dailyChange !== 0 && (
              <div className={`absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs
                ${player.dailyChange > 0 
                  ? 'bg-green-900/80 text-green-400' 
                  : 'bg-red-900/80 text-red-400'}`}>
                {player.dailyChange > 0 
                  ? <TrendingUp className="h-3 w-3" /> 
                  : <TrendingDown className="h-3 w-3" />}
              </div>
            )}
          </div>

          <div className="flex-1">
            <div className="flex items-center justify-between flex-wrap gap-y-1">
              <div className="flex items-center gap-2">
                <h3 className={`text-lg font-bold cursor-pointer hover:text-cyan-400 transition-colors ${
                  player.rank <= 3 ? 'text-cyan-400' : 'text-white'
                }`} onClick={() => setShowProfile(true)}>{player.name}</h3>
                <span className="text-xs">{player.country}</span>
              </div>
              <span className={`text-purple-400 font-mono ${
                player.rank <= 3 ? 'text-yellow-400' : ''
              }`}>
                PTS {player.points.toLocaleString()}
              </span>
            </div>
            
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
              <span className="text-xs text-gray-400">{player.cluesFound} indizi</span>
              <span className="text-xs text-gray-400">{player.areasExplored} aree</span>
              {player.team && (
                <span className="text-xs text-cyan-400/80 flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {player.team}
                </span>
              )}
            </div>
            
            {player.badges.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {player.badges.map(badge => getBadgeElement(badge))}
              </div>
            )}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="text-white/70 hover:text-white">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-black/90 border-white/10">
              <DropdownMenuItem 
                className="hover:bg-white/10 cursor-pointer"
                onClick={() => setShowProfile(true)}
              >
                <Users className="h-4 w-4 mr-2" />
                Esplora profilo
              </DropdownMenuItem>
              
              <DropdownMenuSeparator className="bg-white/10" />
              
              <DropdownMenuItem 
                className="hover:bg-white/10 cursor-pointer"
                onClick={() => onInvite?.(player)}
              >
                <Users className="h-4 w-4 mr-2" />
                Invita alla tua squadra
              </DropdownMenuItem>
              
              <DropdownMenuItem 
                className="hover:bg-white/10 cursor-pointer"
                onClick={() => onCreateTeam?.(player)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Crea nuova squadra
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <BriefProfileModal
        open={showProfile}
        onClose={() => setShowProfile(false)}
        profileImage={player.avatar}
      />
    </motion.div>
  );
}
