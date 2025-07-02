
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/auth';

export const useBuzzClues = () => {
  const [unlockedClues, setUnlockedClues] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthContext();

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

  return {
    unlockedClues,
    loading
  };
};
