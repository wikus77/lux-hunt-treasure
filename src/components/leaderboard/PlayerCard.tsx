
import React from 'react';
import { UserRankBadge } from './UserRankBadge';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

interface PlayerCardProps {
  rank: number;
  name: string;
  avatar: string;
  points: number;
  onInvite?: () => void;
}

export function PlayerCard({ rank, name, avatar, points, onInvite }: PlayerCardProps) {
  return (
    <div className="relative group">
      <div className="glass-card mb-2 overflow-hidden relative transition-all duration-300
                    border border-white/10 hover:border-cyan-500/50 group-hover:shadow-[0_0_20px_rgba(0,255,255,0.2)]">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent 
                      translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"/>
        <div className="flex items-center gap-4 p-4">
          <div className="relative">
            <Avatar className="w-12 h-12 ring-2 ring-white/10 ring-offset-2 ring-offset-black/50">
              <img src={avatar} alt={name} className="object-cover" />
            </Avatar>
            <div className="absolute -bottom-1 -right-1">
              <UserRankBadge rank={rank} size="sm" animate />
            </div>
          </div>

          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-cyan-400">{name}</h3>
              <span className="text-purple-400 font-mono">PTS {points}</span>
            </div>
          </div>

          {onInvite && (
            <Button 
              variant="outline"
              className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-cyan-500/50
                       hover:border-cyan-400 hover:from-blue-500/20 hover:to-purple-500/20
                       hover:shadow-[0_0_15px_rgba(0,255,255,0.3)]"
              onClick={onInvite}
            >
              INVITE
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
