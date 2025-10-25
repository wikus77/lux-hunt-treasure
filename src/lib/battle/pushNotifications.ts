/**
 * TRON BATTLE - Push Notifications Integration
 * Extends existing push system with battle_invite type
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import { supabase } from '@/integrations/supabase/client';

export interface BattleInvitePayload {
  type: 'battle_invite';
  battle_id: string;
  opponent_name: string;
  opponent_agent_code: string;
  stake_type: string;
  stake_amount: number;
  arena_name?: string;
}

/**
 * Send battle invite push notification to opponent
 * Uses existing push infrastructure (no modifications to core system)
 */
export async function sendBattleInvite(
  opponentId: string,
  battleId: string,
  creatorName: string,
  creatorAgentCode: string,
  stakeType: string,
  stakeAmount: number,
  arenaName?: string
): Promise<void> {
  try {
    const payload: BattleInvitePayload = {
      type: 'battle_invite',
      battle_id: battleId,
      opponent_name: creatorName,
      opponent_agent_code: creatorAgentCode,
      stake_type: stakeType,
      stake_amount: stakeAmount,
      arena_name: arenaName,
    };

    // Use existing push notification function
    const { error } = await supabase.functions.invoke('webpush-targeted-send', {
      body: {
        user_ids: [opponentId],
        title: '⚔️ TRON Battle Challenge!',
        body: `${creatorAgentCode} challenges you to battle!`,
        data: payload,
        url: `/battle/${battleId}`,
      },
    });

    if (error) {
      console.error('Failed to send battle invite:', error);
    } else {
      console.log(`✅ Battle invite sent to ${opponentId}`);
    }
  } catch (error) {
    console.error('Battle invite error:', error);
  }
}

/**
 * Handle battle invite notification click (for service worker)
 * Add this handler to existing SW notification click logic
 */
export function handleBattleInviteClick(data: BattleInvitePayload): string {
  return `/battle/${data.battle_id}`;
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
