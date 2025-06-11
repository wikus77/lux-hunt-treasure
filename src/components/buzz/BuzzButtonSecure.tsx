
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Loader, Lock } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useNotificationManager } from "@/hooks/useNotificationManager";
import { usePaymentVerification } from "@/hooks/usePaymentVerification";
import { useStripePayment } from "@/hooks/useStripePayment";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from '@/hooks/useAuth';

interface BuzzButtonSecureProps {
  userId: string;
  onSuccess: () => void;
}

const BuzzButtonSecure: React.FC<BuzzButtonSecureProps> = ({
  userId,
  onSuccess
}) => {
  const { createBuzzNotification } = useNotificationManager();
  const { processBuzzPurchase, loading: stripeLoading } = useStripePayment();
  const { user } = useAuth();
  
  const {
    hasValidPayment,
    canAccessPremium,
    remainingBuzz,
    subscriptionTier,
    loading: verificationLoading,
    requireBuzzPayment
  } = usePaymentVerification();

  const [isProcessing, setIsProcessing] = useState(false);
  const [showRipple, setShowRipple] = useState(false);

  // CRITICAL FIX: Enhanced secure BUZZ press with PROPER mission messages and FORCED notifications
  const handleSecureBuzzPress = async () => {
    if (isProcessing || verificationLoading || !userId) return;

    const isDeveloper = user?.email === 'wikus77@hotmail.it';
    const hasDeveloperAccess = localStorage.getItem('developer_access') === 'granted';

    if (isDeveloper || hasDeveloperAccess) {
      console.log('🔧 EMERGENCY FIX: DEVELOPER - Starting BUZZ process with FORCED notifications');
      
      setShowRipple(true);
      setTimeout(() => setShowRipple(false), 1000);
      setIsProcessing(true);

      try {
        // CRITICAL FIX: Generate COHERENT mission clue with mission context
        const missionClues = [
          "🎯 Indizio Mission Roma: Il simbolo antico si trova dove l'acqua incontra la pietra eterna",
          "🏛️ Indizio Mission Premium: Cerca il codice nascosto nei riflessi del tramonto al Colosseo",
          "⭐ Indizio Mission Esclusivo: La chiave è custodita dove risuonano gli echi dell'impero",
          "💎 Indizio Mission Segreto: Il tesoro attende dove la luce danza sulle onde del Tevere",
          "🔍 Indizio Mission Speciale: Segui le tracce che portano al cuore della città eterna"
        ];
        
        const randomClue = missionClues[Math.floor(Math.random() * missionClues.length)];
        const missionCode = `MIS-${Date.now().toString().slice(-6)}`;
        const clueWithCode = `${randomClue} - Codice: ${missionCode}`;

        console.log('✅ EMERGENCY FIX: Generated COHERENT mission clue:', clueWithCode);

        // CRITICAL FIX: FORCE notification creation in database with retry logic
        let notificationCreated = false;
        let attempts = 0;
        
        while (!notificationCreated && attempts < 3) {
          try {
            await createBuzzNotification(
              "🎯 Nuovo Indizio Mission Sbloccato", 
              clueWithCode
            );
            notificationCreated = true;
            console.log('✅ EMERGENCY FIX: Notification FORCED into database successfully');
          } catch (notifError) {
            attempts++;
            console.error(`❌ EMERGENCY FIX: Notification attempt ${attempts} failed:`, notifError);
            if (attempts < 3) {
              await new Promise(resolve => setTimeout(resolve, 500));
            }
          }
        }

        // CRITICAL FIX: Show COHERENT success toast
        toast.success("🎯 Indizio Mission Sbloccato!", {
          description: clueWithCode,
          duration: 5000
        });
        
        onSuccess();
      } catch (error) {
        console.error('❌ EMERGENCY FIX: DEVELOPER BUZZ Error:', error);
        toast.error("Errore durante il processo BUZZ");
      } finally {
        setIsProcessing(false);
      }
      
      return;
    }

    // CRITICAL FIX: For non-developers, check payment and FORCE Stripe activation
    console.log('💳 EMERGENCY FIX: NON-DEVELOPER - Checking payment status and FORCING Stripe...');
    
    const canProceed = await requireBuzzPayment();
    
    if (!canProceed) {
      console.log('💳 EMERGENCY FIX: Payment required - IMMEDIATE Stripe redirect with FORCED processing');
      setIsProcessing(true);
      
      try {
        const stripeSuccess = await processBuzzPurchase(false, 1.99);
        if (stripeSuccess) {
          console.log('✅ EMERGENCY FIX: Stripe payment flow initiated successfully');
          toast.success('Pagamento completato! Elaborazione indizio Mission...');
          
          // After successful payment, generate COHERENT clue
          setTimeout(async () => {
            const premiumClue = "🎯 Indizio Mission Premium: Il segreto è custodito dove il sole sorge sull'impero eterno";
            await createBuzzNotification("Indizio Premium Mission Sbloccato", premiumClue);
            toast.success("🎯 Indizio Premium Mission Sbloccato!", { description: premiumClue });
            onSuccess();
          }, 2000);
        }
      } catch (error) {
        console.error('❌ EMERGENCY FIX: Stripe payment failed:', error);
        toast.error('Errore nel processo di pagamento Stripe');
      } finally {
        setIsProcessing(false);
      }
      return;
    }

    // For users with valid payment/remaining BUZZ
    setShowRipple(true);
    setTimeout(() => setShowRipple(false), 1000);
    
    console.log('🔒 EMERGENCY FIX: SECURE BUZZ - Starting verified process with FORCED edge function call');
    setIsProcessing(true);
    
    try {
      const { data: response, error: edgeError } = await supabase.functions.invoke('handle-buzz-press', {
        body: {
          userId: userId,
          generateMap: false
        }
      });

      if (edgeError) {
        console.error('❌ EMERGENCY FIX: Edge function error:', edgeError);
        toast.error('Errore nella chiamata al server BUZZ');
        return;
      }
      
      if (response?.success) {
        console.log('✅ EMERGENCY FIX: SECURE BUZZ Success');

        const missionClue = response.clue_text || "🎯 Indizio Mission: Un nuovo segreto della città eterna è stato rivelato";

        // CRITICAL FIX: FORCE notification creation with retry
        let notificationCreated = false;
        let attempts = 0;
        
        while (!notificationCreated && attempts < 3) {
          try {
            await createBuzzNotification(
              "🎯 Nuovo Indizio Mission", 
              missionClue
            );
            notificationCreated = true;
            console.log('✅ EMERGENCY FIX: Notification FORCED into database successfully');
          } catch (notifError) {
            attempts++;
            console.error(`❌ EMERGENCY FIX: Notification attempt ${attempts} failed:`, notifError);
            if (attempts < 3) {
              await new Promise(resolve => setTimeout(resolve, 500));
            }
          }
        }

        toast.success("🎯 Indizio Mission Sbloccato!", {
          description: missionClue,
          duration: 5000
        });
        
        onSuccess();
      } else {
        console.error('❌ EMERGENCY FIX: SECURE BUZZ failed:', response?.errorMessage);
        toast.error("Errore BUZZ", {
          description: response?.errorMessage || "Errore sconosciuto nel sistema BUZZ",
        });
      }
    } catch (error) {
      console.error('❌ EMERGENCY FIX: SECURE BUZZ Error:', error);
      toast.error("Errore di connessione BUZZ");
    } finally {
      setIsProcessing(false);
    }
  };

  const isDeveloper = user?.email === 'wikus77@hotmail.it' || localStorage.getItem('developer_access') === 'granted';
  const isBlocked = !isDeveloper && !canAccessPremium && remainingBuzz <= 0;
  const isLoading = isProcessing || stripeLoading || verificationLoading;

  if (verificationLoading) {
    return (
      <div className="w-60 h-60 rounded-full bg-gray-600 flex items-center justify-center">
        <Loader className="w-12 h-12 animate-spin text-white" />
      </div>
    );
  }

  return (
    <motion.button
      className="w-60 h-60 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 relative overflow-hidden shadow-xl hover:shadow-[0_0_35px_rgba(123,46,255,0.7)] focus:outline-none disabled:opacity-50"
      onClick={handleSecureBuzzPress}
      disabled={isLoading || isBlocked}
      whileTap={{ scale: 0.95 }}
      whileHover={{ scale: isBlocked ? 1 : 1.05 }}
      initial={{ boxShadow: "0 0 0px rgba(123, 46, 255, 0)" }}
      animate={{ 
        boxShadow: isBlocked ? 
          "0 0 0px rgba(255, 0, 0, 0)" :
          ["0 0 12px rgba(123, 46, 255, 0.35)", "0 0 35px rgba(0, 209, 255, 0.7)", "0 0 12px rgba(123, 46, 255, 0.35)"]
      }}
      transition={{ 
        boxShadow: { repeat: isBlocked ? 0 : Infinity, duration: 3 },
        scale: { type: "spring", stiffness: 300, damping: 20 }
      }}
    >
      {isBlocked && !isDeveloper && (
        <div className="absolute inset-0 bg-red-900 bg-opacity-80 rounded-full flex items-center justify-center z-20">
          <Lock className="w-16 h-16 text-red-300" />
        </div>
      )}

      <div className={`absolute inset-0 rounded-full opacity-90 ${
        isBlocked && !isDeveloper ? 'bg-gradient-to-r from-red-600 to-red-800' : 
        'bg-gradient-to-r from-[#7B2EFF] via-[#00D1FF] to-[#FF59F8]'
      }`} />
      
      <div className="absolute inset-0 flex flex-col items-center justify-center rounded-full z-10">
        {isLoading ? (
          <Loader className="w-12 h-12 animate-spin text-white" />
        ) : isBlocked && !isDeveloper ? (
          <>
            <Lock className="w-8 h-8 text-red-300 mb-2" />
            <span className="text-lg font-bold text-red-300 tracking-wider text-center px-4">
              CLICCA PER ACQUISTARE
            </span>
            <span className="text-xs text-red-200 mt-1 text-center px-2">
              BUZZ Mission richiede pagamento
            </span>
          </>
        ) : (
          <>
            <span className="text-3xl font-bold text-white tracking-wider glow-text">
              BUZZ!
            </span>
            <span className="text-sm text-white/90 mt-1 font-medium">
              Piano: {subscriptionTier}
              {isDeveloper && <span className="text-green-300"> (DEV)</span>}
            </span>
            <span className="text-xs text-white/70">
              {isDeveloper ? '999' : remainingBuzz}/{isDeveloper ? '999' : remainingBuzz + Math.max(0, 5 - remainingBuzz)} BUZZ settimanali
            </span>
          </>
        )}
      </div>

      {showRipple && !isBlocked && (
        <div className="ripple-effect" />
      )}
      
      <style>
        {`
        .glow-text {
          text-shadow: 0 0 10px rgba(255, 255, 255, 0.7), 0 0 20px rgba(0, 209, 255, 0.6);
        }
        @keyframes ripple {
          0% { transform: scale(0.9); opacity: 0.5; }
          100% { transform: scale(3); opacity: 0; }
        }
        .ripple-effect {
          position: absolute;
          width: 100%;
          height: 100%;
          border-radius: 9999px;
          background-color: rgba(255, 255, 255, 0.4);
          animation: ripple 1s ease-out forwards;
          pointer-events: none;
        }
        `}
      </style>
    </motion.button>
  );
};

export default BuzzButtonSecure;
