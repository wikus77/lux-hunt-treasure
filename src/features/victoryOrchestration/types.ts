/**
 * Victory / Reward Orchestration V1 — normalized moment model (daily pilot)
 */

export type VictoryTier = 'SMALL' | 'MEDIUM' | 'MAJOR' | 'STATUS' | 'CLOSURE';

export type VictorySource =
  | 'daily_m1u'
  | 'daily_pe'
  | 'daily_sequence';

/** Priority: higher runs first when dequeuing (STATUS > MAJOR > CLOSURE > MEDIUM > SMALL). */
export const TIER_PRIORITY: Record<VictoryTier, number> = {
  STATUS: 100,
  MAJOR: 80,
  CLOSURE: 60,
  MEDIUM: 40,
  SMALL: 20,
};

export interface RewardMoment {
  id: string;
  correlationId: string;
  source: VictorySource;
  tier: VictoryTier;
  priority: number;
  timestamp: number;
  blocking: boolean;
  monetizationEligible?: boolean;
  supersedes?: string[];
}
