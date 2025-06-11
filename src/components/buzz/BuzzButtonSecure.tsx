
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Loader, Lock } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useBuzzApi } from "@/hooks/buzz/useBuzzApi";
import { useNotificationManager } from "@/hooks/useNotificationManager";
import { usePaymentVerification } from "@/hooks/usePaymentVerification";
import { useStripePayment } from "@/hooks/useStripePayment";
import { useTestMode } from "@/hooks/useTestMode";
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
  const { callBuzzApi } = useBuzzApi();
  const { createBuzzNotification } = useNotificationManager();
  const { processBuzzPurchase, loading: stripeLoading } = useStripePayment();
  const { isDeveloperUser } = useTestMode();
  const { user } = useAuth();
  
  const {
    hasValidPayment,
    canAccessPremium,
    remainingBuzz,
    subscriptionTier,
    loading: verificationLoading,
    requireBuzzPayment,
    logUnauthorizedAccess
  } = usePaymentVerification();

  const [isProcessing, setIsProcessing] = useState(false);
  const [showRipple, setShowRipple] = useState(false);
  const [buzzCost, setBuzzCost] = useState<number>(1.99);

  const handleSecureBuzzPress = async () => {
    if (isProcessing || verificationLoading || !userId) return;

    // FIXED: Proper developer detection
    const isDeveloper = user?.email === 'wikus77@hotmail.it' || isDeveloperUser;
    const hasDeveloperAccess = localStorage.getItem('developer_access') === 'granted';

    if (isDeveloper || hasDeveloperAccess) {
      console.log('🔧 DEVELOPER: Starting BUZZ process');
      
      setShowRipple(true);
      setTimeout(() => setShowRipple(false), 1000);
      setIsProcessing(true);

      try {
        // FIXED: Direct edge function call for BUZZ
        const { data: response, error: edgeError } = await supabase.functions.invoke('handle-buzz-press', {
          body: {
            userId: userId,
            generateMap: false
          }
        });

        if (edgeError) {
          console.error('❌ Edge function error:', edgeError);
          toast.error('Errore nella chiamata al server');
          return;
        }

        if (response?.success) {
          const dynamicClueContent = response.clue_text || 
            `Indizio Developer generato alle ${new Date().toLocaleTimeString()}`;
          
          console.log('✅ DEVELOPER BUZZ: Success', response);

          toast.success("🔧 Indizio Developer Sbloccato!", {
            description: dynamicClueContent,
          });
          
          await createBuzzNotification(
            "Nuovo Indizio Developer", 
            dynamicClueContent
          );
          
          onSuccess();
        } else {
          console.error('❌ DEVELOPER BUZZ: API failed', response?.errorMessage);
          toast.error("Errore", {
            description: response?.errorMessage || "Errore sconosciuto",
          });
        }
      } catch (error) {
        console.error('❌ DEVELOPER BUZZ Error:', error);
        toast.error("Errore", {
          description: "Errore durante il processo",
        });
      } finally {
        setIsProcessing(false);
      }
      
      return;
    }

    // FIXED: For non-developers, ENABLE Stripe flow
    console.log('💳 NON-DEVELOPER: Checking payment status...');
    
    const canProceed = await requireBuzzPayment();
    
    if (!canProceed && subscriptionTier === 'Free') {
      console.log('💳 Free plan detected, redirecting to Stripe payment...');
      setIsProcessing(true);
      
      try {
        await processBuzzPurchase(false, buzzCost);
        console.log('✅ Stripe payment flow initiated');
      } catch (error) {
        console.error('❌ Stripe payment failed:', error);
        toast.error('Errore nel processo di pagamento');
      } finally {
        setIsProcessing(false);
      }
      return;
    }

    if (!canProceed) {
      await logUnauthorizedAccess('buzz_blocked_no_payment', {
        subscriptionTier,
        remainingBuzz,
        hasValidPayment
      });
      return;
    }

    // For valid subscription users
    setShowRipple(true);
    setTimeout(() => setShowRipple(false), 1000);
    
    if (typeof window !== 'undefined' && window.plausible) {
      window.plausible('buzz_click');
    }
    
    console.log('🔒 SECURE BUZZ: Starting verified process for user:', userId);
    setIsProcessing(true);
    
    try {
      const { data: response, error: edgeError } = await supabase.functions.invoke('handle-buzz-press', {
        body: {
          userId: userId,
          generateMap: false
        }
      });

      if (edgeError) {
        console.error('❌ Edge function error:', edgeError);
        toast.error('Errore nella chiamata al server');
        return;
      }
      
      if (response?.success) {
        console.log('✅ SECURE BUZZ: Success');
        
        if (typeof window !== 'undefined' && window.plausible) {
          window.plausible('clue_unlocked');
        }

        const dynamicClueContent = response.clue_text || 
          `Indizio premium generato alle ${new Date().toLocaleTimeString()}`;

        toast.success("Indizio Premium Sbloccato!", {
          description: dynamicClueContent,
        });
        
        await createBuzzNotification(
          "Nuovo Indizio Premium", 
          dynamicClueContent
        );
        
        onSuccess();
      } else {
        console.error('❌ SECURE BUZZ: API response failed:', response?.errorMessage);
        const errorMessage = response?.errorMessage || "Errore sconosciuto";
        
        await logUnauthorizedAccess('buzz_api_failed', { errorMessage });
        
        toast.error("Errore", {
          description: errorMessage,
        });
      }
    } catch (error) {
      console.error('❌ SECURE BUZZ: Error during verified call:', error);
      
      await logUnauthorizedAccess('buzz_exception', { 
        error: error instanceof Error ? error.message : String(error) 
      });
      
      toast.error("Errore di connessione", {
        description: "Impossibile contattare il server. Riprova più tardi.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // FIXED: Correct blocking logic
  const isDeveloper = user?.email === 'wikus77@hotmail.it' || isDeveloperUser || localStorage.getItem('developer_access') === 'granted';
  const isBlocked = !isDeveloper && !hasValidPayment && subscriptionTier === 'Free' && remainingBuzz <= 0;
  const isLoading = isProcessing || stripeLoading || verificationLoading;

  if (verificationLoading) {
    return (
      <div className="w-60 h-60 rounded-full bg-gray-600 flex items-center justify-center">
        <Loader className="w-12 h-12 animate-spin text-white" />
      </div>
    );
  }

  // FIXED: Correct display values
  const displayRemainingBuzz = () => {
    if (isDeveloper) return 999;
    if (subscriptionTier === 'Free') return remainingBuzz || 1;
    return remainingBuzz;
  };

  const displayWeeklyLimit = () => {
    if (isDeveloper) return 999;
    if (subscriptionTier === 'Free') return 1;
    if (subscriptionTier === 'Silver') return 3;
    if (subscriptionTier === 'Gold') return 7;
    return remainingBuzz;
  };

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
              PAGAMENTO RICHIESTO
            </span>
            <span className="text-xs text-red-200 mt-1 text-center px-2">
              Abbonamento richiesto
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
              {displayRemainingBuzz()}/{displayWeeklyLimit()} BUZZ settimanali
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
