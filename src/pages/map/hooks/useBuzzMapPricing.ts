
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export const useBuzzMapPricing = () => {
  const [buzzMapPrice, setBuzzMapPrice] = useState(7.99);
  const [clueCount, setClueCount] = useState(0);
  const { user } = useAuth();
  
  useEffect(() => {
    const fetchUserCluesCount = async () => {
      if (!user?.id) return;
      
      try {
        const { count, error } = await supabase
          .from('user_clues')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);
        
        if (error) {
          console.error('Error fetching user clues count:', error);
          return;
        }
        
        // Update clue count state
        const totalClues = count || 0;
        setClueCount(totalClues);
        
        // Calculate price based on the table
        let price = 7.99;
        if (totalClues > 40) price = 29.99;
        else if (totalClues > 30) price = 19.99;
        else if (totalClues > 20) price = 13.99;
        else if (totalClues > 10) price = 9.99;
        
        // Update price state
        setBuzzMapPrice(price);
        
      } catch (err) {
        console.error('Exception fetching user clues count:', err);
      }
    };

    // Fetch user clues count when user is available
    fetchUserCluesCount();
    
    // Setup interval to refresh price every 60 seconds
    const intervalId = setInterval(fetchUserCluesCount, 60000);
    
    return () => clearInterval(intervalId);
  }, [user]);

  return { buzzMapPrice, clueCount };
};
