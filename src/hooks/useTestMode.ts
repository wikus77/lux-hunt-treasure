
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
      address: 'Area di ricerca - Costa del confine' // NESSUN NOME CITTÀ
    },
    fakePaymentEnabled: false,
    strictGameRules: true // REGOLE FERREE ATTIVE PER LANCIO
  });

  useEffect(() => {
    const checkDeveloperMode = () => {
      const isDev = user?.email === 'wikus77@hotmail.it';
      
      if (isDev) {
        setTestConfig({
          isTestMode: false, // Modalità produzione STRICTA per LANCIO
          isDeveloperUser: true,
          testLocation: {
            lat: 43.7915,
            lng: 7.6089,
            address: 'Area di ricerca - Costa mediterranea' // GENERICO PER LANCIO
          },
          fakePaymentEnabled: true, // Pagamenti fittizi per test LANCIO
          strictGameRules: true // REGOLE FERREE LANCIO 19 LUGLIO
        });
        
        console.log('🔧 DEVELOPER BLACK MODE - LANCIO 19 LUGLIO: Regole di gioco UFFICIALI attivate per', user.email);
        console.log('📍 Area test LANCIO: NESSUN NOME CITTÀ negli indizi');
      }
    };

    checkDeveloperMode();
  }, [user]);

  const generateSecureClue = (buzzCount: number): string => {
    // INDIZI SEVERI: MAI nomi di città per LANCIO
    const launchSecureClues = [
      `La soluzione si nasconde dove due nazioni si incontrano, tra i giardini della frontiera (Missione #${buzzCount})`,
      `Cerca dove il mare bacia la terraferma, nei colori del ponente - ${new Date().toLocaleTimeString()}`,
      `Il segreto è custodito tra le palme di un viale principale, dove la costa profuma di libertà`,
      `La città di confine custodisce il tuo destino: segui la via dei mercati verso la verità`,
      `Tra fortificazioni antiche e centro storico, l'enigma ti attende al limite - Gen ${buzzCount}`,
      `La località dei fiori e dei mercati nasconde l'ultimo indizio della tua missione M1SSION™`,
      `Dal teatro storico alle vie del centro: la città costiera rivela i suoi segreti ai coraggiosi`,
      `Dove i treni attraversano i confini, la missione trova il suo compimento finale`,
      `Tra le mura di una città antica, il premio ti aspetta dove tramonta il sole`,
      `La costa del ponente nasconde tesori: cerca dove i giardini incontrano il mare`
    ];
    
    const index = (buzzCount + new Date().getHours()) % launchSecureClues.length;
    const selectedClue = launchSecureClues[index];
    
    // VALIDAZIONE SEVERISSIMA: Nessun nome città per LANCIO
    if (!validateClueContent(selectedClue)) {
      console.error('🚫 CLUE VALIDATION FAILED - LANCIO: Contiene nomi di città!');
      return `Indizio sicuro per il lancio generato alle ${new Date().toLocaleTimeString()} - Cerca nella zona di confine mediterranea`;
    }
    
    return selectedClue;
  };

  return {
    ...testConfig,
    generateSecureClue
  };
};
