/**
 * © 2025 Joseph MULÉ – M1SSION™ – Neural Links Types
 */

export interface NeuralNode {
  id: string;
  position: [number, number, number];
  color: string;
  pairId: string; // Matching nodes share same pairId
}

export interface NeuralLink {
  id: string;
  from: string; // node id
  to: string; // node id
  color: string;
  points: Array<[number, number, number]>; // Bezier waypoints
}

export interface NeuralGameState {
  sessionId: string;
  seed: string;
  nodes: NeuralNode[];
  links: NeuralLink[];
  moves: number;
  startedAt: number;
  elapsedSeconds: number;
  solved: boolean;
}

export interface NeuralSession {
  id: string;
  user_id: string;
  seed: string;
  pairs_count: number;
  started_at: string;
  last_state: any;
  moves: number;
  elapsed_seconds: number;
  solved: boolean;
  solved_at?: string;
}

export const NEURAL_COLORS = [
  '#00d1ff', // cyan
  '#ff2768', // magenta
  '#00ff85', // lime
  '#ffd500', // amber
  '#8a5cff', // purple
  '#ff5800', // orange
  '#00a651', // green
  '#c41e3a', // red
  '#0051ba'  // blue
];

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
