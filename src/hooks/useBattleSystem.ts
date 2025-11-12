// Battle System Hook - FASE 1 (base, senza economia completa)
// Hook per interagire con il sistema di battaglia
// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { 
  StartBattleResponse, 
  MyBattle, 
  MyCooldown, 
  WeaponCatalogItem 
} from '@/types/battle';

export function useBattleSystem() {
  const [isLoading, setIsLoading] = useState(false);
  const [currentSession, setCurrentSession] = useState<string | null>(null);

  /**
   * FASE 1: Avvia un attacco contro un difensore
   * @param defenderId - UUID del difensore
   * @param weaponKey - Chiave arma da catalogo
   * @returns Response con session_id e dettagli
   */
  const startAttack = useCallback(async (
    defenderId: string,
    weaponKey: string
  ): Promise<StartBattleResponse | null> => {
    setIsLoading(true);
    
    try {
      console.log('[Battle] Starting attack:', { defenderId, weaponKey });
      
      // FASE 1: chiamata RPC usando any per evitare type errors
      // (i types saranno generati dopo la migration)
      const { data, error } = await (supabase as any).rpc('start_battle', {
        p_defender_id: defenderId,
        p_weapon_key: weaponKey,
        p_client_nonce: crypto.randomUUID()
      });

      if (error) {
        console.error('[Battle] start_battle error:', error);
        toast.error('Attack failed', {
          description: error.message
        });
        return null;
      }

      const response = data as unknown as StartBattleResponse;
      
      if (!response.success) {
        toast.error('Attack failed', {
          description: response.error || 'Unknown error'
        });
        return null;
      }

      setCurrentSession(response.session_id || null);
      
      toast.success('Attack initiated!', {
        description: response.message || 'Waiting for defender...'
      });

      console.log('[Battle] Attack started:', response);
      return response;

    } catch (err) {
      console.error('[Battle] startAttack exception:', err);
      toast.error('System error', {
        description: 'Failed to start battle'
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * FASE 2: Invia una difesa (non implementato in FASE 1)
   */
  const submitDefense = useCallback(async (
    sessionId: string,
    defenseKey: string
  ): Promise<boolean> => {
    toast.info('Defense system coming in Phase 2');
    return false;
  }, []);

  /**
   * Recupera le battaglie dell'utente
   */
  const getMyBattles = useCallback(async (
    status?: string,
    limit: number = 20
  ): Promise<MyBattle[]> => {
    try {
      const { data, error } = await (supabase as any).rpc('get_my_battles', {
        p_status: status || null,
        p_limit: limit
      });

      if (error) {
        console.error('[Battle] get_my_battles error:', error);
        return [];
      }

      return (data || []) as unknown as MyBattle[];
    } catch (err) {
      console.error('[Battle] getMyBattles exception:', err);
      return [];
    }
  }, []);

  /**
   * Recupera i cooldown attivi dell'utente
   */
  const getMyCooldowns = useCallback(async (): Promise<MyCooldown[]> => {
    try {
      const { data, error } = await (supabase as any).rpc('get_my_cooldowns');

      if (error) {
        console.error('[Battle] get_my_cooldowns error:', error);
        return [];
      }

      return (data || []) as unknown as MyCooldown[];
    } catch (err) {
      console.error('[Battle] getMyCooldowns exception:', err);
      return [];
    }
  }, []);

  /**
   * Recupera il catalogo armi disponibili
   */
  const getWeaponsCatalog = useCallback(async (): Promise<WeaponCatalogItem[]> => {
    try {
      const { data, error } = await (supabase as any).rpc('get_weapons_catalog');

      if (error) {
        console.error('[Battle] get_weapons_catalog error:', error);
        return [];
      }

      return (data || []) as unknown as WeaponCatalogItem[];
    } catch (err) {
      console.error('[Battle] getWeaponsCatalog exception:', err);
      return [];
    }
  }, []);

  /**
   * Verifica se un utente è attackable (helper client-side)
   */
  const isUserAttackable = useCallback(async (userId: string): Promise<boolean> => {
    try {
      // Verifica presenza in agent_locations (online)
      const { data: agentData, error: agentError } = await (supabase as any)
        .from('agent_locations')
        .select('status, last_seen')
        .eq('user_id', userId)
        .eq('status', 'online')
        .gte('last_seen', new Date(Date.now() - 5 * 60 * 1000).toISOString())
        .maybeSingle();

      if (agentError || !agentData) {
        return false;
      }

      // Verifica se ha battaglia attiva come difensore
      const { data: battleData, error: battleError } = await (supabase as any)
        .from('battle_sessions')
        .select('id')
        .eq('defender_id', userId)
        .eq('status', 'await_defense')
        .maybeSingle();

      if (battleError) {
        console.error('[Battle] Check active battle error:', battleError);
        return false;
      }

      return !battleData; // Attackable se non ha battaglia attiva
    } catch (err) {
      console.error('[Battle] isUserAttackable exception:', err);
      return false;
    }
  }, []);

  return {
    // State
    isLoading,
    currentSession,
    
    // Actions
    startAttack,
    submitDefense,
    
    // Queries
    getMyBattles,
    getMyCooldowns,
    getWeaponsCatalog,
    isUserAttackable
  };
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
