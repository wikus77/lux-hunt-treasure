
import { Brain, Shield, Zap, Eye, Target, Lock, Star, Cpu } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface GameIconData {
  type: string;
  icon: LucideIcon;
}

export const gameIconsData: GameIconData[] = [
  { type: 'brain', icon: Brain },
  { type: 'shield', icon: Shield },
  { type: 'zap', icon: Zap },
  { type: 'eye', icon: Eye },
  { type: 'target', icon: Target },
  { type: 'lock', icon: Lock },
  { type: 'star', icon: Star },
  { type: 'cpu', icon: Cpu }
];

export interface GameCard {
  id: number;
  iconType: string;
  icon: LucideIcon;
  isFlipped: boolean;
  isMatched: boolean;
}

export type GameState = 'waiting' | 'playing' | 'completed' | 'failed';
