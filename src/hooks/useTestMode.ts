
import { useState, useEffect } from 'react';
import { useAuthContext } from '@/contexts/auth';

interface TestModeConfig {
  isTestMode: boolean;
  isDeveloperUser: boolean;
  testLocation: {
    lat: number;
    lng: number;
    address: string;
  };
  fakePaymentEnabled: boolean;
}

export const useTestMode = () => {
  const { user } = useAuthContext();
  const [testConfig, setTestConfig] = useState<TestModeConfig>({
    isTestMode: false,
    isDeveloperUser: false,
    testLocation: {
      lat: 43.7915,
      lng: 7.6089,
      address: 'Corso Limone Piemonte 232, Ventimiglia (IM), Italia'
    },
    fakePaymentEnabled: false
  });

  useEffect(() => {
    const checkDeveloperMode = () => {
      const isDev = user?.email === 'wikus77@hotmail.it' || 
                   localStorage.getItem('developer_user_email') === 'wikus77@hotmail.it';
      
      if (isDev) {
        setTestConfig({
          isTestMode: true,
          isDeveloperUser: true,
          testLocation: {
            lat: 43.7915,
            lng: 7.6089,
            address: 'Corso Limone Piemonte 232, Ventimiglia (IM), Italia'
          },
          fakePaymentEnabled: true
        });
        
        console.log('🔧 TEST MODE ATTIVO: Localizzazione Ventimiglia e pagamento fittizio abilitati');
      }
    };

    checkDeveloperMode();
  }, [user]);

  const generateVentimigliaClue = (buzzCount: number): string => {
    const ventimigliaClues = [
      `La risposta si nasconde dove il Roya incontra il mare, tra i colori dei fiori di Ventimiglia (Indizio #${buzzCount})`,
      `Cerca dove l'Italia abbraccia la Francia, nei giardini della città di confine - ${new Date().toLocaleTimeString()}`,
      `Il segreto è custodito tra le palme di Corso Limone Piemonte, dove la Riviera dei Fiori profuma di mistero`,
      `Ventimiglia custodisce il tuo destino: segui la via dei limoni verso la soluzione finale`,
      `Tra il Forte dell'Annunziata e il centro storico, la verità ti attende sul confine - Gen ${buzzCount}`,
      `La città dei mercati e dei fiori nasconde l'ultimo indizio della tua missione M1SSION™`,
      `Dal teatro Romano alle vie del centro: Ventimiglia rivela i suoi segreti solo ai più coraggiosi`
    ];
    
    const index = (buzzCount + new Date().getHours()) % ventimigliaClues.length;
    return ventimigliaClues[index];
  };

  return {
    ...testConfig,
    generateVentimigliaClue
  };
};
