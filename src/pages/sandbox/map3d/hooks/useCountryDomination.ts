/**
 * Risiko Domination - Hook per stato dominio paesi
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface CountryDominationState {
  country_code: string;
  owner_id: string | null;
  owner_name: string | null;
  owner_agent_code: string | null;
  win_progress: number;
  conquest_threshold: number;
  status: 'neutral' | 'contested' | 'conquered';
  conquered_at: string | null;
}

export interface UseCountryDominationReturn {
  dominationStates: CountryDominationState[];
  conqueredCountries: string[];
  contestedCountries: string[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useCountryDomination(): UseCountryDominationReturn {
  const [dominationStates, setDominationStates] = useState<CountryDominationState[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDominationStates = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Chiama RPC per ottenere stato dominio
      const { data, error: rpcError } = await supabase.rpc('get_country_domination_state');

      if (rpcError) {
        console.error('[Domination] RPC error:', rpcError);
        // Fallback: query diretta se RPC non esiste
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('country_domination')
          .select(`
            country_code,
            owner_id,
            win_progress,
            conquest_threshold,
            status,
            conquered_at
          `)
          .in('status', ['contested', 'conquered']);

        if (fallbackError) {
          throw fallbackError;
        }

        // Fetch owner names separately
        const ownerIds = (fallbackData || [])
          .filter(d => d.owner_id)
          .map(d => d.owner_id);

        let ownerMap: Record<string, { full_name: string; agent_code: string }> = {};
        
        if (ownerIds.length > 0) {
          // 🔧 FIX: Usa public_profiles invece di profiles (bypass RLS)
          const { data: profiles } = await supabase
            .from('public_profiles')
            .select('id, full_name, agent_code, nickname')
            .in('id', ownerIds);
          
          profiles?.forEach((p: any) => {
            ownerMap[p.id] = { 
              full_name: p.full_name || p.nickname || 'Unknown', 
              agent_code: p.agent_code 
            };
          });
        }

        const mappedData: CountryDominationState[] = (fallbackData || []).map(d => ({
          country_code: d.country_code,
          owner_id: d.owner_id,
          owner_name: d.owner_id ? (ownerMap[d.owner_id]?.full_name || 'Unknown') : null,
          owner_agent_code: d.owner_id ? (ownerMap[d.owner_id]?.agent_code || null) : null,
          win_progress: d.win_progress,
          conquest_threshold: d.conquest_threshold,
          status: d.status as 'neutral' | 'contested' | 'conquered',
          conquered_at: d.conquered_at
        }));

        setDominationStates(mappedData);
      } else {
        setDominationStates(data || []);
      }
    } catch (err: any) {
      console.error('[Domination] Fetch error:', err);
      setError(err.message || 'Failed to fetch domination state');
      setDominationStates([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchDominationStates();
  }, [fetchDominationStates]);

  // Subscribe to real-time updates
  useEffect(() => {
    const channel = supabase
      .channel('country-domination-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'country_domination'
      }, () => {
        console.log('[Domination] Real-time update received');
        fetchDominationStates();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchDominationStates]);

  // Derived data
  const conqueredCountries = dominationStates
    .filter(s => s.status === 'conquered')
    .map(s => s.country_code);

  const contestedCountries = dominationStates
    .filter(s => s.status === 'contested')
    .map(s => s.country_code);

  return {
    dominationStates,
    conqueredCountries,
    contestedCountries,
    loading,
    error,
    refresh: fetchDominationStates
  };
}

// Hook per statistiche utente
export function useUserDominationStats(userId: string | null) {
  const [stats, setStats] = useState<{
    countries_owned: number;
    countries_contested: number;
    total_wins: number;
    continents_owned: string[];
  } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userId) {
      setStats(null);
      return;
    }

    const fetchStats = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase.rpc('get_user_domination_stats', {
          p_user_id: userId
        });

        if (error) throw error;
        
        if (data && data.length > 0) {
          setStats(data[0]);
        }
      } catch (err) {
        console.error('[Domination] Stats fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [userId]);

  return { stats, loading };
}

