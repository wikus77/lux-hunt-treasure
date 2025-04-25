
import React from 'react';
import { Trophy, Award, Star, Medal } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UserRankBadgeProps {
  rank: number;
  size?: 'sm' | 'md' | 'lg';
  animate?: boolean;
}

export function UserRankBadge({ rank, size = 'md', animate = false }: UserRankBadgeProps) {
  // Determine badge appearance based on rank
  const getBadgeColors = () => {
    if (rank === 1) return "bg-projectx-gold text-black";
    if (rank === 2) return "bg-slate-300 text-black";
    if (rank === 3) return "bg-amber-600 text-white";
    if (rank <= 5) return "bg-zinc-700 text-white";
    if (rank <= 10) return "bg-zinc-800 text-white";
    return "bg-black/50 border border-white/10 text-white/80";
  };

  const getBadgeSize = () => {
    switch(size) {
      case 'sm': return 'w-5 h-5 text-xs';
      case 'lg': return 'w-9 h-9 text-base';
      default: return 'w-7 h-7 text-sm';
    }
  };

  const getBadgeIcon = () => {
    if (rank === 1) return <Trophy className="h-3 w-3" />;
    if (rank === 2) return <Trophy className="h-3 w-3" />;
    if (rank === 3) return <Trophy className="h-3 w-3" />;
    if (rank <= 10) return <Star className="h-3 w-3" />;
    return null;
  };
  
  const baseClasses = cn(
    'rounded-full flex items-center justify-center font-bold',
    getBadgeSize(),
    getBadgeColors(),
    animate && rank <= 3 && 'ai-button-glow'
  );

  return (
    <div className={baseClasses}>
      {rank <= 10 ? getBadgeIcon() : rank}
    </div>
  );
}
