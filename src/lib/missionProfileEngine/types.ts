/**
 * MISSION PROFILE ENGINE™ / AGENT PERFORMANCE CALCULATOR™
 * UI-only types (fake report shape for future backend).
 * © 2025 Joseph MULÉ – M1SSION™ – NIYVORA KFT™
 */

export interface AgentPerformanceReport {
  percentage: number; // 5–95
  state: 'low' | 'medium' | 'high';
  stateLabelKey: string;
  strengths: string[];
  weaknesses: string[];
  priorityAction: {
    labelKey: string;
    expectedDeltaRange: [number, number];
    actionId: string;
  };
  dailyDelta: number;
  confidenceBand: 'low' | 'medium' | 'high';
  confidenceLabelKey: string;
  interferenceLineKey: string;
  /** Mini-bars 0..1 for Intelligence, Geo, Discipline, Operational */
  bars: {
    intelligence: number;
    geo: number;
    discipline: number;
    operational: number;
  };
}

export type ScanStepId =
  | 'reading_intel'
  | 'measuring_geo'
  | 'discipline_check'
  | 'operational_power'
  | 'stabilizing_signal';

export interface ScanStep {
  id: ScanStepId;
  labelKey: string;
  durationMs: number;
  completed: boolean;
}
