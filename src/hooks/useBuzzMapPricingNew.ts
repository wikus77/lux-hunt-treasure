import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { BUZZ_MAP_LEVELS, calculateNextBuzzMapPrice } from "@/lib/buzzMapPricing";

export function useBuzzMapPricingNew(userId?: string) {
  const [loading, setLoading] = useState(true);
  const [nextLevel, setLevel] = useState(1);
  const [nextRadiusKm, setRadius] = useState(500);
  const [nextPriceEur, setPrice] = useState(4.99);

  useEffect(() => {
    let off = false;
    (async () => {
      setLoading(true);
      try {
        if (!userId) { 
          setLevel(1); 
          setRadius(500); 
          setPrice(4.99); 
        } else {
          const { count } = await supabase
            .from("user_map_areas")
            .select("id", { count: "exact", head: true })
            .eq("user_id", userId)
            .eq("source", "buzz_map");
          // Use shared pricing calculation
          const pricing = calculateNextBuzzMapPrice(count ?? 0);
          if (!off) { 
            setLevel(pricing.level); 
            setRadius(pricing.radiusKm); 
            setPrice(pricing.priceEur); 
          }
        }
      } catch (error) {
        console.error("Error in useBuzzMapPricingNew:", error);
        if (!off) {
          setLevel(1);
          setRadius(500);
          setPrice(4.99);
        }
      } finally { 
        if (!off) setLoading(false); 
      }
    })();
    return () => { off = true; };
  }, [userId]);

  return { 
    loading, 
    nextLevel, 
    nextRadiusKm, 
    nextPriceEur,
    // Backward compatibility
    generation: nextLevel,
    price: nextPriceEur,
    radius: nextRadiusKm
  };
}