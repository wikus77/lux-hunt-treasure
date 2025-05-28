
import { LucideIcon, Zap, Wifi, Shield, Cpu, Database, Lock, Eye, Target } from 'lucide-react';

export interface GameCard {
  id: number;
  isFlipped: boolean;
  isMatched: boolean;
  value: string;
  icon: LucideIcon;
  symbol: string;
}

export const gameSymbols = [
  { value: 'power', icon: Zap, symbol: '⚡' },
  { value: 'network', icon: Wifi, symbol: '📡' },
  { value: 'security', icon: Shield, symbol: '🛡️' },
  { value: 'processor', icon: Cpu, symbol: '🔧' },
  { value: 'data', icon: Database, symbol: '💾' },
  { value: 'encrypted', icon: Lock, symbol: '🔒' },
  { value: 'vision', icon: Eye, symbol: '👁️' },
  { value: 'target', icon: Target, symbol: '🎯' }
];
