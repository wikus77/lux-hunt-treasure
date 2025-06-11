
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Loader, Lock } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useBuzzApi } from "@/hooks/buzz/useBuzzApi";
import { useNotificationManager } from "@/hooks/useNotificationManager";
import { usePaymentVerification } from "@/hooks/usePaymentVerification";
import { useStripePayment } from "@/hooks/useStripePayment";
import { supabase } from "@/integrations/supabase/client";

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

    // CRITICAL: Verify payment before any action
    const canProceed = await requireBuzzPayment();
    if (!canProceed) {
      await logUnauthorizedAccess('buzz_blocked_no_payment', {
        subscriptionTier,
        remainingBuzz,
        hasValidPayment
      });
      return;
    }

    // Trigger ripple effect
    setShowRipple(true);
    setTimeout(() => setShowRipple(false), 1000);
    
    // Track Plausible event
    if (typeof window !== 'undefined' && window.plausible) {
      window.plausible('buzz_click');
    }
    
    console.log('🔒 SECURE BUZZ: Starting verified buzz process for user:', userId);
    setIsProcessing(true);
    
    try {
      // If user doesn't have subscription, require payment
      if (subscriptionTier === 'Free') {
        console.log('💳 No subscription detected, redirecting to payment...');
        await processBuzzPurchase(false, buzzCost);
        return;
      }

      // Proceed with buzz generation for premium users
      const response = await callBuzzApi({ 
        userId, 
        generateMap: false 
      });
      
      if (response.success) {
        console.log('✅ SECURE BUZZ: Response received with payment verification');
        
        // Track clue unlocked event
        if (typeof window !== 'undefined' && window.plausible) {
          window.plausible('clue_unlocked');
        }

        // Get dynamic clue content
        const dynamicClueContent = response.clue_text || 
          `Indizio premium generato alle ${new Date().toLocaleTimeString()}`;
        
        console.log('📝 SECURE: Dynamic clue content:', dynamicClueContent);

        // Register notification on Supabase with verification
        try {
          console.log('💾 SECURE: Inserting verified notification in Supabase...');
          const { error: notificationError } = await supabase
            .from('user_notifications')
            .insert({
              user_id: userId,
              type: 'buzz',
              title: 'Nuovo Indizio Premium Verificato',
              message: dynamicClueContent,
              is_read: false,
              created_at: new Date().toISOString()
            });

          if (notificationError) {
            console.error('❌ Error inserting verified notification:', notificationError);
          } else {
            console.log('✅ Verified notification inserted successfully');
          }
        } catch (notifError) {
          console.error('❌ Error creating verified notification:', notifError);
        }

        // Create toast notification
        toast.success("Indizio Premium Sbloccato!", {
          description: dynamicClueContent,
        });
        
        // Create app notification
        try {
          await createBuzzNotification(
            "Nuovo Indizio Premium Verificato", 
            dynamicClueContent
          );
          console.log('✅ Verified Buzz notification created successfully');
        } catch (notifError) {
          console.error('❌ Failed to create verified Buzz notification:', notifError);
        }
        
        onSuccess();
      } else {
        console.error('❌ SECURE BUZZ: API response failed:', response.errorMessage);
        const errorMessage = response.errorMessage || "Errore sconosciuto";
        
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

  // Security check: block if no valid payment
  const isBlocked = !hasValidPayment || remainingBuzz <= 0 || subscriptionTier === 'Free';
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
      {/* Security overlay for blocked access */}
      {isBlocked && (
        <div className="absolute inset-0 bg-red-900 bg-opacity-80 rounded-full flex items-center justify-center z-20">
          <Lock className="w-16 h-16 text-red-300" />
        </div>
      )}

      {/* Radial gradient overlay */}
      <div className={`absolute inset-0 rounded-full opacity-90 ${
        isBlocked ? 'bg-gradient-to-r from-red-600 to-red-800' : 
        'bg-gradient-to-r from-[#7B2EFF] via-[#00D1FF] to-[#FF59F8]'
      }`} />
      
      <div className="absolute inset-0 flex flex-col items-center justify-center rounded-full z-10">
        {isLoading ? (
          <Loader className="w-12 h-12 animate-spin text-white" />
        ) : isBlocked ? (
          <>
            <Lock className="w-8 h-8 text-red-300 mb-2" />
            <span className="text-lg font-bold text-red-300 tracking-wider text-center px-4">
              {!hasValidPayment ? 'PAGAMENTO RICHIESTO' : 
               remainingBuzz <= 0 ? 'LIMITE RAGGIUNTO' : 'ACCESSO NEGATO'}
            </span>
            <span className="text-xs text-red-200 mt-1 text-center px-2">
              {subscriptionTier === 'Free' ? 'Abbonamento richiesto' : 
               `${remainingBuzz} BUZZ rimanenti`}
            </span>
          </>
        ) : (
          <>
            <span className="text-3xl font-bold text-white tracking-wider glow-text">
              BUZZ!
            </span>
            <span className="text-sm text-white/90 mt-1 font-medium">
              Piano: {subscriptionTier}
            </span>
            <span className="text-xs text-white/70">
              {remainingBuzz} BUZZ rimanenti
            </span>
          </>
        )}
      </div>

      {/* Ripple effect - only show if not blocked */}
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
