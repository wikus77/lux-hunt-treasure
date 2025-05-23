
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Custom hook to calculate the BUZZ map price based on the number of clues collected
 * by the current user.
 */
export function useBuzzMapPricing() {
  const [buzzMapPrice, setBuzzMapPrice] = useState<number>(7.99);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [clueCount, setClueCount] = useState<number>(0);

  useEffect(() => {
    async function fetchClueCount() {
      try {
        setIsLoading(true);
        
        // Get the current user
        const { data: sessionData } = await supabase.auth.getSession();
        if (!sessionData?.session?.user) {
          console.log("No authenticated user found");
          setIsLoading(false);
          return;
        }
        
        const userId = sessionData.session.user.id;
        
        // Count the user's clues
        const { count, error } = await supabase
          .from('user_clues')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId);
          
        if (error) {
          console.error("Error fetching clue count:", error);
          toast.error("Errore nel calcolare il prezzo del BUZZ");
          setIsLoading(false);
          return;
        }
        
        // Store the count
        const totalClues = count || 0;
        setClueCount(totalClues);
        
        // Calculate price based on clue count
        let price = 7.99; // Default price
        if (totalClues > 40) price = 29.99;
        else if (totalClues > 30) price = 19.99;
        else if (totalClues > 20) price = 13.99;
        else if (totalClues > 10) price = 9.99;
        
        console.log(`User has ${totalClues} clues, BUZZ price set to €${price.toFixed(2)}`);
        setBuzzMapPrice(price);
        
      } catch (error) {
        console.error("Error in useBuzzMapPricing:", error);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchClueCount();
  }, []);
  
  return { buzzMapPrice, isLoading, clueCount };
}
