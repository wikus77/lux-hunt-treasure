/**
 * Battle Defense Notification Hook
 * Listens for incoming battle attack notifications and manages defense modal
 * Also handles URL parameter ?battle=xxx when user clicks push notification
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface IncomingBattle {
  battleId: string;
  attackerName: string;
  attackerAgentCode: string;
  attackerWeaponPower: number;
  stakeAmount: number;
  stakeType: string;
  arenaName?: string;
}

// Global event for battle defense notification
export const BATTLE_DEFENSE_EVENT = 'battle-defense-incoming';

/**
 * Dispatch battle defense event (called from service worker notification click)
 */
export function dispatchBattleDefenseEvent(battle: IncomingBattle) {
  const event = new CustomEvent(BATTLE_DEFENSE_EVENT, { detail: battle });
  window.dispatchEvent(event);
}

/**
 * Hook to listen for incoming battle attacks
 */
export function useBattleDefenseNotification(userId: string | null) {
  const [incomingBattle, setIncomingBattle] = useState<IncomingBattle | null>(null);
  const [showDefenseModal, setShowDefenseModal] = useState(false);

  // Listen for battle defense events
  useEffect(() => {
    const handleBattleDefense = (event: CustomEvent<IncomingBattle>) => {
      console.log('⚔️ [BattleDefense] Incoming battle:', event.detail);
      setIncomingBattle(event.detail);
      setShowDefenseModal(true);
    };

    window.addEventListener(BATTLE_DEFENSE_EVENT, handleBattleDefense as EventListener);

    return () => {
      window.removeEventListener(BATTLE_DEFENSE_EVENT, handleBattleDefense as EventListener);
    };
  }, []);

  // 🆕 Check URL for ?battle=xxx parameter (when user clicks push notification)
  useEffect(() => {
    if (!userId) return;

    const checkUrlForBattle = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const battleId = urlParams.get('battle');
      
      if (!battleId) return;
      
      console.log('⚔️ [BattleDefense] Found battle ID in URL:', battleId);
      
      // Clear the battle parameter from URL (to prevent re-triggering)
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete('battle');
      window.history.replaceState({}, '', newUrl.toString());
      
      try {
        // Fetch battle details from database
        const { data: battle, error } = await supabase
          .from('battle_sessions')
          .select(`
            id,
            creator_id,
            defender_id,
            stake_amount,
            stake_type,
            arena_name,
            attacker_weapon_power,
            status
          `)
          .eq('id', battleId)
          .single();
        
        if (error) {
          console.error('[BattleDefense] Fetch battle error:', error);
          return;
        }
        
        // Verify this user is the defender
        if (battle.defender_id !== userId) {
          console.log('[BattleDefense] User is not the defender, ignoring');
          return;
        }
        
        // Check if battle is still pending
        if (battle.status !== 'pending' && battle.status !== 'await_defense') {
          console.log('[BattleDefense] Battle already resolved:', battle.status);
          return;
        }
        
        // Get attacker info
        const { data: attackerProfile } = await supabase
          .from('profiles')
          .select('username, agent_code')
          .eq('id', battle.creator_id)
          .single();
        
        const incomingBattle: IncomingBattle = {
          battleId: battle.id,
          attackerName: attackerProfile?.username || 'Unknown',
          attackerAgentCode: attackerProfile?.agent_code || attackerProfile?.username || 'Unknown',
          attackerWeaponPower: battle.attacker_weapon_power || 0,
          stakeAmount: battle.stake_amount || 50,
          stakeType: battle.stake_type || 'PE',
          arenaName: battle.arena_name,
        };
        
        console.log('⚔️ [BattleDefense] Opening defense modal from URL:', incomingBattle);
        setIncomingBattle(incomingBattle);
        setShowDefenseModal(true);
        
      } catch (err) {
        console.error('[BattleDefense] URL battle check error:', err);
      }
    };
    
    // Check immediately and also when URL changes
    checkUrlForBattle();
    
    // Also listen for popstate (back/forward navigation)
    window.addEventListener('popstate', checkUrlForBattle);
    
    return () => {
      window.removeEventListener('popstate', checkUrlForBattle);
    };
  }, [userId]);

  // Also listen for realtime battle_sessions updates (in case user is online)
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`battle-defense-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'battle_sessions',
          filter: `defender_id=eq.${userId}`,
        },
        async (payload: any) => {
          const newBattle = payload.new;
          
          if (newBattle.status === 'pending' || newBattle.status === 'await_defense') {
            // Get attacker info
            const { data: attackerProfile } = await supabase
              .from('profiles')
              .select('username, agent_code')
              .eq('id', newBattle.creator_id)
              .single();

            const battle: IncomingBattle = {
              battleId: newBattle.id,
              attackerName: attackerProfile?.username || 'Unknown',
              attackerAgentCode: attackerProfile?.agent_code || attackerProfile?.username || 'Unknown',
              attackerWeaponPower: newBattle.attacker_weapon_power || 0,
              stakeAmount: newBattle.stake_amount || 50,
              stakeType: newBattle.stake_type || 'PE',
              arenaName: newBattle.arena_name,
            };

            console.log('⚔️ [BattleDefense] Realtime incoming battle:', battle);
            setIncomingBattle(battle);
            setShowDefenseModal(true);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  // Check for pending battles on mount
  useEffect(() => {
    if (!userId) return;

    const checkPendingBattles = async () => {
      try {
        const { data: pendingBattles, error } = await supabase
          .from('battle_sessions')
          .select(`
            id,
            creator_id,
            stake_amount,
            stake_type,
            arena_name,
            attacker_weapon_power,
            status
          `)
          .eq('defender_id', userId)
          .in('status', ['pending', 'await_defense'])
          .order('created_at', { ascending: false })
          .limit(1);

        if (error) {
          console.error('[BattleDefense] Check pending error:', error);
          return;
        }

        if (pendingBattles && pendingBattles.length > 0) {
          const battle = pendingBattles[0];
          
          // Get attacker info
          const { data: attackerProfile } = await supabase
            .from('profiles')
            .select('username, agent_code')
            .eq('id', battle.creator_id)
            .single();

          const incomingBattle: IncomingBattle = {
            battleId: battle.id,
            attackerName: attackerProfile?.username || 'Unknown',
            attackerAgentCode: attackerProfile?.agent_code || attackerProfile?.username || 'Unknown',
            attackerWeaponPower: battle.attacker_weapon_power || 0,
            stakeAmount: battle.stake_amount || 50,
            stakeType: battle.stake_type || 'PE',
            arenaName: battle.arena_name,
          };

          console.log('⚔️ [BattleDefense] Found pending battle:', incomingBattle);
          setIncomingBattle(incomingBattle);
          setShowDefenseModal(true);
        }
      } catch (err) {
        console.error('[BattleDefense] Check pending exception:', err);
      }
    };

    checkPendingBattles();
  }, [userId]);

  const closeDefenseModal = useCallback(() => {
    setShowDefenseModal(false);
    setIncomingBattle(null);
  }, []);

  return {
    incomingBattle,
    showDefenseModal,
    closeDefenseModal,
  };
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
