
import { Brain, Shield, Zap, Eye, Target, Lock, Star, Cpu } from 'lucide-react';

export interface GameIconData {
  type: string;
  icon: React.ReactNode;
}

export const gameIconsData: GameIconData[] = [
  { type: 'brain', icon: <Brain className="w-6 h-6 text-[#00D1FF]" /> },
  { type: 'shield', icon: <Shield className="w-6 h-6 text-[#00D1FF]" /> },
  { type: 'zap', icon: <Zap className="w-6 h-6 text-[#00D1FF]" /> },
  { type: 'eye', icon: <Eye className="w-6 h-6 text-[#00D1FF]" /> },
  { type: 'target', icon: <Target className="w-6 h-6 text-[#00D1FF]" /> },
  { type: 'lock', icon: <Lock className="w-6 h-6 text-[#00D1FF]" /> },
  { type: 'star', icon: <Star className="w-6 h-6 text-[#00D1FF]" /> },
  { type: 'cpu', icon: <Cpu className="w-6 h-6 text-[#00D1FF]" /> }
];

export interface GameCard {
  id: number;
  iconType: string;
  icon: React.ReactNode;
  isFlipped: boolean;
  isMatched: boolean;
}

export type GameState = 'waiting' | 'playing' | 'completed' | 'failed';
