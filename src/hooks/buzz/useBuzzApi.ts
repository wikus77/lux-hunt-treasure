
import { useState } from 'react';
import { toast } from 'sonner';
import { useTestMode } from '@/hooks/useTestMode';
import { useFakePayment } from '@/hooks/useFakePayment';

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
  const { isTestMode, isDeveloperUser, testLocation, generateVentimigliaClue } = useTestMode();
  const { hasFakePaymentCompleted } = useFakePayment();

  const callBuzzApi = async (params: BuzzApiParams): Promise<BuzzApiResponse> => {
    setLoading(true);
    
    try {
      // TEST MODE: Simula risposta API per developer
      if (isTestMode && isDeveloperUser) {
        console.log('🔧 BUZZ API TEST MODE: Generazione contenuto Ventimiglia');
        
        // Simula processing time
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        const buzzCount = Math.floor(Math.random() * 100) + 1;
        const clueText = generateVentimigliaClue(buzzCount);
        
        if (params.generateMap) {
          // Simula generazione mappa per Ventimiglia
          const response: BuzzApiResponse = {
            success: true,
            clue_text: clueText,
            radius_km: 1.5 + (Math.random() * 2), // Raggio variabile 1.5-3.5km
            lat: testLocation.lat + (Math.random() - 0.5) * 0.01, // Piccola variazione
            lng: testLocation.lng + (Math.random() - 0.5) * 0.01,
            generation_number: buzzCount
          };
          
          console.log('✅ BUZZ API TEST: Mappa generata per Ventimiglia', response);
          return response;
        } else {
          // Simula generazione indizio normale
          const response: BuzzApiResponse = {
            success: true,
            clue_text: clueText,
            generation_number: buzzCount
          };
          
          console.log('✅ BUZZ API TEST: Indizio generato per Ventimiglia', response);
          return response;
        }
      }
      
      // PRODUZIONE: Chiama API reale (quando non in test mode)
      console.log('📡 BUZZ API: Chiamata API reale...');
      
      // Verifica pagamento (fake o reale)
      if (!hasFakePaymentCompleted()) {
        return {
          success: false,
          error: 'payment_required',
          errorMessage: 'Pagamento richiesto per utilizzare BUZZ'
        };
      }
      
      // Simula chiamata API reale per ora
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
