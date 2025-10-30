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

// Exact palette from reference image
export const NEURON_CORE_COLOR = '#ffb23a'; // Orange/gold core
export const NEURON_HALO_COLOR = '#ffa06a'; // Hot halo
export const NEURON_HIGHLIGHT_COLOR = '#ffd37a'; // Highlight

export const NEURAL_COLORS = [
  '#5ad1ff', // Cyan filament
  '#2fc5ff', // Bright cyan
  '#2a51ff', // Blue filament
  '#ff4bd1', // Magenta hot
  '#8f6bff', // Purple filament
  '#ff77b4', // Pink filament
];

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
