
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/auth';

export const useBuzzClues = () => {
  const [unlockedClues, setUnlockedClues] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthContext();

  const MAX_CLUES = 1000;

  useEffect(() => {
    const fetchUnlockedClues = async () => {
      if (!user?.id) {
        setUnlockedClues(0);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('user_clues')
          .select('*')
          .eq('user_id', user.id);

        if (error) {
          console.error('Error fetching clues:', error);
          setUnlockedClues(0);
        } else {
          setUnlockedClues(data?.length || 0);
        }
      } catch (err) {
        console.error('Exception fetching clues:', err);
        setUnlockedClues(0);
      } finally {
        setLoading(false);
      }
    };

    fetchUnlockedClues();
  }, [user?.id]);

  const incrementUnlockedCluesAndAddClue = async () => {
    if (!user?.id) return { updatedCount: 0, nextClue: null };

    try {
      const newClue = {
        user_id: user.id,
        title_it: 'Nuovo Indizio',
        description_it: `Indizio sbloccato alle ${new Date().toLocaleTimeString()}`,
        clue_type: 'buzz',
        buzz_cost: 1.99
      };

      const { error } = await supabase
        .from('user_clues')
        .insert(newClue);

      if (error) {
        console.error('Error adding clue:', error);
        return { updatedCount: unlockedClues, nextClue: null };
      }

      const newCount = unlockedClues + 1;
      setUnlockedClues(newCount);
      
      return { 
        updatedCount: newCount, 
        nextClue: newClue.description_it 
      };
    } catch (error) {
      console.error('Error incrementing clues:', error);
      return { updatedCount: unlockedClues, nextClue: null };
    }
  };

  return {
    unlockedClues,
    loading,
    MAX_CLUES,
    incrementUnlockedCluesAndAddClue
  };
};
