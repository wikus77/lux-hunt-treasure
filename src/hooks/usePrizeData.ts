// M1SSION™ - Prize Data Hook for iOS Capacitor
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { preserveFunctionName } from '@/utils/iosCapacitorFunctions';
import { toast } from 'sonner';

export interface Prize {
  id: string;
  name: string;
  description: string;
  location_address: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  lat: number;
  lng: number;
  area_radius_m: number;
  image_url?: string;
  clue_count?: number;
  unlocked_clues?: number;
}

export interface Clue {
  id: string;
  prize_id: string;
  title_it: string;
  description_it: string;
  week: number;
  clue_type: string;
  is_unlocked?: boolean;
  unlock_cost?: number;
}

export interface UserClue {
  clue_id: string;
  user_id: string;
  title_it: string;
  description_it: string;
  clue_type: string;
  buzz_cost: number;
  created_at: string;
}

export const usePrizeData = () => {
  const [prizes, setPrizes] = useState<Prize[]>([]);
  const [userClues, setUserClues] = useState<UserClue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Load all prizes with clue information
  const loadPrizes = preserveFunctionName(async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      // Fetch active prizes
      const { data: prizesData, error: prizesError } = await supabase
        .from('prizes')
        .select(`
          *,
          prize_clues!inner(count)
        `)
        .eq('is_active', true)
        .order('start_date', { ascending: false });

      if (prizesError) {
        console.error('Error loading prizes:', prizesError);
        setError('Errore nel caricamento dei premi');
        return;
      }

      // Get user clues for these prizes
      const prizeIds = prizesData?.map(p => p.id) || [];
      
      if (prizeIds.length > 0) {
        // Get all clues for these prizes
        const { data: allClues } = await supabase
          .from('prize_clues')
          .select('id, prize_id')
          .in('prize_id', prizeIds);

        const clueIds = allClues?.map(c => c.id) || [];

        // Get user's unlocked clues
        const { data: userCluesData } = await supabase
          .from('user_clues')
          .select('*')
          .eq('user_id', user.id)
          .in('clue_id', clueIds);

        setUserClues(userCluesData || []);

        // Create a map of prize_id to unlocked clue count
        const clueCountMap = new Map();
        allClues?.forEach(clue => {
          const isUnlocked = userCluesData?.some(uc => uc.clue_id === clue.id);
          if (isUnlocked) {
            clueCountMap.set(clue.prize_id, (clueCountMap.get(clue.prize_id) || 0) + 1);
          }
        });

        // Combine data
        const enrichedPrizes = prizesData?.map(prize => ({
          ...prize,
          clue_count: prize.prize_clues?.length || 0,
          unlocked_clues: clueCountMap.get(prize.id) || 0
        })) || [];

        setPrizes(enrichedPrizes);
      } else {
        setPrizes([]);
        setUserClues([]);
      }
    } catch (err) {
      console.error('Error in loadPrizes:', err);
      setError('Errore di connessione');
    } finally {
      setLoading(false);
    }
  }, 'loadPrizes');

  // Load clues for a specific prize
  const loadPrizeClues = preserveFunctionName(async (prizeId: string): Promise<Clue[]> => {
    if (!user) return [];

    try {
      // Get all clues for this prize
      const { data: prizeClues, error: cluesError } = await supabase
        .from('prize_clues')
        .select('*')
        .eq('prize_id', prizeId)
        .order('week', { ascending: true });

      if (cluesError) {
        console.error('Error loading clues:', cluesError);
        throw new Error('Errore nel caricamento degli indizi');
      }

      // Get user's unlocked clues
      const clueIds = prizeClues?.map(c => c.id) || [];
      const { data: userCluesData } = await supabase
        .from('user_clues')
        .select('clue_id')
        .eq('user_id', user.id)
        .in('clue_id', clueIds);

      const unlockedClueIds = new Set(userCluesData?.map(uc => uc.clue_id) || []);

      // Combine data
      const enrichedClues = prizeClues?.map(clue => ({
        ...clue,
        is_unlocked: unlockedClueIds.has(clue.id),
        unlock_cost: getUnlockCost(clue.clue_type)
      })) || [];

      return enrichedClues;
    } catch (err) {
      console.error('Error loading prize clues:', err);
      throw err;
    }
  }, 'loadPrizeClues');

  // Get unlock cost based on clue type
  const getUnlockCost = (clueType: string): number => {
    switch (clueType) {
      case 'precise': return 50;
      case 'medium': return 30;
      case 'vague': return 10;
      default: return 20;
    }
  };

  // Unlock a clue
  const unlockClue = preserveFunctionName(async (clue: Clue): Promise<boolean> => {
    if (!user) return false;

    try {
      // Check user's credits
      const { data: profile } = await supabase
        .from('profiles')
        .select('credits')
        .eq('id', user.id)
        .single();

      const userCredits = profile?.credits || 0;
      const cost = clue.unlock_cost || 20;

      if (userCredits < cost) {
        toast.error(`Crediti insufficienti. Servono ${cost} crediti.`);
        return false;
      }

      // Deduct credits
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ credits: userCredits - cost })
        .eq('id', user.id);

      if (updateError) {
        console.error('Error updating credits:', updateError);
        toast.error('Errore nell\'aggiornamento dei crediti');
        return false;
      }

      // Add to user clues
      const { error: insertError } = await supabase
        .from('user_clues')
        .insert({
          user_id: user.id,
          clue_id: clue.id,
          title_it: clue.title_it,
          description_it: clue.description_it,
          clue_type: clue.clue_type,
          buzz_cost: cost
        });

      if (insertError) {
        console.error('Error inserting user clue:', insertError);
        // Rollback credits
        await supabase
          .from('profiles')
          .update({ credits: userCredits })
          .eq('id', user.id);
        toast.error('Errore nel salvataggio dell\'indizio');
        return false;
      }

      // Update local state
      const newUserClue: UserClue = {
        clue_id: clue.id,
        user_id: user.id,
        title_it: clue.title_it,
        description_it: clue.description_it,
        clue_type: clue.clue_type,
        buzz_cost: cost,
        created_at: new Date().toISOString()
      };

      setUserClues(prev => [...prev, newUserClue]);

      toast.success(`Indizio sbloccato! Costato ${cost} crediti.`);
      
      // Reload prizes to update counts
      await loadPrizes();
      
      return true;
    } catch (err) {
      console.error('Error unlocking clue:', err);
      toast.error('Errore nel sblocco dell\'indizio');
      return false;
    }
  }, 'unlockClue');

  // Get user's clues for a specific prize
  const getPrizeUserClues = useCallback((prizeId: string): UserClue[] => {
    return userClues.filter(uc => {
      // We need to check if this clue belongs to the prize
      // This is a bit complex since user_clues doesn't directly reference prize_id
      // For now, we'll return all user clues and filter in the component
      return true;
    });
  }, [userClues]);

  // Calculate progress for a prize
  const getPrizeProgress = useCallback((prize: Prize): number => {
    if (!prize.clue_count) return 0;
    return Math.round((prize.unlocked_clues || 0) / prize.clue_count * 100);
  }, []);

  // Check if a prize is completed
  const isPrizeCompleted = useCallback((prize: Prize): boolean => {
    return getPrizeProgress(prize) === 100;
  }, [getPrizeProgress]);

  useEffect(() => {
    if (user) {
      loadPrizes();
    }
  }, [user]);

  return {
    prizes,
    userClues,
    loading,
    error,
    loadPrizes,
    loadPrizeClues,
    unlockClue,
    getPrizeUserClues,
    getPrizeProgress,
    isPrizeCompleted,
    getUnlockCost
  };
};

export default usePrizeData;