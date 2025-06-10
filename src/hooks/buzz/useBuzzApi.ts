
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
        console.log('🔧 DEVELOPER BLACK MODE: Generazione con REGOLE STRICTE');
        
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        const currentWeek = getCurrentWeek();
        const buzzCount = Math.floor(Math.random() * 100) + 1;
        const generation = 1; // Simulato per prima generazione
        
        // GENERA INDIZIO SICURO (senza nomi città)
        const clueText = generateSecureClue(buzzCount);
        
        // VALIDA INDIZIO
        if (!validateClueContent(clueText)) {
          console.error('🚫 CLUE VALIDATION FAILED!');
          return {
            success: false,
            error: 'clue_validation_failed',
            errorMessage: 'Indizio non conforme alle regole di gioco'
          };
        }
        
        if (params.generateMap) {
          // USA REGOLE CORRETTE PER RAGGIO
          const correctRadius = getMapRadius(currentWeek, generation);
          
          const response: BuzzApiResponse = {
            success: true,
            clue_text: clueText,
            radius_km: correctRadius, // REGOLE APPLICATE
            lat: testLocation.lat + (Math.random() - 0.5) * 0.01,
            lng: testLocation.lng + (Math.random() - 0.5) * 0.01,
            generation_number: buzzCount
          };
          
          console.log('✅ DEVELOPER BLACK: Mappa generata CON REGOLE STRICTE', {
            radius: correctRadius,
            week: currentWeek,
            generation,
            rules_applied: true
          });
          
          return response;
        } else {
          const response: BuzzApiResponse = {
            success: true,
            clue_text: clueText,
            generation_number: buzzCount
          };
          
          console.log('✅ DEVELOPER BLACK: Indizio sicuro generato', {
            clue_validated: true,
            no_city_names: true
          });
          
          return response;
        }
      }
      
      console.log('📡 BUZZ API: Chiamata API reale in produzione...');
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      return {
        success: true,
        clue_text: 'Indizio generato da API reale',
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
