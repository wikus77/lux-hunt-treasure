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
   * FASE 2: Avvia un attacco contro un difensore (con economia M1U)
   * @param defenderId - UUID del difensore
   * @param weaponKey - Chiave arma da catalogo
   * @returns Response con session_id e expires_at
   */
  const startAttack = useCallback(async (
    defenderId: string,
    weaponKey: string
  ): Promise<{ session_id: string; expires_at: string } | null> => {
    setIsLoading(true);
    
    try {
      console.debug('[Battle] Starting attack (V2):', { defenderId, weaponKey });
      
      // FASE 2: chiamata a start_battle_v2 (con addebito M1U)
      const { data, error } = await (supabase as any).rpc('start_battle_v2', {
        p_defender_id: defenderId,
        p_weapon_key: weaponKey,
        p_client_nonce: crypto.randomUUID()
      });

      if (error) {
        console.error('[Battle] start_battle_v2 error:', error);
        toast.error('Attack failed', {
          description: error.message
        });
        return null;
      }

      if (!data.success) {
        toast.error('Attack failed', {
          description: data.error || 'Unknown error'
        });
        return null;
      }

      setCurrentSession(data.session_id || null);
      
      toast.success('Attack initiated!', {
        description: `Waiting for defense... (60s)`
      });

      console.debug('[Battle] Attack started V2:', data);
      return {
        session_id: data.session_id,
        expires_at: data.expires_at
      };

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
   * FASE 2: Invia una difesa manuale entro 60s
   * @param sessionId - UUID della sessione di battaglia
   * @param defenseKey - Chiave difesa da catalogo
   * @returns Esito risolto { status, winner_id }
   */
  const submitDefense = useCallback(async (
    sessionId: string,
    defenseKey: string
  ): Promise<{ status: 'resolved'; winner_id: string } | null> => {
    setIsLoading(true);

    try {
      console.debug('[Battle] Submitting defense:', { sessionId, defenseKey });

      const { data, error } = await (supabase as any).rpc('submit_defense_v2', {
        p_session_id: sessionId,
        p_defense_key: defenseKey
      });

      if (error) {
        console.error('[Battle] submit_defense_v2 error:', error);
        toast.error('Defense failed', {
          description: error.message
        });
        return null;
      }

      if (!data.success) {
        toast.error('Defense failed', {
          description: data.error || 'Unknown error'
        });
        return null;
      }

      setCurrentSession(null);

      const outcome = data.outcome === 'attacker_win' ? 'Attacker wins!' : 'Defender wins!';
      toast.success('Battle resolved!', {
        description: outcome
      });

      console.debug('[Battle] Defense submitted, battle resolved:', data);
      return {
        status: 'resolved',
        winner_id: data.winner_id
      };

    } catch (err) {
      console.error('[Battle] submitDefense exception:', err);
      toast.error('System error', {
        description: 'Failed to submit defense'
      });
      return null;
    } finally {
      setIsLoading(false);
    }
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
   * Recupera il catalogo difese disponibili
   */
  const getDefenseCatalog = useCallback(async (): Promise<any[]> => {
    try {
      const { data, error } = await (supabase as any)
        .from('defense_catalog')
        .select('key, name, description, power, m1u_cost, cooldown_sec, effect_key, min_rank')
        .eq('enabled', true)
        .order('power', { ascending: true });

      if (error) {
        console.error('[Battle] get_defense_catalog error:', error);
        return [];
      }

      return data || [];
    } catch (err) {
      console.error('[Battle] getDefenseCatalog exception:', err);
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

  /**
   * FASE 2: Finalizza battaglie scadute (cron/manuale)
   * @returns Numero di battaglie chiuse
   */
  const finalizeExpired = useCallback(async (): Promise<number> => {
    try {
      console.debug('[Battle] Finalizing expired battles...');

      const { data, error } = await (supabase as any).rpc('finalize_expired_battles');

      if (error) {
        console.error('[Battle] finalize_expired_battles error:', error);
        return 0;
      }

      const count = data || 0;
      console.debug(`[Battle] Finalized ${count} expired battle(s)`);
      return count;

    } catch (err) {
      console.error('[Battle] finalizeExpired exception:', err);
      return 0;
    }
  }, []);

  return {
    // State
    isLoading,
    currentSession,
    
    // Actions (FASE 2 completa)
    startAttack,
    submitDefense,
    finalizeExpired,
    
    // Queries
    getMyBattles,
    getMyCooldowns,
    getWeaponsCatalog,
    getDefenseCatalog,
    isUserAttackable
  };
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
