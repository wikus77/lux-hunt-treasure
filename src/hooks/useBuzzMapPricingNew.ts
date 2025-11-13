import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getBuzzMapPricing } from "@/lib/buzzMapPricing";
import { getBuzzMapCostM1U } from "@/lib/constants/buzzMapPricingM1U";

export function useBuzzMapPricingNew(userId?: string) {
  const [loading, setLoading] = useState(true);
  const [nextLevel, setLevel] = useState(1);
  const [nextRadiusKm, setRadius] = useState(500);
  const [nextPriceEur, setPrice] = useState(4.99);
  const [nextCostM1U, setCostM1U] = useState(50);
  const [disabled, setDisabled] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let off = false;
    
    const calculateNextLevel = async () => {
      setLoading(true);
      setError(null);
      setDisabled(false);
      
      try {
        // Get current session to authenticate
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !session?.user) {
          console.warn('No authenticated session for buzz map pricing');
          // Return defaults with disabled flag
          if (!off) {
            setLevel(1);
            setRadius(500);
            setPrice(4.99);
            setDisabled(true);
            setError('Autenticazione richiesta');
          }
          return;
        }

        const currentUserId = userId || session.user.id;

        // Count current user map areas with buzz_map source
        const { count, error: countError } = await supabase
          .from("user_map_areas")
          .select("id", { count: "exact", head: true })
          .eq("user_id", currentUserId)
          .eq("source", "buzz_map");

        if (countError) {
          console.error("Error counting user map areas:", countError);
          if (!off) {
            setLevel(1);
            setRadius(500);
            setPrice(4.99);
            setDisabled(true);
            setError('Errore nel caricamento dati');
          }
          return;
        }

        // Calculate next level: clamp(count + 1, 1, 60)
        const currentCount = count ?? 0;
        const levelNext = Math.max(1, Math.min(currentCount + 1, 60));
        
        // Get pricing data for next level
        const pricingData = getBuzzMapPricing(levelNext);
        
        // Get M1U cost for this level
        const costM1U = getBuzzMapCostM1U(levelNext);
        
        if (!off) {
          setLevel(levelNext);
          setRadius(pricingData.radiusKm);
          setPrice(pricingData.priceEur);
          setCostM1U(costM1U);
          setDisabled(false);
          
          console.debug('Buzz map pricing calculated:', {
            currentCount,
            levelNext,
            radiusKm: pricingData.radiusKm,
            priceEur: pricingData.priceEur,
            costM1U
          });
        }
        
      } catch (error: any) {
        console.error("Error in useBuzzMapPricingNew:", error);
        if (!off) {
          // Fallback to defaults
          setLevel(1);
          setRadius(500);
          setPrice(4.99);
          setDisabled(true);
          
          if (error.code === '401' || error.message?.includes('401')) {
            setError('Accesso richiesto');
          } else {
            setError('Errore nel caricamento');
          }
        }
      } finally { 
        if (!off) setLoading(false); 
      }
    };

    calculateNextLevel();
    return () => { off = true; };
  }, [userId]);

  return { 
    loading, 
    nextLevel, 
    nextRadiusKm, 
    nextPriceEur,
    nextCostM1U,
    disabled,
    error,
    // Backward compatibility
    generation: nextLevel,
    price: nextPriceEur,
    radius: nextRadiusKm
  };
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
