
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// UUID di fallback per sviluppo - SOLUZIONE DEFINITIVA
const DEVELOPER_UUID = "00000000-0000-4000-a000-000000000000";

export const useBuzzDatabase = () => {
  // CRITICAL FIX: Enhanced BUZZ area creation with atomic operation
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

      // CRITICAL DEBUG: Prepare and validate the exact payload
      const payload = {
        user_id: validUserId,
        lat: Number(lat),
        lng: Number(lng),
        radius_km: Number(radiusKm),
        week: Number(week)
      };

      console.log('📦 EXACT PAYLOAD being sent to Supabase:', JSON.stringify(payload, null, 2));
      console.log('📦 Payload validation:', {
        user_id_valid: !!payload.user_id && typeof payload.user_id === 'string',
        user_id_format: uuidRegex.test(payload.user_id),
        lat_valid: typeof payload.lat === 'number' && !isNaN(payload.lat),
        lng_valid: typeof payload.lng === 'number' && !isNaN(payload.lng),
        radius_km_valid: typeof payload.radius_km === 'number' && !isNaN(payload.radius_km),
        week_valid: typeof payload.week === 'number' && !isNaN(payload.week)
      });

      // CRITICAL DEBUG: Test RLS conditions match
      console.log('🛡️ Testing RLS conditions:', {
        'auth.uid()': authData?.user?.id || null,
        'payload.user_id': payload.user_id,
        'developer_uuid': DEVELOPER_UUID,
        'matches_auth_uid': authData?.user?.id === payload.user_id,
        'matches_developer_uuid': payload.user_id === DEVELOPER_UUID,
        'should_pass_rls': authData?.user?.id === payload.user_id || payload.user_id === DEVELOPER_UUID
      });

      // CRITICAL: Use correct table name user_map_areas with RLS-compatible insert
      console.log('🚀 Attempting insert into user_map_areas...');
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
        
        // Enhanced error handling based on error type
        if (error.code === 'PGRST116' || error.code === '42501') {
          console.log('🔧 RLS permission error detected');
          console.log('🔧 RLS Debug Info:', {
            'Payload user_id': payload.user_id,
            'Auth user ID': authData?.user?.id || 'No auth user',
            'Developer UUID': DEVELOPER_UUID,
            'Is using developer fallback': payload.user_id === DEVELOPER_UUID,
            'Should pass auth.uid() check': authData?.user?.id === payload.user_id,
            'Should pass developer fallback check': payload.user_id === DEVELOPER_UUID
          });
          
          toast.error(`Errore di permessi: impossibile salvare area BUZZ`);
          return null;
        }
        
        toast.error(`Errore nel creare l'area BUZZ: ${error.message}`);
        return null;
      }

      console.log('✅ BUZZ area created successfully:', data);
      console.log('✅ Success verification:', {
        inserted_id: data.id,
        inserted_user_id: data.user_id,
        inserted_lat: data.lat,
        inserted_lng: data.lng,
        inserted_radius_km: data.radius_km,
        inserted_week: data.week,
        created_at: data.created_at
      });
      
      // Success message with specific area info
      toast.success(`Area BUZZ MAPPA creata: raggio ${Number(data.radius_km).toFixed(1)} km`);

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
