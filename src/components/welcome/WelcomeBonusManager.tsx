// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Component: WelcomeBonusManager
// Gestisce la logica di quando mostrare il modal di benvenuto

import React from 'react';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';
import { useWelcomeBonus } from '@/hooks/useWelcomeBonus';
import WelcomeBonusModal from './WelcomeBonusModal';

/**
 * WelcomeBonusManager
 * 
 * Questo componente gestisce la visualizzazione del modal di benvenuto
 * che assegna 500 M1U al primo login/registrazione.
 * 
 * FLUSSO:
 * 1. Utente si registra/logga
 * 2. Completa eventuale onboarding (DNA quiz)
 * 3. Appare questo modal con il bonus
 * 4. Click su "BUONA CACCIA" → accredita 500 M1U
 * 5. Modal si chiude con animazione slot machine
 */
const WelcomeBonusManager: React.FC = () => {
  const { isAuthenticated, isLoading: authLoading } = useUnifiedAuth();
  const { needsBonus, isLoading: bonusLoading } = useWelcomeBonus();

  // Non renderizzare se:
  // 1. Auth ancora in caricamento
  // 2. Utente non autenticato
  // 3. Bonus già ricevuto o non necessario
  // 4. Bonus check ancora in caricamento
  if (authLoading || !isAuthenticated || bonusLoading || !needsBonus) {
    return null;
  }

  return <WelcomeBonusModal />;
};

export default WelcomeBonusManager;

// Export anche il modal per uso diretto in test pages
export { WelcomeBonusModal };


