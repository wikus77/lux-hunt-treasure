
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
  
  // ✅ FIXED: Always call useGameRules hook before any conditional logic
  const gameRulesHook = useGameRules();
  
  const [testConfig, setTestConfig] = useState<TestModeConfig>({
    isTestMode: false,
    isDeveloperUser: false,
    testLocation: {
      lat: 43.7915,
      lng: 7.6089,
      address: 'Area di ricerca - Costa del confine'
    },
    fakePaymentEnabled: false,
    strictGameRules: true
  });

  useEffect(() => {
    const checkDeveloperMode = () => {
      const isDev = user?.email === 'wikus77@hotmail.it';
      
      if (isDev) {
        setTestConfig({
          isTestMode: false,
          isDeveloperUser: true,
          testLocation: {
            lat: 43.7915,
            lng: 7.6089,
            address: 'Area di ricerca - Costa mediterranea'
          },
          fakePaymentEnabled: true,
          strictGameRules: true
        });
        
        console.log('🔧 DEVELOPER BLACK MODE - LANCIO 19 LUGLIO: Regole di gioco UFFICIALI attivate per', user.email);
        console.log('📍 Area test LANCIO: NESSUN NOME CITTÀ negli indizi');
      }
    };

    checkDeveloperMode();
  }, [user]);

  const generateSecureClue = (buzzCount: number): string => {
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
    
    const index = (Date.now() + buzzCount) % launchSecureClues.length;
    return launchSecureClues[index];
  };

  return {
    ...testConfig,
    generateSecureClue,
    validateClueContent: gameRulesHook.validateClueContent
  };
};
