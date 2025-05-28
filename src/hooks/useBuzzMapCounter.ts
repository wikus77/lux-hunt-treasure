
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface BuzzMapCounterData {
  id: string;
  user_id: string;
  date: string;
  buzz_map_count: number;
  created_at: string;
}

export const useBuzzMapCounter = (userId?: string) => {
  const [dailyBuzzMapCounter, setDailyBuzzMapCounter] = useState(0);
  const [lastPriceUsed, setLastPriceUsed] = useState(0);
  const [precisionMode, setPrecisionMode] = useState<'high' | 'low'>('high');
  const [isLoading, setIsLoading] = useState(false);

  // Load daily counter for current week
  const loadDailyBuzzMapCounter = useCallback(async () => {
    if (!userId) return;

    try {
      setIsLoading(true);
      const weekStart = getWeekStart();
      
      const { data, error } = await supabase
        .from('user_buzz_map_counter')
        .select('*')
        .eq('user_id', userId)
        .eq('date', weekStart)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading buzz map counter:', error);
        return;
      }

      if (data) {
        setDailyBuzzMapCounter(data.buzz_map_count);
        // Set default values for missing columns
        setLastPriceUsed(0);
        setPrecisionMode('high');
      } else {
        setDailyBuzzMapCounter(0);
        setLastPriceUsed(0);
        setPrecisionMode('high');
      }
    } catch (error) {
      console.error('Exception loading buzz map counter:', error);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // Update counter with new buzz map action
  const updateDailyBuzzMapCounter = useCallback(async (basePrice: number, precision: 'high' | 'low' = 'high') => {
    if (!userId) return 0;

    try {
      setIsLoading(true);
      const weekStart = getWeekStart();
      
      // Calculate progressive price
      const priceIncrease = dailyBuzzMapCounter; // 0 for first, 1 for second, etc.
      const finalPrice = basePrice + priceIncrease;
      
      const { data, error } = await supabase
        .from('user_buzz_map_counter')
        .upsert({
          user_id: userId,
          date: weekStart,
          buzz_map_count: dailyBuzzMapCounter + 1,
        }, {
          onConflict: 'user_id,date'
        })
        .select()
        .single();

      if (error) {
        console.error('Error updating buzz map counter:', error);
        toast.error('Errore nell\'aggiornamento del contatore');
        return dailyBuzzMapCounter;
      }

      if (data) {
        setDailyBuzzMapCounter(data.buzz_map_count);
        setLastPriceUsed(finalPrice);
        setPrecisionMode(precision);
        return data.buzz_map_count;
      }

      return dailyBuzzMapCounter + 1;
    } catch (error) {
      console.error('Exception updating buzz map counter:', error);
      toast.error('Errore nell\'aggiornamento del contatore');
      return dailyBuzzMapCounter;
    } finally {
      setIsLoading(false);
    }
  }, [userId, dailyBuzzMapCounter]);

  // Calculate progressive price for next buzz
  const calculateProgressivePrice = useCallback((basePrice: number) => {
    const priceIncrease = dailyBuzzMapCounter; // Current count becomes the increase
    return basePrice + priceIncrease;
  }, [dailyBuzzMapCounter]);

  // Calculate escalated price for areas under 5km
  const calculateEscalatedPrice = useCallback((basePrice: number, currentRadius: number) => {
    if (currentRadius >= 5) {
      return calculateProgressivePrice(basePrice);
    }
    
    // For areas under 5km, start at 29.99€ and increase by 10% each time
    const escalatedBase = 29.99;
    const escalationFactor = Math.pow(1.1, dailyBuzzMapCounter);
    return escalatedBase * escalationFactor;
  }, [dailyBuzzMapCounter, calculateProgressivePrice]);

  // Show warning toast for first time under 5km
  const showUnder5kmWarning = useCallback(() => {
    const warningShown = localStorage.getItem('buzz_map_5km_warning_shown');
    if (!warningShown) {
      toast.warning('⚠️ Hai raggiunto il diametro minimo standard di 5 km.\nOgni BUZZ successivo costerà il 10% in più.', {
        duration: 4000,
        position: 'top-center'
      });
      localStorage.setItem('buzz_map_5km_warning_shown', 'true');
    }
  }, []);

  // Get week start (Monday)
  const getWeekStart = useCallback(() => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Adjust for Sunday
    const monday = new Date(now.setDate(diff));
    return monday.toISOString().split('T')[0];
  }, []);

  // Load counter on mount
  useEffect(() => {
    if (userId) {
      loadDailyBuzzMapCounter();
    }
  }, [userId, loadDailyBuzzMapCounter]);

  return {
    dailyBuzzMapCounter,
    lastPriceUsed,
    precisionMode,
    isLoading,
    updateDailyBuzzMapCounter,
    loadDailyBuzzMapCounter,
    calculateProgressivePrice,
    calculateEscalatedPrice,
    showUnder5kmWarning
  };
};
