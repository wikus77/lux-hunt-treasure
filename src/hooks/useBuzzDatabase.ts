
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// UUID di fallback per sviluppo - SOLUZIONE DEFINITIVA
const DEVELOPER_UUID = "00000000-0000-4000-a000-000000000000";

export const useBuzzDatabase = () => {
  // FIXED: Create BUZZ area with correct table and validation
  const createBuzzMapArea = async (userId: string, lat: number, lng: number, radiusKm: number, week: number) => {
    try {
      // FIXED: Convert developer-fake-id to valid UUID and ensure we always have a valid UUID
      let validUserId = userId;
      if (!userId || userId === 'developer-fake-id') {
        validUserId = DEVELOPER_UUID;
      } else if (userId === 'developer-fake-id') {
        validUserId = DEVELOPER_UUID;
      }
      
      console.log('🗺️ Creating BUZZ area with validated data:', {
        user_id: validUserId,
        lat,
        lng,
        radius_km: radiusKm,
        week
      });

      // CRITICAL: Verify we have a proper UUID format before proceeding
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(validUserId)) {
        console.log('🔧 Invalid UUID detected, using developer fallback:', validUserId);
        validUserId = DEVELOPER_UUID;
      }

      console.log('🔧 Final user_id for insert:', validUserId);

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
        console.error('❌ Error details:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        });
        console.error('❌ Attempted insert with user_id:', validUserId);
        
        // Enhanced error handling with detailed information
        if (error.code === 'PGRST116' || error.code === '42501') {
          console.log('🔧 RLS or permission error detected');
          console.log('🔧 User ID being used:', validUserId);
          
          // Get current auth status
          const { data: authData } = await supabase.auth.getUser();
          console.log('🔧 Current auth user:', authData?.user?.id || 'No user authenticated');
          
          toast.error(`Errore di permessi RLS: impossibile salvare area BUZZ`);
          return null;
        }
        
        toast.error(`Errore nel creare l'area BUZZ: ${error.message}`);
        return null;
      }

      console.log('✅ BUZZ area created successfully:', data);
      
      // Always show success for valid creation
      toast.success(`Area BUZZ MAPPA creata con raggio ${radiusKm.toFixed(1)} km`);

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
