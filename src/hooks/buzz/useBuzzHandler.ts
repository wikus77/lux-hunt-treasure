
// © 2025 Joseph MULÉ – M1SSION™ – Tutti i diritti riservati
// M1SSION™ - BUZZ Handler Hook - RESET COMPLETO 17/07/2025
import { useState } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/integrations/supabase/client';
import { useBuzzApi } from '@/hooks/buzz/useBuzzApi';
import { useCapacitorHardware } from '@/hooks/useCapacitorHardware';
import { useAbuseProtection } from './useAbuseProtection';
import { useUniversalStripePayment } from '@/hooks/useUniversalStripePayment';
import { useBuzzNotificationScheduler } from '@/hooks/useBuzzNotificationScheduler';

interface UseBuzzHandlerProps {
  currentPrice: number;
  onSuccess: () => void;
}

export function useBuzzHandler({ currentPrice, onSuccess }: UseBuzzHandlerProps) {
  const [buzzing, setBuzzing] = useState(false);
  const [showShockwave, setShowShockwave] = useState(false);
  const { user } = useAuth();
  const { vibrate } = useCapacitorHardware();
  const { checkAbuseAndLog } = useAbuseProtection();
  const { processBuzzPurchase, loading: paymentLoading } = useUniversalStripePayment();
  const { scheduleBuzzAvailableNotification } = useBuzzNotificationScheduler();

  const handleBuzz = async () => {
    console.log('🚀 BUZZ PRESSED - Start handleBuzz - RESET COMPLETO 17/07/2025', { 
      user: !!user, 
      currentPrice,
      timestamp: new Date().toISOString()
    });
    
    if (!user) {
      console.log('❌ BUZZ FAILED - Missing user');
      toast.error('Devi essere loggato per utilizzare BUZZ!');
      return;
    }
    
    try {
      setBuzzing(true);
      setShowShockwave(true);
      await vibrate(100);
      
      console.log('💰 BUZZ PRICE CHECK - RESET COMPLETO 17/07/2025', { currentPrice });
      
      // Check if blocked
      if (currentPrice === 0) {
        toast.error('BUZZ bloccato per oggi! Limite giornaliero raggiunto.');
        return;
      }
      
      // Check abuse protection
      const abuseResult = await checkAbuseAndLog(user.id);
      if (abuseResult.isBlocked) {
        toast.error(abuseResult.message!);
        return;
      }

      // 🚨 CRITICAL: Mostra direttamente il checkout per il pagamento obbligatorio
      console.log('💳 BUZZ: Aprendo Stripe checkout obbligatorio - FORCED FOR ALL - RESET COMPLETO 17/07/2025');
      
      // Apri Stripe checkout e FERMA l'esecuzione qui
      const checkoutOpened = await processBuzzPurchase(false, currentPrice);
      
      if (!checkoutOpened) {
        toast.error("Errore Stripe", {
          description: "Impossibile aprire il checkout. Riprova."
        });
        setBuzzing(false);
        setShowShockwave(false);
        return;
      }
      
      toast.info("Completa il pagamento", {
        description: `Paga €${currentPrice.toFixed(2)} per ottenere l'indizio BUZZ`,
        duration: 10000
      });
      
      // STOP QUI - Il resto avverrà dopo il pagamento via webhook
      setBuzzing(false);
      setShowShockwave(false);
      return;
      
      // NESSUNA AZIONE DIRETTA - Il tutto verrà gestito dal webhook Stripe
      console.log('🔔 BUZZ: User redirected to Stripe. Waiting for payment completion...');
      
    } catch (err) {
      console.error('❌ Error in handleBuzz - RESET COMPLETO 17/07/2025:', err);
      toast.error('Errore imprevisto durante BUZZ');
    } finally {
      setBuzzing(false);
    }
  };

  return {
    buzzing,
    showShockwave,
    handleBuzz
  };
}
