/**
 * TRON BATTLE - Push Notifications Integration
 * Usa battle-push-send edge function (non richiede admin token)
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import { supabase } from '@/integrations/supabase/client';

export interface BattleInvitePayload {
  type: 'battle_invite';
  battle_id: string;
  opponent_name: string;
  opponent_agent_code: string;
  attacker_weapon_power: number;
  stake_type: string;
  stake_amount: number;
  arena_name?: string;
}

/**
 * Send battle invite push notification to opponent
 * Usa battle-push-send edge function (verifica JWT, non richiede admin token)
 */
export async function sendBattleInvite(
  opponentId: string,
  battleId: string,
  creatorName: string,
  creatorAgentCode: string,
  stakeType: string,
  stakeAmount: number,
  arenaName?: string,
  attackerWeaponPower: number = 0
): Promise<{ success: boolean; error?: string; sent?: number; details?: any }> {
  try {
    console.log('📤 [BattlePush] Sending push to:', opponentId);

    // Call battle-push-send edge function (no admin token required)
    const { data, error } = await supabase.functions.invoke('battle-push-send', {
      body: {
        defender_id: opponentId,
        battle_id: battleId,
        attacker_agent_code: creatorAgentCode,
        attacker_weapon_power: attackerWeaponPower,
        stake_type: stakeType,
        stake_amount: stakeAmount,
        arena_name: arenaName,
      },
    });

    if (error) {
      console.error('❌ [BattlePush] Edge function error:', error);
      return { success: false, error: error.message, details: error };
    }

    console.log('✅ [BattlePush] Response:', data);

    if (data?.success && data?.sent > 0) {
      console.log(`✅ [BattlePush] Successfully sent ${data.sent} notification(s)`);
      return { success: true, sent: data.sent, details: data };
    } else if (data?.sent === 0) {
      console.warn('⚠️ [BattlePush] No active subscriptions for defender');
      return { 
        success: false, 
        error: 'L\'avversario non ha notifiche push attive',
        sent: 0,
        details: data 
      };
    } else {
      console.warn('⚠️ [BattlePush] Send failed:', data);
      return { 
        success: false, 
        error: data?.message || 'Invio fallito',
        details: data 
      };
    }
  } catch (error: any) {
    console.error('❌ [BattlePush] Exception:', error);
    return { success: false, error: error.message || 'Unknown error' };
  }
}

/**
 * Handle battle invite notification click (for service worker)
 */
export function handleBattleInviteClick(data: BattleInvitePayload): string {
  return `/map-3d-tiler?battle=${data.battle_id}`;
}

/**
 * Check if a user has active push subscriptions
 * Returns true if user can receive push notifications
 */
export async function checkUserHasPushSubscription(userId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('webpush_subscriptions')
      .select('id')
      .eq('user_id', userId)
      .eq('is_active', true)
      .limit(1);
    
    if (error) {
      console.error('[BattlePush] Check subscription error:', error);
      return false;
    }
    
    return (data && data.length > 0);
  } catch (err) {
    console.error('[BattlePush] Check subscription exception:', err);
    return false;
  }
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
