
import { useState, useEffect } from 'react';
import { useAuthContext } from '@/contexts/auth';
import { useGameRules } from './useGameRules';

interface TestModeConfig {
  isTestMode: boolean;
  isDeveloperUser: boolean;
  testLocation: {
    lat: number;
    lng: number;
    address: string;
  };
  fakePaymentEnabled: boolean;
  strictGameRules: boolean;
}

export const useTestMode = () => {
  const { user } = useAuthContext();
  const { validateClueContent } = useGameRules();
  
  const [testConfig, setTestConfig] = useState<TestModeConfig>({
    isTestMode: false,
    isDeveloperUser: false,
    testLocation: {
      lat: 43.7915,
      lng: 7.6089,
      address: 'Area di ricerca - Riviera Ligure' // NESSUN NOME CITTÀ
    },
    fakePaymentEnabled: false,
    strictGameRules: true // REGOLE FERREE ATTIVE
  });

  useEffect(() => {
    const checkDeveloperMode = () => {
      const isDev = user?.email === 'wikus77@hotmail.it';
      
      if (isDev) {
        setTestConfig({
          isTestMode: false, // Modalità produzione STRICTA
          isDeveloperUser: true,
          testLocation: {
            lat: 43.7915,
            lng: 7.6089,
            address: 'Area di ricerca - Riviera Ligure' // GENERICO
          },
          fakePaymentEnabled: true, // Pagamenti fittizi per test
          strictGameRules: true // REGOLE FERREE
        });
        
        console.log('🔧 DEVELOPER BLACK MODE: Regole di gioco STRICTE attivate per', user.email);
        console.log('📍 Area test: NESSUN NOME CITTÀ negli indizi');
      }
    };

    checkDeveloperMode();
  }, [user]);

  const generateSecureClue = (buzzCount: number): string => {
    // Indizi che NON menzionano MAI nomi di città
    const secureClues = [
      `La risposta si nasconde dove il mare incontra la terraferma, tra i colori dei fiori (Indizio #${buzzCount})`,
      `Cerca dove due nazioni si incontrano, nei giardini della frontiera - ${new Date().toLocaleTimeString()}`,
      `Il segreto è custodito tra le palme di un corso principale, dove la costa profuma di mistero`,
      `La città di confine custodisce il tuo destino: segui la via principale verso la soluzione`,
      `Tra fortificazioni antiche e centro storico, la verità ti attende al confine - Gen ${buzzCount}`,
      `La località dei mercati e dei fiori nasconde l'ultimo indizio della tua missione M1SSION™`,
      `Dal teatro antico alle vie del centro: la città costiera rivela i suoi segreti ai coraggiosi`
    ];
    
    const index = (buzzCount + new Date().getHours()) % secureClues.length;
    const selectedClue = secureClues[index];
    
    // VALIDAZIONE STRICTA: Nessun nome città
    if (!validateClueContent(selectedClue)) {
      console.error('🚫 CLUE VALIDATION FAILED: Contiene nomi di città!');
      return `Indizio sicuro generato alle ${new Date().toLocaleTimeString()} - Cerca nella zona di confine`;
    }
    
    return selectedClue;
  };

  return {
    ...testConfig,
    generateSecureClue
  };
};
