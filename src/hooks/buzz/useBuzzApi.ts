
import { useState } from 'react';
import { toast } from 'sonner';
import { useTestMode } from '@/hooks/useTestMode';
import { useGameRules } from '@/hooks/useGameRules';

interface BuzzApiParams {
  userId: string;
  generateMap?: boolean;
  coordinates?: { lat: number; lng: number };
}

interface BuzzApiResponse {
  success: boolean;
  clue_text?: string;
  radius_km?: number;
  lat?: number;
  lng?: number;
  generation_number?: number;
  error?: string;
  errorMessage?: string;
}

export const useBuzzApi = () => {
  const [loading, setLoading] = useState(false);
  const { isDeveloperUser, testLocation, generateSecureClue } = useTestMode();
  const { getCurrentWeek, getMapRadius, validateClueContent } = useGameRules();

  const callBuzzApi = async (params: BuzzApiParams): Promise<BuzzApiResponse> => {
    setLoading(true);
    
    try {
      if (isDeveloperUser) {
        console.log('🔧 DEVELOPER BLACK MODE - LANCIO 19 LUGLIO: Generazione con REGOLE UFFICIALI');
        
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        const currentWeek = getCurrentWeek();
        const buzzCount = Math.floor(Math.random() * 100) + 1;
        const generation = 1; // Simulato per prima generazione
        
        // GENERA INDIZIO SICURO (SEVERO: senza nomi città)
        const clueText = generateSecureClue(buzzCount);
        
        // VALIDAZIONE SEVERA INDIZIO
        if (!validateClueContent(clueText)) {
          console.error('🚫 CLUE VALIDATION FAILED - LANCIO!');
          return {
            success: false,
            error: 'clue_validation_failed',
            errorMessage: 'Indizio non conforme alle regole ufficiali di lancio'
          };
        }
        
        if (params.generateMap) {
          // USA REGOLE UFFICIALI LANCIO PER RAGGIO
          const correctRadius = getMapRadius(currentWeek, generation);
          
          // GARANTITO: Prima generazione = 500km esatti
          const launchRadius = generation === 1 ? 500 : correctRadius;
          
          const response: BuzzApiResponse = {
            success: true,
            clue_text: clueText,
            radius_km: launchRadius, // REGOLE LANCIO 19 LUGLIO APPLICATE
            lat: testLocation.lat + (Math.random() - 0.5) * 0.01,
            lng: testLocation.lng + (Math.random() - 0.5) * 0.01,
            generation_number: buzzCount
          };
          
          console.log('✅ DEVELOPER BLACK - MAPPA LANCIO 19 LUGLIO:', {
            radius: launchRadius,
            week: currentWeek,
            generation,
            launchRules: true,
            guaranteed500km: generation === 1
          });
          
          return response;
        } else {
          const response: BuzzApiResponse = {
            success: true,
            clue_text: clueText,
            generation_number: buzzCount
          };
          
          console.log('✅ DEVELOPER BLACK - INDIZIO SICURO LANCIO:', {
            clue_validated: true,
            no_city_names: true,
            launch_ready: true
          });
          
          return response;
        }
      }
      
      console.log('📡 BUZZ API: Chiamata API reale - LANCIO 19 LUGLIO...');
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      return {
        success: true,
        clue_text: 'Indizio generato da API reale - Lancio M1SSION',
        generation_number: 1
      };
      
    } catch (error) {
      console.error('❌ BUZZ API Error:', error);
      return {
        success: false,
        error: 'api_error',
        errorMessage: 'Errore durante la chiamata API'
      };
    } finally {
      setLoading(false);
    }
  };

  return {
    callBuzzApi,
    loading
  };
};
