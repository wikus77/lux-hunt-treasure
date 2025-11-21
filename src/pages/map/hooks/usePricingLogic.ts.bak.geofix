
import { useState, useCallback, useEffect } from 'react';
import { useStripePayment } from '@/hooks/useStripePayment';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useBuzzClues } from '@/hooks/useBuzzClues';

export const usePricingLogic = () => {
  const [buzzMapPrice, setBuzzMapPrice] = useState(7.99);
  const [clueCount, setClueCount] = useState(0);
  const [buzzRadiusMeters, setBuzzRadiusMeters] = useState(100000); // Initial radius 100km
  const { processBuzzPurchase, loading } = useStripePayment();
  const { unlockedClues } = useBuzzClues();
  
  // Update price based on unlocked clues
  useEffect(() => {
    // Count user's clues using the useBuzzClues hook
    const count = unlockedClues || 0;
    setClueCount(count);
    
    // Set price based on clue count according to the table
    if (count <= 10) {
      setBuzzMapPrice(7.99);
    } else if (count <= 20) {
      setBuzzMapPrice(9.99);
    } else if (count <= 30) {
      setBuzzMapPrice(13.99);
    } else if (count <= 40) {
      setBuzzMapPrice(19.99);
    } else {
      setBuzzMapPrice(29.99);
    }
  }, [unlockedClues]);

  // Calculate radius for search area based on previous map buzz actions
  const calculateSearchAreaRadius = useCallback(async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user?.user?.id) {
        console.error("User not authenticated");
        return 100000; // Default to 100km
      }
      
      const { data: previousActions, error } = await supabase
        .from('buzz_map_actions')
        .select('*')
        .eq('user_id', user.user.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error("Error fetching previous buzz map actions:", error);
        return 100000; // Default to 100km
      }
      
      // If no previous actions, start with 100km radius
      if (!previousActions || previousActions.length === 0) {
        return 100000;
      }
      
      // Get the most recent radius and apply 5% reduction
      let lastRadius = previousActions[0].radius_generated;
      let newRadius = lastRadius * 0.95; // 5% reduction
      
      // Ensure minimum radius of 5km (5000 meters)
      return Math.max(5000, newRadius);
    } catch (error) {
      console.error("Error calculating radius:", error);
      return 100000; // Default to 100km
    }
  }, []);
  
  // Update radius when component mounts
  useEffect(() => {
    calculateSearchAreaRadius().then(radius => {
      setBuzzRadiusMeters(radius);
    });
  }, [calculateSearchAreaRadius]);

  // Record a new buzz map action in Supabase
  const recordBuzzMapAction = async (cost: number, radius: number) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user?.user?.id) return;
      
      await supabase.from('buzz_map_actions').insert({
        user_id: user.user.id,
        clue_count: clueCount,
        cost_eur: cost,
        radius_generated: radius
      });
    } catch (error) {
      console.error("Failed to record buzz map action:", error);
    }
  };
  
  // Handle payment for map buzz
  const handlePayment = useCallback(async () => {
    try {
      // Track checkout start event for map buzz
      if (typeof window !== 'undefined' && window.plausible) {
        window.plausible('checkout_start');
      }

      // Calculate the radius before processing payment
      const calculatedRadius = await calculateSearchAreaRadius();
      
      // Process the map buzz payment
      const data = await processBuzzPurchase(true, buzzMapPrice);
      
      if (data) {
        // Record the action in Supabase
        await recordBuzzMapAction(buzzMapPrice, calculatedRadius);
        
        // Update the radius for next time
        setBuzzRadiusMeters(calculatedRadius);
        
        toast.info("Redirezione al pagamento in corso...");
        return true;
      }
      return false;
    } catch (error) {
      console.error("Payment error:", error);
      toast.error("Errore durante il pagamento");
      return false;
    }
  }, [buzzMapPrice, processBuzzPurchase, calculateSearchAreaRadius, clueCount]);
  
  return {
    buzzMapPrice,
    buzzRadiusMeters,
    handlePayment,
    loading
  };
};
