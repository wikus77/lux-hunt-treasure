
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/auth';

interface BuzzApiParams {
  userId: string;
  generateMap?: boolean;
}

interface BuzzApiResponse {
  success: boolean;
  clue_text?: string;
  error?: string;
  errorMessage?: string;
}

export const useBuzzApi = () => {
  const { getCurrentUser } = useAuthContext();

  const callBuzzApi = useCallback(async (params: BuzzApiParams): Promise<BuzzApiResponse> => {
    const currentUser = getCurrentUser();
    const isDeveloper = currentUser?.email === 'wikus77@hotmail.it';
    const hasDeveloperAccess = localStorage.getItem('developer_access') === 'granted';

    // CRITICAL: Developer bypass
    if (isDeveloper || hasDeveloperAccess) {
      console.log('🔧 Developer mode: Generating mock BUZZ response');
      
      const mockClue = `Indizio DEVELOPER generato alle ${new Date().toLocaleTimeString()} - Cerca nella zona di testing per il lancio M1SSION`;
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      return {
        success: true,
        clue_text: mockClue
      };
    }

    // CRITICAL: Validate user ID
    if (!params.userId) {
      console.error('❌ BUZZ API: No user ID provided');
      return {
        success: false,
        errorMessage: 'User ID richiesto per BUZZ API'
      };
    }

    try {
      console.log('🚀 Calling BUZZ API with params:', params);

      // Call the appropriate edge function
      const functionName = params.generateMap ? 'generate-weekly-buzz' : 'generate-weekly-buzz';
      
      const { data, error } = await supabase.functions.invoke(functionName, {
        body: {
          user_id: params.userId,
          generate_map: params.generateMap || false
        }
      });

      if (error) {
        console.error('❌ BUZZ API Error:', error);
        return {
          success: false,
          errorMessage: error.message || 'Errore chiamata BUZZ API'
        };
      }

      console.log('✅ BUZZ API Response:', data);

      return {
        success: true,
        clue_text: data?.clue_text || data?.message || 'Indizio generato con successo'
      };

    } catch (error) {
      console.error('❌ BUZZ API Exception:', error);
      return {
        success: false,
        errorMessage: error instanceof Error ? error.message : 'Errore sconosciuto BUZZ API'
      };
    }
  }, [getCurrentUser]);

  return {
    callBuzzApi
  };
};
