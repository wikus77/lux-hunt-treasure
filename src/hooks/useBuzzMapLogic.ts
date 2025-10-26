// © 2025 Joseph MULÉ – M1SSION™ – Tutti i diritti riservati
// M1SSION™ - BUZZ Map Logic Hook - RESET COMPLETO 17/07/2025

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/auth';
import { toast } from 'sonner';
import { emitReconnecting, emitSubscribed, emitError } from '@/lib/realtime/reconnectBus';

export interface BuzzMapArea {
  id: string;
  lat: number;
  lng: number;
  radius_km: number;
  coordinates: { lat: number; lng: number };
  radius: number;
  color: string;
  colorName: string;
  week: number;
  generation: number;
  isActive: boolean;
  user_id: string;
  created_at: string;
}

export const useBuzzMapLogic = () => {
  const { user } = useAuthContext();
  const [currentWeekAreas, setCurrentWeekAreas] = useState<BuzzMapArea[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchCurrentWeekAreas = async () => {
    if (!user?.id) {
      console.log('❌ useBuzzMapLogic: No user ID, clearing areas');
      setCurrentWeekAreas([]); // CLEAR ILLEGAL AREAS
      return;
    }
    
    console.log('🔄 useBuzzMapLogic: Checking authorization for user:', user.id);
    setLoading(true);
    
    try {
      // 🔥 STEP 1: Check for active BUZZ game targets (not regular prizes)
      const { data: gameTargets, error: targetError } = await supabase
        .from('buzz_game_targets')
        .select('*')
        .eq('is_active', true);

      console.log('🎯 BUZZ GAME TARGETS CHECK:', { 
        count: gameTargets?.length || 0, 
        targets: gameTargets,
        error: targetError 
      });

      if (targetError) {
        console.error('❌ GAME TARGETS ERROR:', targetError);
        setError(targetError);
        setCurrentWeekAreas([]);
        setLoading(false);
        return;
      }

      // Validate that targets have proper coordinates
      const validTargets = gameTargets?.filter(target => 
        target.lat && target.lon && 
        target.lat !== 0 && target.lon !== 0 &&
        Math.abs(target.lat) <= 90 && Math.abs(target.lon) <= 180
      ) || [];

      console.log('🧭 VALID TARGETS CHECK:', { 
        total: gameTargets?.length || 0,
        valid: validTargets.length,
        validTargets: validTargets.map(t => ({ id: t.id, lat: t.lat, lon: t.lon, city: t.city }))
      });

      if (validTargets.length === 0) {
        console.warn('🚨 NO VALID BUZZ GAME TARGETS - CLEARING ALL AREAS');
        setCurrentWeekAreas([]);
        setLoading(false);
        return;
      }
      
      // 🔥 STEP 2: Check for BUZZ MAP payments (ONLY succeeded)
      const { data: payments, error: paymentError } = await supabase
        .from('payment_transactions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'succeeded') // ONLY succeeded payments
        .or('description.ilike.%Buzz Map%,description.ilike.%BUZZ MAPPA%') // Match all variants
        .gte('created_at', '2025-07-17T00:00:00Z');

      console.log('💳 BUZZ MAP PAYMENTS CHECK (RESTORED):', { 
        count: payments?.length || 0, 
        payments: payments?.map(p => ({ id: p.id, status: p.status, amount: p.amount, description: p.description })),
        error: paymentError,
        query: "Looking for completed 'M1SSION™ Buzz Map' payments since 2025-07-17"
      });

      if (paymentError) {
        console.error('❌ PAYMENTS ERROR:', paymentError);
        setError(paymentError);
        setCurrentWeekAreas([]);
        setLoading(false);
        return;
      }

      // 🚨 CRITICAL: Must have completed BUZZ MAP payments to show areas
      if (!payments || payments.length === 0) {
        console.warn('🚨 NO COMPLETED BUZZ MAP PAYMENTS - CLEARING ALL AREAS');
        console.warn('[PAYMENT VALIDATION] No valid payments found - areas blocked until payment completed');
        setCurrentWeekAreas([]);
        setLoading(false);
        return;
      }

      // 🔥 STEP 3: Fetch user map areas (only after payment validation passed)
      const { data: userAreas, error: userAreasError } = await supabase
        .from('user_map_areas')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', '2025-07-17T00:00:00.000Z')
        .order('created_at', { ascending: false });

      console.log('🗺️ USER MAP AREAS CHECK (POST-PAYMENT):', { 
        count: userAreas?.length || 0, 
        areas: userAreas?.map(a => ({ id: a.id, lat: a.lat, lng: a.lng, radius_km: a.radius_km, created_at: a.created_at })),
        error: userAreasError,
        query: "Post-payment validation - fetching user_map_areas"
      });

      if (userAreasError) {
        console.error('❌ USER AREAS ERROR:', userAreasError);
        setError(userAreasError);
        setCurrentWeekAreas([]);
        setLoading(false);
        return;
      }

      // 🚨 CRITICAL: Check if user has map areas after payment validation
      if (!userAreas || userAreas.length === 0) {
        console.warn('🚨 NO USER MAP AREAS FOUND (POST-PAYMENT VALIDATION)');
        setCurrentWeekAreas([]);
        setLoading(false);
        return;
      }

      // 🔥 STEP 3: Transform areas that exist (using data from previous step)
      console.log('✅ useBuzzMapLogic: Raw data from user_map_areas (post 2025-07-17):', userAreas);

      // Transform user areas for display with PROPER RADIUS LOGGING
      const transformedAreas: BuzzMapArea[] = userAreas.map((area, index) => {
        console.log(`🗺️ BUZZ AREA DEBUG: Area ${area.id} - radius_km: ${area.radius_km}, lat: ${area.lat}, lng: ${area.lng}`);
        
        // 🚨 REMOVED: No duplicate toast here - only from edge function after payment
        
        return {
          id: area.id,
          lat: area.lat,
          lng: area.lng,
          radius_km: area.radius_km,
          coordinates: { lat: area.lat, lng: area.lng },
          radius: area.radius_km * 1000, // Convert to meters for map display
          color: '#00FFFF',
          colorName: 'cyan',
          week: area.week || 1,
          generation: index + 1,
          isActive: true,
          user_id: area.user_id,
          created_at: area.created_at || new Date().toISOString()
        };
      });

      console.log('✅ useBuzzMapLogic: Setting authorized areas:', transformedAreas.length);
      setCurrentWeekAreas(transformedAreas);
      setError(null);
      
    } catch (err) {
      console.error('❌ useBuzzMapLogic: Exception fetching areas:', err);
      setError(err as Error);
      setCurrentWeekAreas([]); // CLEAR ON ERROR
    } finally {
      setLoading(false);
    }
  };

  const reloadAreas = () => {
    console.log('🔄 useBuzzMapLogic: Manual reload triggered');
    fetchCurrentWeekAreas();
  };

  // CRITICAL: Auto-fetch on user change but respect payment requirements AND active prizes
  useEffect(() => {
    fetchCurrentWeekAreas();
    
    // Set up real-time subscription for new areas
    if (user?.id) {
      console.log('🔔 useBuzzMapLogic: Setting up real-time subscription for user:', user.id);
      
      const channel = supabase
        .channel('user_map_areas_changes')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'user_map_areas',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            console.log('🔔 useBuzzMapLogic: New area inserted via real-time:', payload);
            fetchCurrentWeekAreas(); // Refresh with payment verification
            
            // Trigger map auto-center via custom event
            if (payload.new) {
              console.log('📍 useBuzzMapLogic: Broadcasting area creation event');
              window.dispatchEvent(new CustomEvent('buzzAreaCreated', {
                detail: {
                  lat: payload.new.lat,
                  lng: payload.new.lng,
                  radius_km: payload.new.radius_km
                }
              }));
            }
          }
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            emitSubscribed('user_map_areas_changes');
            console.log('✅ Subscribed to user_map_areas_changes');
          } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
            emitError(String(status), 'user_map_areas_changes');
          }
        });

      return () => {
        console.log('🔔 useBuzzMapLogic: Unsubscribing from real-time');
        channel.unsubscribe();
      };
    }
  }, [user?.id]);

  return {
    areas: currentWeekAreas,
    loading,
    error: error || new Error('No error'),
    currentWeekAreas,
    reloadAreas
  };
};
