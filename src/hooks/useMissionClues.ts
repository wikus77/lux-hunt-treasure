// © 2025 Joseph MULÉ – M1SSION™ - ALL RIGHTS RESERVED - NIYVORA KFT
// Hook per gestione indizi missioni M1SSION™

import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface MissionClue {
  id: string;
  week: number;
  title_it: string;
  description_it: string;
  title_en?: string;
  title_fr?: string;
  description_en?: string;
  description_fr?: string;
  clue_type: 'real' | 'decoy';
  tier: 'base' | 'silver' | 'gold' | 'black' | 'titanium';
  difficulty_level: number;
  category: string;
  prize_id?: string;
  created_at: string;
}

export interface ClueDistribution {
  total: number;
  week_1: number;
  week_2: number;
  week_3: number;
  week_4: number;
  by_tier: {
    base: number;
    silver: number;
    gold: number;
    black: number;
    titanium: number;
  };
  decoy_count: number;
}

export interface GenerateCluesParams {
  missionId: string;
  targetLocation: {
    city: string;
    country: string;
    coordinates: { lat: number; lng: number };
  };
  prizeDescription: string;
  areaRadiusKm: number;
}

const TIER_WEEKLY_LIMITS = {
  base: 1,
  silver: 3,
  gold: 5,
  black: 7,
  titanium: 9
} as const;

export const useMissionClues = () => {
  const [clues, setClues] = useState<MissionClue[]>([]);
  const [distribution, setDistribution] = useState<ClueDistribution | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Carica indizi per missione specifica
  const loadCluesForMission = async (missionId: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('prize_clues')
        .select('*')
        .eq('prize_id', missionId)
        .order('week', { ascending: true })
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Mappa i dati dalla tabella al nostro tipo
      const mappedClues: MissionClue[] = (data || []).map((item: any) => ({
        id: item.id,
        week: item.week,
        title_it: item.title_it,
        description_it: item.description_it,
        title_en: item.title_en || '',
        title_fr: item.title_fr || '',
        description_en: item.description_en || '',
        description_fr: item.description_fr || '',
        clue_type: (item.clue_type as 'real' | 'decoy') || 'real',
        tier: (item.tier as 'base' | 'silver' | 'gold' | 'black' | 'titanium') || 'base',
        difficulty_level: item.difficulty_level || 1,
        category: item.category || 'general',
        prize_id: item.prize_id,
        created_at: item.created_at
      }));

      setClues(mappedClues);
      calculateDistribution(mappedClues);
      
    } catch (error) {
      console.error('❌ Errore caricamento indizi:', error);
      toast.error('Errore nel caricamento degli indizi');
    } finally {
      setIsLoading(false);
    }
  };

  // Calcola distribuzione indizi
  const calculateDistribution = (cluesList: MissionClue[]) => {
    const dist: ClueDistribution = {
      total: cluesList.length,
      week_1: cluesList.filter(c => c.week === 1).length,
      week_2: cluesList.filter(c => c.week === 2).length,
      week_3: cluesList.filter(c => c.week === 3).length,
      week_4: cluesList.filter(c => c.week === 4).length,
      by_tier: {
        base: cluesList.filter(c => c.tier === 'base').length,
        silver: cluesList.filter(c => c.tier === 'silver').length,
        gold: cluesList.filter(c => c.tier === 'gold').length,
        black: cluesList.filter(c => c.tier === 'black').length,
        titanium: cluesList.filter(c => c.tier === 'titanium').length,
      },
      decoy_count: cluesList.filter(c => c.clue_type === 'decoy').length
    };
    
    setDistribution(dist);
  };

  // Filtra indizi disponibili per utente in base al piano
  const getAvailableCluesForUser = (userTier: string, currentWeek: number): MissionClue[] => {
    const maxCluesForTier = TIER_WEEKLY_LIMITS[userTier as keyof typeof TIER_WEEKLY_LIMITS] || 1;
    
    return clues
      .filter(clue => clue.week <= currentWeek)
      .filter(clue => {
        // Logica di accesso per tier
        switch (userTier) {
          case 'titanium':
            return true; // Accesso a tutti gli indizi
          case 'black':
            return ['base', 'silver', 'gold', 'black'].includes(clue.tier);
          case 'gold':
            return ['base', 'silver', 'gold'].includes(clue.tier);
          case 'silver':
            return ['base', 'silver'].includes(clue.tier);
          case 'base':
          default:
            return clue.tier === 'base';
        }
      })
      .slice(0, maxCluesForTier * currentWeek);
  };

  // Genera indizi con AI
  const generateClues = async (params: GenerateCluesParams) => {
    setIsGenerating(true);
    try {
      console.log('🧠 Avvio generazione indizi M1SSION™...');
      
      const response = await supabase.functions.invoke('generate-mission-clues', {
        body: params
      });

      if (response.error) throw response.error;

      toast.success(`✅ Generati ${response.data.total_clues} indizi per M1SSION™`);
      
      // Ricarica gli indizi appena generati
      await loadCluesForMission(params.missionId);
      
      return response.data;
      
    } catch (error) {
      console.error('❌ Errore generazione indizi:', error);
      toast.error('Errore nella generazione degli indizi');
      throw error;
    } finally {
      setIsGenerating(false);
    }
  };

  // Elimina tutti gli indizi di una missione
  const deleteAllClues = async (missionId: string) => {
    try {
      const { error } = await supabase
        .from('prize_clues')
        .delete()
        .eq('prize_id', missionId);

      if (error) throw error;

      setClues([]);
      setDistribution(null);
      toast.success('Indizi eliminati');
      
    } catch (error) {
      console.error('❌ Errore eliminazione indizi:', error);
      toast.error('Errore nell\'eliminazione degli indizi');
    }
  };

  // Ottieni anteprima indizi per tier
  const getCluePreviewByTier = (tier: string, limit: number = 3): MissionClue[] => {
    return clues
      .filter(clue => clue.tier === tier)
      .slice(0, limit);
  };

  return {
    clues,
    distribution,
    isLoading,
    isGenerating,
    loadCluesForMission,
    generateClues,
    deleteAllClues,
    getAvailableCluesForUser,
    getCluePreviewByTier,
    TIER_WEEKLY_LIMITS
  };
};