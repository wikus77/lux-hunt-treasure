
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

      // CRITICAL: Always use valid UUID for developer mode
      const finalUserId = validUserId || DEVELOPER_UUID;

      // FIXED: Use correct table name user_map_areas (not areas)
      const { data, error } = await supabase
        .from('user_map_areas')
        .insert({
          user_id: finalUserId,
          lat: lat,
          lng: lng,
          radius_km: radiusKm,
          week: week
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Database error creating BUZZ area:', error);
        
        // Enhanced error handling with detailed information
        if (error.code === 'PGRST116' || error.code === '42501') {
          console.log('🔧 RLS or permission error detected');
          console.log('🔧 User ID being used:', finalUserId);
          console.log('🔧 Auth user:', await supabase.auth.getUser());
          
          toast.error(`Errore di permessi: ${error.message}`);
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
