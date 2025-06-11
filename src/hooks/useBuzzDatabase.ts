
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// UUID di fallback per sviluppo - SOLUZIONE DEFINITIVA
const DEVELOPER_UUID = "00000000-0000-4000-a000-000000000000";

export const useBuzzDatabase = () => {
  // CRITICAL FIX: Enhanced BUZZ area creation with atomic operation and validation
  const createBuzzMapArea = async (userId: string, lat: number, lng: number, radiusKm: number, week: number) => {
    try {
      // CRITICAL DEBUG: Check current auth state before proceeding
      const { data: authData, error: authError } = await supabase.auth.getUser();
      console.log('🔐 Current auth state:', {
        user: authData?.user?.id || 'No user',
        email: authData?.user?.email || 'No email',
        error: authError
      });

      // FIXED: Convert and validate user_id with enhanced fallback logic
      let validUserId = userId;
      if (!userId || userId === 'developer-fake-id') {
        validUserId = DEVELOPER_UUID;
        console.log('🔧 Using developer UUID fallback for missing/invalid userId');
      }
      
      // CRITICAL: Verify we have a proper UUID format before proceeding
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(validUserId)) {
        console.log('🔧 Invalid UUID detected, using developer fallback:', validUserId);
        validUserId = DEVELOPER_UUID;
      }

      // CRITICAL: Validate user_id using the new database function
      const { data: validationResult, error: validationError } = await supabase
        .rpc('validate_buzz_user_id', { p_user_id: validUserId });

      if (validationError || !validationResult) {
        console.error('❌ User ID validation failed:', validationError);
        toast.error('Errore di validazione utente');
        return null;
      }

      console.log('🗺️ Creating BUZZ area with validated data:', {
        original_user_id: userId,
        final_user_id: validUserId,
        lat,
        lng,
        radius_km: radiusKm,
        week,
        auth_user_id: authData?.user?.id || 'No auth user',
        is_developer_fallback: validUserId === DEVELOPER_UUID,
        validation_passed: validationResult
      });

      // CRITICAL DEBUG: Prepare and validate the exact payload
      const payload = {
        user_id: validUserId,
        lat: Number(lat),
        lng: Number(lng),
        radius_km: Number(radiusKm),
        week: Number(week)
      };

      console.log('📦 EXACT PAYLOAD being sent to Supabase:', JSON.stringify(payload, null, 2));

      // CRITICAL: Use correct table name user_map_areas with validated user_id
      console.log('🚀 Attempting insert into user_map_areas...');
      const { data, error } = await supabase
        .from('user_map_areas')
        .insert(payload)
        .select()
        .single();

      if (error) {
        console.error('❌ Database error creating BUZZ area:', error);
        console.error('❌ Complete error object:', JSON.stringify(error, null, 2));
        
        // Enhanced error handling based on error type
        if (error.code === 'PGRST116' || error.code === '42501') {
          console.log('🔧 RLS permission error detected');
          toast.error(`Errore di permessi: impossibile salvare area BUZZ`);
          return null;
        }
        
        toast.error(`Errore nel creare l'area BUZZ: ${error.message}`);
        return null;
      }

      console.log('✅ BUZZ area created successfully:', data);
      
      // Success message with specific area info
      toast.success(`Area BUZZ MAPPA creata: raggio ${Number(data.radius_km).toFixed(1)} km`);

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
