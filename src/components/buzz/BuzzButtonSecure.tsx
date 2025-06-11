
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

  // CRITICAL FIX: Calculate dynamic price based on buzz count
  const calculateBuzzPrice = (count: number): number => {
    if (count <= 5) return 1.99;
    if (count <= 10) return 2.99;
    if (count <= 15) return 3.99;
    return 4.99;
  };

  // CRITICAL FIX: Enhanced BUZZ with FORCED Stripe for ALL users
  const handleBuzzClick = async () => {
    const isDeveloper = user?.email === 'wikus77@hotmail.it';
    const hasDeveloperAccess = localStorage.getItem('developer_access') === 'granted';
    
    // CRITICAL FIX: Developer bypass with clear logging
    if (isDeveloper || hasDeveloperAccess) {
      console.log('🔧 DEVELOPER BYPASS - Proceeding with buzz generation');
      console.log('💳 STRIPE SKIPPED: Developer mode active');
      handleBuzzSuccess();
      return;
    }

    // CRITICAL FIX: FORCE Stripe for ALL non-developers
    console.log('💳 NON-DEVELOPER - FORCING Stripe checkout modal');
    
    const currentPrice = calculateBuzzPrice(buzzCount + 1);
    
    try {
      console.log(`💳 STRIPE MODAL: Opening checkout for BUZZ at ${currentPrice}€...`);
      toast.info(`💳 Apertura pagamento Stripe (${currentPrice}€)...`);
      
      // FORCED Stripe modal display
      const stripeSuccess = await processBuzzPurchase(false, currentPrice);
      
      if (stripeSuccess) {
        console.log('✅ Stripe payment completed for BUZZ');
        toast.success(`✅ Pagamento completato (${currentPrice}€)! Generando indizio...`);
        
        // Continue with buzz generation after payment
        setTimeout(() => {
          handleBuzzSuccess();
        }, 1500);
      } else {
        console.log('❌ Stripe payment failed or cancelled');
        toast.error('❌ Pagamento richiesto per BUZZ');
        return; // BLOCK execution if Stripe fails
      }
      return;
    } catch (error) {
      console.error('❌ Stripe payment error for BUZZ:', error);
      toast.error('❌ Errore nel processo di pagamento BUZZ');
      return; // BLOCK execution if Stripe fails
    }
  };

  const handleBuzzSuccess = async () => {
    setIsLoading(true);
    
    try {
      console.log('🚀 Starting BUZZ generation...');
      
      // Call the buzz press handler
      const { data, error } = await supabase.functions.invoke('handle-buzz-press', {
        body: {
          userId: userId,
          generateMap: false
        }
      });

      if (error) {
        console.error('❌ BUZZ generation failed:', error);
        toast.error('Errore nella generazione dell\'indizio');
        return;
      }

      if (data?.success) {
        setBuzzCount(prev => prev + 1);
        
        // CRITICAL FIX: Force notification creation with guaranteed persistence
        let notificationCreated = false;
        let attempts = 0;
        
        while (!notificationCreated && attempts < 10) {
          attempts++;
          try {
            console.log(`📨 BUZZ notification attempt ${attempts}/10`);
            await createBuzzNotification(
              "🎯 Nuovo Indizio Sbloccato",
              data.clue_text || "Nuovo indizio generato per la tua missione!"
            );
            
            // Also add to local notifications
            await addNotification(
              "🎯 Nuovo Indizio Sbloccato",
              data.clue_text || "Nuovo indizio generato per la tua missione!",
              "buzz"
            );
            
            notificationCreated = true;
            console.log(`✅ BUZZ notification created on attempt ${attempts}`);
          } catch (notifError) {
            console.error(`❌ BUZZ notification attempt ${attempts} failed:`, notifError);
            if (attempts < 10) {
              await new Promise(resolve => setTimeout(resolve, 500));
            }
          }
        }
        
        if (!notificationCreated) {
          console.error('❌ Failed to create notification after 10 attempts');
        }
        
        toast.success('🎯 Nuovo indizio sbloccato!');
        onSuccess();
      } else {
        toast.error(data?.errorMessage || 'Errore nella generazione dell\'indizio');
      }
    } catch (error) {
      console.error('❌ BUZZ error:', error);
      toast.error('Errore imprevisto nella generazione dell\'indizio');
    } finally {
      setIsLoading(false);
    }
  };

  const isDeveloper = user?.email === 'wikus77@hotmail.it' || localStorage.getItem('developer_access') === 'granted';
  const isBlocked = !isDeveloper; // Non-developers always need payment
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
