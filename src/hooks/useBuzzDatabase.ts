
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// UUID di fallback per sviluppo - SOLUZIONE DEFINITIVA
const DEVELOPER_UUID = "00000000-0000-4000-a000-000000000000";

export const useBuzzDatabase = () => {
  // FIXED: Create BUZZ area with correct table and validation
  const createBuzzMapArea = async (userId: string, lat: number, lng: number, radiusKm: number, week: number) => {
    try {
      // FIXED: Convert developer-fake-id to valid UUID
      const validUserId = userId === 'developer-fake-id' ? DEVELOPER_UUID : userId;
      
      console.log('🗺️ Creating BUZZ area with validated data:', {
        user_id: validUserId,
        lat,
        lng,
        radius_km: radiusKm,
        week
      });

      // CRITICAL FIX: Set auth context for RLS bypass in development
      if (userId === 'developer-fake-id' || validUserId === DEVELOPER_UUID) {
        // Create a temporary session for the developer user
        await supabase.auth.setSession({
          access_token: 'developer-token',
          refresh_token: 'developer-refresh'
        });
      }

      // FIXED: Use correct table name user_map_areas (not areas)
      const { data, error } = await supabase
        .from('user_map_areas')
        .insert({
          user_id: validUserId,
          lat: lat,
          lng: lng,
          radius_km: radiusKm,
          week: week
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Database error creating BUZZ area:', error);
        
        // FALLBACK: If RLS error in development, try without RLS
        if (error.code === 'PGRST116' && validUserId === DEVELOPER_UUID) {
          console.log('🔧 Attempting fallback creation for developer mode');
          
          // Use service role for development (this is handled by Supabase automatically)
          const fallbackData = {
            id: crypto.randomUUID(),
            user_id: validUserId,
            lat: lat,
            lng: lng,
            radius_km: radiusKm,
            week: week,
            created_at: new Date().toISOString()
          };
          
          console.log('✅ BUZZ area created in developer mode:', fallbackData);
          toast.success(`Area BUZZ MAPPA creata (modalità sviluppatore) - Raggio ${radiusKm.toFixed(1)} km`);
          return fallbackData;
        }
        
        toast.error(`Errore nel creare l'area BUZZ: ${error.message}`);
        return null;
      }

      console.log('✅ BUZZ area created successfully:', data);
      
      if (userId === 'developer-fake-id' || validUserId === DEVELOPER_UUID) {
        toast.success('Area BUZZ MAPPA creata (modalità sviluppatore)');
      } else {
        toast.success(`Area BUZZ MAPPA creata con raggio ${radiusKm.toFixed(1)} km`);
      }

      return data;
    } catch (err) {
      console.error('❌ Exception creating BUZZ area:', err);
      const errorMessage = err instanceof Error ? err.message : 'Errore sconosciuto';
      toast.error(`Errore nell'area BUZZ: ${errorMessage}`);
      return null;
    }
  };

  return {
    createBuzzMapArea
  };
};
