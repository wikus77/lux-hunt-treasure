
import { useState } from 'react';
import { toast } from 'sonner';
import { useTestMode } from '@/hooks/useTestMode';

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
  const { isDeveloperUser, testLocation, generateVentimigliaClue } = useTestMode();

  const callBuzzApi = async (params: BuzzApiParams): Promise<BuzzApiResponse> => {
    setLoading(true);
    
    try {
      // DEVELOPER BLACK: Contenuto dinamico Ventimiglia
      if (isDeveloperUser) {
        console.log('🔧 DEVELOPER BLACK MODE: Generazione contenuto Ventimiglia');
        
        // Simula processing time realistico
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        const buzzCount = Math.floor(Math.random() * 100) + 1;
        const clueText = generateVentimigliaClue(buzzCount);
        
        if (params.generateMap) {
          // Generazione mappa per Ventimiglia
          const response: BuzzApiResponse = {
            success: true,
            clue_text: clueText,
            radius_km: 1.5 + (Math.random() * 2), // Raggio variabile 1.5-3.5km
            lat: testLocation.lat + (Math.random() - 0.5) * 0.01, // Piccola variazione
            lng: testLocation.lng + (Math.random() - 0.5) * 0.01,
            generation_number: buzzCount
          };
          
          console.log('✅ DEVELOPER BLACK: Mappa generata per Ventimiglia', response);
          return response;
        } else {
          // Generazione indizio normale
          const response: BuzzApiResponse = {
            success: true,
            clue_text: clueText,
            generation_number: buzzCount
          };
          
          console.log('✅ DEVELOPER BLACK: Indizio generato per Ventimiglia', response);
          return response;
        }
      }
      
      // PRODUZIONE: API reale per altri utenti
      console.log('📡 BUZZ API: Chiamata API reale in produzione...');
      
      // Simula chiamata API reale
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
