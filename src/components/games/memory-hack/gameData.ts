
import { LucideIcon, Zap, Wifi, Shield, Cpu, Database, Lock, Eye, Target } from 'lucide-react';

export interface GameCard {
  id: number;
  isFlipped: boolean;
  isMatched: boolean;
  value: string;
  icon: LucideIcon;
  symbol: string;
}

export type GameState = 'idle' | 'playing' | 'complete' | 'waiting' | 'completed' | 'failed';

export type GameType = 'memory-hack' | 'disarm-bomb' | 'flash-interrogation' | 'crack-combination' | 'satellite-tracking' | 'find-map-point';

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

export const gameData: Record<GameType, {
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
  icon: string;
}> = {
  'memory-hack': {
    title: 'Memory Hack',
    description: 'Trova tutte le coppie per hackerare il sistema',
    difficulty: 'easy',
    points: 100,
    icon: '🧠'
  },
  'disarm-bomb': {
    title: 'Disinnesca la Bomba',
    description: 'Taglia i fili nell\'ordine corretto',
    difficulty: 'hard',
    points: 200,
    icon: '💣'
  },
  'flash-interrogation': {
    title: 'Interrogatorio Flash',
    description: 'Rispondi rapidamente alle domande',
    difficulty: 'medium',
    points: 150,
    icon: '⚡'
  },
  'crack-combination': {
    title: 'Rompi la Combinazione',
    description: 'Trova la sequenza segreta',
    difficulty: 'medium',
    points: 150,
    icon: '🔓'
  },
  'satellite-tracking': {
    title: 'Tracciamento Satellitare',
    description: 'Localizza il segnale nemico',
    difficulty: 'hard',
    points: 200,
    icon: '🛰️'
  },
  'find-map-point': {
    title: 'Trova il Punto',
    description: 'Individua la posizione sulla mappa',
    difficulty: 'easy',
    points: 100,
    icon: '📍'
  }
};
