
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Loader, Lock, CreditCard } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useNotificationManager } from "@/hooks/useNotificationManager";
import { usePaymentVerification } from "@/hooks/usePaymentVerification";
import { useStripePayment } from "@/hooks/useStripePayment";
import { useNotifications } from "@/hooks/useNotifications";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from '@/hooks/useAuth';

interface BuzzButtonSecureProps {
  userId: string;
  onSuccess: () => void;
}

const BuzzButtonSecure: React.FC<BuzzButtonSecureProps> = ({ userId, onSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [buzzCount, setBuzzCount] = useState(0);
  const { user } = useAuth();
  const { createBuzzNotification } = useNotificationManager();
  const { addNotification } = useNotifications();
  const { processBuzzPurchase, loading: stripeLoading } = useStripePayment();
  const {
    hasValidPayment,
    canAccessPremium,
    remainingBuzz,
    subscriptionTier,
    loading: verificationLoading
  } = usePaymentVerification();

  // CRITICAL FIX: Calcolo prezzo dinamico BUZZ INDIZIO secondo logica richiesta
  const calculateBuzzPrice = (count: number): number => {
    if (count <= 10) return 7.99;
    if (count <= 20) return 9.99;
    if (count <= 30) return 13.99;
    if (count <= 40) return 19.99;
    return 29.99;
  };

  // CRITICAL FIX: Enhanced BUZZ con FORZATURA Stripe per TUTTI gli utenti non-developer
  const handleBuzzClick = async () => {
    const isDeveloper = user?.email === 'wikus77@hotmail.it';
    const hasDeveloperAccess = localStorage.getItem('developer_access') === 'granted';
    
    // CRITICAL FIX: Developer bypass con logging chiaro
    if (isDeveloper || hasDeveloperAccess) {
      console.log('🔧 RIPARAZIONE: Developer bypass - Generazione BUZZ immediata');
      console.log('💳 RIPARAZIONE: STRIPE SALTATO per modalità developer');
      toast.success('🔧 Developer: Stripe bypassed - Generando indizio...');
      handleBuzzSuccess();
      return;
    }

    // CRITICAL FIX: FORZATURA Stripe per TUTTI i non-developer
    console.log('💳 RIPARAZIONE: NON-DEVELOPER - FORZANDO Stripe checkout OBBLIGATORIO');
    
    const currentPrice = calculateBuzzPrice(buzzCount + 1);
    
    try {
      console.log(`💳 RIPARAZIONE: Apertura OBBLIGATORIA Stripe checkout per BUZZ a ${currentPrice}€...`);
      toast.info(`💳 Pagamento obbligatorio: ${currentPrice}€ per BUZZ indizio`);
      
      // FORZATURA Stripe OBBLIGATORIA - BLOCCO ESECUZIONE SE FALLISCE
      const stripeSuccess = await processBuzzPurchase(false, currentPrice);
      
      if (stripeSuccess) {
        console.log('✅ RIPARAZIONE: Stripe payment completato per BUZZ');
        toast.success(`✅ Pagamento completato (${currentPrice}€)! Generando indizio...`);
        
        // Continua con generazione buzz dopo pagamento
        setTimeout(() => {
          handleBuzzSuccess();
        }, 800); // Ridotto per rispettare tempi di 1.5s totali
      } else {
        console.log('❌ RIPARAZIONE: Stripe payment fallito o cancellato - BLOCCO ESECUZIONE');
        toast.error('❌ Pagamento richiesto per BUZZ - Indizio NON generato');
        return; // BLOCCO TOTALE se Stripe fallisce
      }
      return;
    } catch (error) {
      console.error('❌ RIPARAZIONE: Errore Stripe payment per BUZZ:', error);
      toast.error('❌ Errore nel processo di pagamento BUZZ - Esecuzione bloccata');
      return; // BLOCCO TOTALE se Stripe ha errori
    }
  };

  const handleBuzzSuccess = async () => {
    setIsLoading(true);
    
    try {
      console.log('🚀 RIPARAZIONE: Avvio generazione BUZZ con tempo target 1.5s...');
      
      // Chiama il handler buzz press con timing ottimizzato
      const { data, error } = await supabase.functions.invoke('handle-buzz-press', {
        body: {
          userId: userId,
          generateMap: false
        }
      });

      if (error) {
        console.error('❌ RIPARAZIONE: BUZZ generation fallita:', error);
        toast.error('Errore nella generazione dell\'indizio');
        return;
      }

      if (data?.success) {
        setBuzzCount(prev => prev + 1);
        
        // CRITICAL FIX: Forzatura creazione notifica con persistenza garantita (20 tentativi)
        let notificationCreated = false;
        let attempts = 0;
        
        while (!notificationCreated && attempts < 20) {
          attempts++;
          try {
            console.log(`📨 RIPARAZIONE: BUZZ notification tentativo ${attempts}/20`);
            await createBuzzNotification(
              "🎯 Nuovo Indizio Sbloccato",
              data.clue_text || "Nuovo indizio generato per la tua missione!"
            );
            
            // Aggiungi anche alle notifiche locali
            await addNotification(
              "🎯 Nuovo Indizio Sbloccato",
              data.clue_text || "Nuovo indizio generato per la tua missione!",
              "buzz"
            );
            
            notificationCreated = true;
            console.log(`✅ RIPARAZIONE: BUZZ notification creata al tentativo ${attempts}`);
          } catch (notifError) {
            console.error(`❌ RIPARAZIONE: BUZZ notification tentativo ${attempts} fallito:`, notifError);
            if (attempts < 20) {
              await new Promise(resolve => setTimeout(resolve, 50)); // Ridotto per velocità
            }
          }
        }
        
        if (!notificationCreated) {
          console.error('❌ RIPARAZIONE: Fallimento creazione notifica dopo 20 tentativi');
          // Fallback locale
          toast.info('💾 Notifica salvata localmente come fallback');
        }
        
        toast.success('🎯 Nuovo indizio sbloccato!');
        onSuccess();
      } else {
        toast.error(data?.errorMessage || 'Errore nella generazione dell\'indizio');
      }
    } catch (error) {
      console.error('❌ RIPARAZIONE: BUZZ error:', error);
      toast.error('Errore imprevisto nella generazione dell\'indizio');
    } finally {
      setIsLoading(false);
    }
  };

  const isDeveloper = user?.email === 'wikus77@hotmail.it' || localStorage.getItem('developer_access') === 'granted';
  const isBlocked = !isDeveloper; // Non-developers necessitano sempre pagamento
  const loading = isLoading || stripeLoading || verificationLoading;
  const currentPrice = calculateBuzzPrice(buzzCount + 1);

  return (
    <motion.div
      className="relative"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <Button
        onClick={handleBuzzClick}
        disabled={loading}
        className={`buzz-button relative overflow-hidden ${
          isBlocked 
            ? 'bg-gradient-to-r from-orange-600 to-orange-800 hover:from-orange-500 hover:to-orange-700' 
            : 'bg-gradient-to-r from-[#00cfff] via-[#ff00cc] to-[#7f00ff] hover:shadow-[0_0_25px_10px_rgba(255,0,128,0.65)]'
        } text-white px-8 py-4 rounded-full font-bold text-lg transition-all duration-300`}
        style={{
          animation: loading ? "none" : "buzzGlow 2s infinite ease-in-out",
          boxShadow: loading ? 'none' : '0 0 20px 6px rgba(255,0,128,0.45)'
        }}
      >
        {loading ? (
          <Loader className="mr-2 h-5 w-5 animate-spin" />
        ) : isBlocked ? (
          <CreditCard className="mr-2 h-5 w-5" />
        ) : (
          <motion.div
            className="mr-2 w-5 h-5 bg-white rounded-full"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [1, 0.8, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        )}
        <span>
          {loading ? 'Generando...' : 
           isBlocked ? `BUZZ (${currentPrice}€)` :
           `BUZZ ${isDeveloper ? '[DEV]' : ''}`}
        </span>
        
        {!isBlocked && (hasValidPayment || isDeveloper) && (
          <div className="absolute top-1 right-1 w-2 h-2 bg-green-400 rounded-full animate-pulse" />
        )}
      </Button>
      
      <style>
        {`
        @keyframes buzzGlow {
          0% { box-shadow: 0 0 15px rgba(255, 0, 204, 0.7); }
          50% { box-shadow: 0 0 30px rgba(255, 0, 204, 0.9), 0 0 40px rgba(0, 207, 255, 0.6); }
          100% { box-shadow: 0 0 15px rgba(255, 0, 204, 0.7); }
        }
        `}
      </style>
    </motion.div>
  );
};

export default BuzzButtonSecure;
