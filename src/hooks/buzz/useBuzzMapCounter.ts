
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useBuzzMapCounter = (userId?: string) => {
  const [isUpdating, setIsUpdating] = useState(false);

  const updateCounter = useCallback(async (): Promise<number> => {
    if (!userId) {
      console.error('❌ No user ID provided for counter update');
      return 1;
    }

    setIsUpdating(true);
    
    try {
      console.log('🔄 Updating buzz map counter for user:', userId);
      
      // FIXED: Simple upsert with proper error handling
      const { data, error } = await supabase
        .from('user_buzz_map_counter')
        .upsert({
          user_id: userId,
          date: new Date().toISOString().split('T')[0],
          buzz_map_count: 1
        }, {
          onConflict: 'user_id,date'
        })
        .select('buzz_map_count')
        .single();

      if (error) {
        console.error('❌ Error updating counter:', error);
        toast.error('Errore nell\'aggiornamento del contatore');
        return 1;
      }

      const generation = data.buzz_map_count;
      console.log('✅ Counter updated successfully: generation', generation);
      return generation;
      
    } catch (error) {
      console.error('❌ Exception updating counter:', error);
      toast.error('Errore nell\'aggiornamento del contatore');
      return 1;
    } finally {
      setIsUpdating(false);
    }
  }, [userId]);

  const incrementCounter = useCallback(async (): Promise<number> => {
    if (!userId) return 1;

    try {
      // Get current counter
      const { data: current, error: getError } = await supabase
        .from('user_buzz_map_counter')
        .select('buzz_map_count')
        .eq('user_id', userId)
        .eq('date', new Date().toISOString().split('T')[0])
        .maybeSingle();

      if (getError && getError.code !== 'PGRST116') {
        console.error('❌ Error getting current counter:', getError);
        return 1;
      }

      const currentCount = current?.buzz_map_count || 0;
      const newCount = currentCount + 1;

      // Update counter
      const { data, error } = await supabase
        .from('user_buzz_map_counter')
        .upsert({
          user_id: userId,
          date: new Date().toISOString().split('T')[0],
          buzz_map_count: newCount
        }, {
          onConflict: 'user_id,date'
        })
        .select('buzz_map_count')
        .single();

      if (error) {
        console.error('❌ Error incrementing counter:', error);
        return newCount;
      }

      console.log('✅ Counter incremented to:', data.buzz_map_count);
      return data.buzz_map_count;

    } catch (error) {
      console.error('❌ Exception incrementing counter:', error);
      return 1;
    }
  }, [userId]);

  return {
    updateCounter,
    incrementCounter,
    isUpdating
  };
};
