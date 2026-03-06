import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getSessionSingleFlight } from "@/integrations/supabase/authSingleFlight";
import { useAuthContext } from "@/contexts/auth";
import { getBuzzMapPricing } from "@/lib/buzzMapPricing";
import { getBuzzMapCostM1U } from "@/lib/constants/buzzMapPricingM1U";
import { getCurrentWeekOfYear } from "@/lib/weekUtils";

export function useBuzzMapPricingNew(userId?: string) {
  const { authReady } = useAuthContext();
  const [loading, setLoading] = useState(true);
  const [nextLevel, setLevel] = useState(1);
  const [nextRadiusKm, setRadius] = useState(500);
  const [nextPriceEur, setPrice] = useState(4.99);
  const [nextCostM1U, setCostM1U] = useState(50);
  const [disabled, setDisabled] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculateNextLevel = useCallback(async () => {
    setLoading(true);
    setError(null);
    setDisabled(false);
    
    try {
      // Get current session (single-flight to avoid lock contention)
      const { data: { session }, error: sessionError } = await getSessionSingleFlight();
      
      if (sessionError || !session?.user) {
        console.warn('No authenticated session for buzz map pricing');
        // Return defaults with disabled flag
        setLevel(1);
        setRadius(500);
        setPrice(4.99);
        setDisabled(true);
        setError('Autenticazione richiesta');
        return;
      }

      const currentUserId = userId || session.user.id;
      
      // 🔄 WEEKLY COUNTER: Get current ISO week and count only this week's areas
      const currentWeek = getCurrentWeekOfYear();

      // Count current user map areas with buzz_map source FOR CURRENT WEEK ONLY
      const { count, error: countError } = await supabase
        .from("user_map_areas")
        .select("id", { count: "exact", head: true })
        .eq("user_id", currentUserId)
        .eq("source", "buzz_map")
        .eq("week", currentWeek);

      if (countError) {
        console.error("Error counting user map areas:", countError);
        setLevel(1);
        setRadius(500);
        setPrice(4.99);
        setDisabled(true);
        setError('Errore nel caricamento dati');
        return;
      }

      // Calculate next level: clamp(count + 1, 1, 60)
      const currentCount = count ?? 0;
      const levelNext = Math.max(1, Math.min(currentCount + 1, 60));
      
      // Get pricing data for next level
      const pricingData = getBuzzMapPricing(levelNext);
      
      // Get M1U cost for this level
      const costM1U = getBuzzMapCostM1U(levelNext);
      
      setLevel(levelNext);
      setRadius(pricingData.radiusKm);
      setPrice(pricingData.priceEur);
      setCostM1U(costM1U);
      setDisabled(false);
      
      console.debug('🗓️ Buzz map pricing calculated (WEEKLY + REALTIME):', {
        currentWeek,
        currentCount,
        levelNext,
        radiusKm: pricingData.radiusKm,
        priceEur: pricingData.priceEur,
        costM1U
      });
      
    } catch (error: any) {
      console.error("Error in useBuzzMapPricingNew:", error);
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
    } finally { 
      setLoading(false); 
    }
  }, [userId]);

  // Initial calculation (only after auth bootstrap to avoid lock contention)
  useEffect(() => {
    if (authReady) calculateNextLevel();
  }, [authReady, calculateNextLevel]);

  // 🔥 REALTIME: Subscribe to user_map_areas INSERT for current week to refresh pricing (only after auth bootstrap)
  useEffect(() => {
    if (!authReady) return;
    let mounted = true;
    let channel: any;

    const setup = async () => {
      const { data: { session } } = await getSessionSingleFlight();
      const uid = userId || session?.user?.id;
      if (!uid || !mounted) {
        console.warn('useBuzzMapPricingNew: realtime not started — no user id');
        return;
      }

      const currentWeek = getCurrentWeekOfYear();

      console.log('🔔 useBuzzMapPricingNew: Subscribing for user:', uid);

      channel = supabase
        .channel(`buzz_map_pricing_updates_${uid}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'user_map_areas',
            filter: `user_id=eq.${uid}`
          },
          (payload) => {
            console.log('🔔 useBuzzMapPricingNew: New area inserted, checking week:', payload);
            // Only refresh if it's a buzz_map area for current week
            if (payload.new?.source === 'buzz_map' && payload.new?.week === currentWeek) {
              console.log('✅ useBuzzMapPricingNew: Relevant area for current week, refreshing pricing');
              calculateNextLevel();
            }
          }
        )
        .subscribe();
    };

    setup();

    return () => {
      mounted = false;
      if (channel) {
        console.log('🔔 useBuzzMapPricingNew: Unsubscribing from realtime');
        supabase.removeChannel(channel);
      }
    };
  }, [authReady, userId, calculateNextLevel]);

  // 🔥 FALLBACK: Listen to custom event from BuzzMapButtonSecure
  useEffect(() => {
    const handleBuzzAreaCreated = () => {
      console.log('🎉 useBuzzMapPricingNew: Received buzzAreaCreated event, refreshing pricing');
      calculateNextLevel();
    };

    window.addEventListener('buzzAreaCreated', handleBuzzAreaCreated);
    return () => window.removeEventListener('buzzAreaCreated', handleBuzzAreaCreated);
  }, [calculateNextLevel]);

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
