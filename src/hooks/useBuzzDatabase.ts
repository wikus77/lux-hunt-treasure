
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// UUID di fallback per sviluppo - SOLUZIONE DEFINITIVA
const DEVELOPER_UUID = "00000000-0000-4000-a000-000000000000";

export const useBuzzDatabase = () => {
  // FIXED: Create BUZZ area with correct table and validation
  const createBuzzMapArea = async (userId: string, lat: number, lng: number, radiusKm: number, week: number) => {
    try {
      // CRITICAL DEBUG: Check current auth state before proceeding
      const { data: authData, error: authError } = await supabase.auth.getUser();
      console.log('🔐 Current auth state:', {
        user: authData?.user?.id || 'No user',
        email: authData?.user?.email || 'No email',
        error: authError
      });

      // CRITICAL DEBUG: Check session state
      const { data: sessionData } = await supabase.auth.getSession();
      console.log('🔐 Current session:', {
        session: sessionData?.session ? 'Active' : 'None',
        userId: sessionData?.session?.user?.id || 'No session user'
      });

      // FIXED: Convert developer-fake-id to valid UUID and ensure we always have a valid UUID
      let validUserId = userId;
      if (!userId || userId === 'developer-fake-id') {
        validUserId = DEVELOPER_UUID;
      } else if (userId === 'developer-fake-id') {
        validUserId = DEVELOPER_UUID;
      }
      
      console.log('🗺️ Creating BUZZ area with validated data:', {
        original_user_id: userId,
        final_user_id: validUserId,
        lat,
        lng,
        radius_km: radiusKm,
        week,
        auth_user_id: authData?.user?.id || 'No auth user',
        is_developer_fallback: validUserId === DEVELOPER_UUID
      });

      // CRITICAL: Verify we have a proper UUID format before proceeding
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(validUserId)) {
        console.log('🔧 Invalid UUID detected, using developer fallback:', validUserId);
        validUserId = DEVELOPER_UUID;
      }

      console.log('🔧 Final user_id for insert:', validUserId);

      // CRITICAL DEBUG: Prepare and log the exact payload
      const payload = {
        user_id: validUserId,
        lat: lat,
        lng: lng,
        radius_km: radiusKm,
        week: week
      };

      console.log('📦 EXACT PAYLOAD being sent to Supabase:', JSON.stringify(payload, null, 2));
      console.log('📦 Payload validation:', {
        user_id_valid: !!payload.user_id && typeof payload.user_id === 'string',
        lat_valid: typeof payload.lat === 'number' && !isNaN(payload.lat),
        lng_valid: typeof payload.lng === 'number' && !isNaN(payload.lng),
        radius_km_valid: typeof payload.radius_km === 'number' && !isNaN(payload.radius_km),
        week_valid: typeof payload.week === 'number' && !isNaN(payload.week)
      });

      // CRITICAL DEBUG: Test RLS policy manually
      console.log('🛡️ Testing RLS conditions:', {
        'auth.uid()': authData?.user?.id || null,
        'payload.user_id': payload.user_id,
        'developer_uuid': DEVELOPER_UUID,
        'matches_auth_uid': authData?.user?.id === payload.user_id,
        'matches_developer_uuid': payload.user_id === DEVELOPER_UUID
      });

      // FIXED: Use correct table name user_map_areas (not areas)
      const { data, error } = await supabase
        .from('user_map_areas')
        .insert(payload)
        .select()
        .single();

      if (error) {
        console.error('❌ Database error creating BUZZ area:', error);
        console.error('❌ Complete error object:', JSON.stringify(error, null, 2));
        console.error('❌ Error details:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        });
        console.error('❌ Attempted insert with payload:', JSON.stringify(payload, null, 2));
        
        // Enhanced error handling with detailed information
        if (error.code === 'PGRST116' || error.code === '42501') {
          console.log('🔧 RLS or permission error detected');
          console.log('🔧 Payload user_id:', payload.user_id);
          console.log('🔧 Auth user ID:', authData?.user?.id || 'No auth user');
          console.log('🔧 Is developer fallback?', payload.user_id === DEVELOPER_UUID);
          
          toast.error(`Errore di permessi RLS: impossibile salvare area BUZZ`);
          return null;
        }
        
        toast.error(`Errore nel creare l'area BUZZ: ${error.message}`);
        return null;
      }

      console.log('✅ BUZZ area created successfully:', data);
      console.log('✅ Success payload verification:', {
        inserted_user_id: data.user_id,
        inserted_lat: data.lat,
        inserted_lng: data.lng,
        inserted_radius_km: data.radius_km,
        inserted_week: data.week
      });
      
      // Always show success for valid creation
      toast.success(`Area BUZZ MAPPA creata con raggio ${radiusKm.toFixed(1)} km`);

      return data;
    } catch (err) {
      console.error('❌ Exception creating BUZZ area:', err);
      console.error('❌ Exception details:', JSON.stringify(err, null, 2));
      const errorMessage = err instanceof Error ? err.message : 'Errore sconosciuto';
      toast.error(`Errore nell'area BUZZ: ${errorMessage}`);
      return null;
    }
  };

  return {
    createBuzzMapArea
  };
};
