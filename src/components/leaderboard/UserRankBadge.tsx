
import React from 'react';
import { Trophy, Award, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UserRankBadgeProps {
  rank: number;
  size?: 'sm' | 'md' | 'lg';
  animate?: boolean;
}

export function UserRankBadge({ rank, size = 'md', animate = false }: UserRankBadgeProps) {
  const getBadgeColors = () => {
    if (rank === 1) return "bg-gradient-to-br from-yellow-400 to-amber-600 text-black";
    if (rank === 2) return "bg-gradient-to-br from-slate-300 to-slate-400 text-black";
    if (rank === 3) return "bg-gradient-to-br from-amber-700 to-amber-800 text-white";
    if (rank <= 5) return "bg-gradient-to-br from-cyan-400 to-blue-600 text-white";
    if (rank <= 10) return "bg-gradient-to-br from-violet-500 to-purple-700 text-white";
    return "bg-gradient-to-br from-gray-700 to-gray-900 text-white/90";
  };

  const getBadgeSize = () => {
    switch(size) {
      case 'sm': return 'w-6 h-6 text-xs';
      case 'lg': return 'w-10 h-10 text-base';
      default: return 'w-8 h-8 text-sm';
    }
  };

  const getBadgeIcon = () => {
    if (rank === 1) return <Trophy className="h-3 w-3" />;
    if (rank === 2) return <Award className="h-3 w-3" />;
    if (rank === 3) return <Award className="h-3 w-3" />;
    if (rank <= 10) return <Star className="h-3 w-3" />;
    return null;
  };
  
  const baseClasses = cn(
    'rounded-lg flex items-center justify-center font-bold shadow-lg',
    'border border-white/10',
    getBadgeSize(),
    getBadgeColors(),
    animate && rank <= 3 && 'animate-pulse shadow-[0_0_15px_rgba(0,255,255,0.5)]'
  );

  return (
    <div className={baseClasses}>
      {rank <= 10 ? getBadgeIcon() : rank}
    </div>
  );
}
