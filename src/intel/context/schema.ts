// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Norah Context - Type Definitions

export interface NorahClue {
  id: string;
  text: string;
  tag?: string;
  created_at: string;
}

export interface NorahMission {
  id: string;
  name: string;
  week: number;
}

export interface NorahStats {
  cluesTotal: number;
  recentCount: number;
  buzzToday: number;
}

export interface NorahPlan {
  tier: 'free' | 'silver' | 'gold' | 'black' | 'titanium';
}

export interface NorahContext {
  agentCode: string;
  displayName: string;
  mission: NorahMission | null;
  clues: NorahClue[];
  stats: NorahStats;
  plan: NorahPlan | null;
  updatedAt: number;
}

export interface NorahIntent {
  intent: string;
  slots: Record<string, any>;
  confidence: number;
}
