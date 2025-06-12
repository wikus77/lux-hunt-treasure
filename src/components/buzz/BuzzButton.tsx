
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Loader } from "lucide-react";
import { toast } from "sonner";
import { useBuzzApi } from "@/hooks/buzz/useBuzzApi";
import { useNotificationManager } from "@/hooks/useNotificationManager";
import { useStripePayment } from "@/hooks/useStripePayment";
import { supabase } from "@/integrations/supabase/client";

interface BuzzButtonProps {
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  userId: string;
  onSuccess: () => void;
}

const BuzzButton: React.FC<BuzzButtonProps> = ({
  isLoading,
  setIsLoading,
  setError,
  userId,
  onSuccess
}) => {
  const { callBuzzApi } = useBuzzApi();
  const { createBuzzNotification } = useNotificationManager();
  const { processBuzzPurchase, loading: paymentLoading } = useStripePayment();
  const [buzzCost, setBuzzCost] = useState<number>(1.99);
  const [dailyCount, setDailyCount] = useState<number>(0);
  const [showRipple, setShowRipple] = useState(false);
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);

  // Check subscription status
  useEffect(() => {
    const checkSubscription = async () => {
      if (!userId) return;
      
      try {
        const { data: subscription } = await supabase
          .from('subscriptions')
          .select('status, tier')
          .eq('user_id', userId)
          .eq('status', 'active')
          .single();

        setHasActiveSubscription(!!subscription);
        console.log('🔍 BUZZ: Subscription status checked:', !!subscription);
      } catch (error) {
        console.log("🔍 BUZZ: No active subscription found");
        setHasActiveSubscription(false);
      }
    };

    checkSubscription();
  }, [userId]);

  // Load current buzz cost and daily count
  useEffect(() => {
    const loadBuzzCost = async () => {
      if (!userId) return;
      
      try {
        // Get today's buzz count
        const { data: countData, error: countError } = await supabase
          .from('user_buzz_counter')
          .select('buzz_count')
          .eq('user_id', userId)
          .eq('date', new Date().toISOString().split('T')[0])
          .single();

        const currentCount = countData?.buzz_count || 0;
        setDailyCount(currentCount);

        // Calculate cost for next buzz
        const { data: costData, error: costError } = await supabase.rpc('calculate_buzz_price', {
          daily_count: currentCount + 1
        });

        if (costError) {
          console.error("Error calculating cost:", costError);
          return;
        }

        setBuzzCost(costData || 1.99);
        console.log(`💰 BUZZ: Current cost calculated: €${costData || 1.99}, daily count: ${currentCount}`);
      } catch (error) {
        console.error("Error loading buzz cost:", error);
      }
    };

    loadBuzzCost();
  }, [userId]);

  const handleBuzzPress = async () => {
    if (isLoading || !userId) return;
    
    console.log('🚀 BUZZ: Starting process with MANDATORY payment verification');

    // Check daily limit first
    if (dailyCount >= 50) {
      toast.error("Limite giornaliero raggiunto", {
        description: "Hai raggiunto il limite di 50 buzz per oggi."
      });
      return;
    }
    
    // CRITICAL: Check if user needs to pay (no subscription and cost > 0)
    const isDeveloper = userId && (await supabase.auth.getUser()).data.user?.email === 'wikus77@hotmail.it';
    
    if (!isDeveloper && !hasActiveSubscription && buzzCost > 0) {
      try {
        console.log('💳 BUZZ: Payment REQUIRED - processing checkout');
        
        // Show payment requirement toast
        toast.error("Pagamento richiesto", {
          description: `Per continuare è necessario pagare €${buzzCost.toFixed(2)} o attivare un abbonamento.`
        });

        // MANDATORY: Process payment before allowing buzz
        const paymentSuccess = await processBuzzPurchase(false, buzzCost);
        
        if (!paymentSuccess) {
          toast.error("Pagamento necessario", {
            description: "Il pagamento è obbligatorio per utilizzare il BUZZ."
          });
          return;
        }
        
        console.log('✅ BUZZ: Payment completed successfully');
      } catch (error) {
        console.error("❌ BUZZ Payment error:", error);
        toast.error("Errore di pagamento", {
          description: "Impossibile processare il pagamento."
        });
        return;
      }
    } else if (isDeveloper) {
      console.log('🔓 BUZZ: Developer bypass activated for wikus77@hotmail.it');
    } else if (hasActiveSubscription) {
      console.log('✅ BUZZ: Active subscription verified, proceeding');
    }
    
    // Trigger ripple effect
    setShowRipple(true);
    setTimeout(() => setShowRipple(false), 1000);
    
    // Track Plausible event
    if (typeof window !== 'undefined' && window.plausible) {
      window.plausible('buzz_click');
    }
    
    console.log("🚀 BUZZ: Starting API call for user:", userId);
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await callBuzzApi({ 
        userId, 
        generateMap: false 
      });
      
      if (response.success) {
        console.log("✅ BUZZ: API response received successfully:", response);
        
        // Track clue unlocked event
        if (typeof window !== 'undefined' && window.plausible) {
          window.plausible('clue_unlocked');
        }
        
        // Update counter for next use
        const newCount = dailyCount + 1;
        setDailyCount(newCount);
        
        // Calculate new cost for display
        const { data: newCostData } = await supabase.rpc('calculate_buzz_price', {
          daily_count: newCount + 1
        });
        if (newCostData) setBuzzCost(newCostData);

        // Get dynamic clue content
        const dynamicClueContent = response.clue_text || `Indizio dinamico generato alle ${new Date().toLocaleTimeString()}`;
        
        console.log("📝 BUZZ: Dynamic clue content:", dynamicClueContent);

        // Register notification in Supabase
        try {
          console.log("💾 BUZZ: Inserting notification in Supabase...");
          const { error: notificationError } = await supabase
            .from('user_notifications')
            .insert({
              user_id: userId,
              type: 'buzz',
              title: 'Nuovo Indizio Buzz',
              message: dynamicClueContent,
              is_read: false,
              created_at: new Date().toISOString()
            });

          if (notificationError) {
            console.error("❌ BUZZ: Error inserting notification:", notificationError);
          } else {
            console.log("✅ BUZZ: Notification inserted successfully");
          }
        } catch (notifError) {
          console.error("❌ BUZZ: Error creating notification:", notifError);
        }

        // ONLY show success toast AFTER successful generation
        toast.success("Nuovo indizio sbloccato!", {
          description: dynamicClueContent,
        });
        
        // Create app notification in BUZZ category
        try {
          await createBuzzNotification(
            "Nuovo Indizio Buzz", 
            dynamicClueContent
          );
          console.log("✅ BUZZ: App notification created successfully");
        } catch (notifError) {
          console.error("❌ BUZZ: Failed to create app notification:", notifError);
        }
        
        // Log event in buzz_logs - using raw insert without the action field
        try {
          await supabase
            .from('buzz_logs')
            .insert({
              user_id: userId,
              step: 'buzz_generated',
              details: {
                cost: buzzCost,
                daily_count: newCount,
                action: 'BUZZ_CLICK',
                timestamp: new Date().toISOString()
              }
            });
          console.log("✅ BUZZ: Event logged in buzz_logs");
        } catch (logError) {
          console.error("❌ BUZZ: Failed to log event:", logError);
        }
        
        onSuccess();
      } else {
        console.error("❌ BUZZ: API error:", response.errorMessage);
        const errorMessage = response.errorMessage || "Errore sconosciuto";
        setError(errorMessage);
        toast.error("Errore", {
          description: errorMessage,
        });
      }
    } catch (error) {
      console.error("❌ BUZZ: Error during API call:", error);
      setError("Si è verificato un errore di comunicazione con il server");
      toast.error("Errore di connessione", {
        description: "Impossibile contattare il server. Riprova più tardi.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Check if buzz is blocked (over 50 daily uses)
  const isBlocked = dailyCount >= 50;
  const isProcessing = isLoading || paymentLoading;

  return (
    <motion.button
      className="w-60 h-60 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 relative overflow-hidden shadow-xl hover:shadow-[0_0_35px_rgba(123,46,255,0.7)] focus:outline-none disabled:opacity-50"
      onClick={handleBuzzPress}
      disabled={isProcessing || isBlocked}
      whileTap={{ scale: 0.95 }}
      whileHover={{ scale: 1.05 }}
      initial={{ boxShadow: "0 0 0px rgba(123, 46, 255, 0)" }}
      animate={{ 
        boxShadow: isBlocked ? "none" : ["0 0 12px rgba(123, 46, 255, 0.35)", "0 0 35px rgba(0, 209, 255, 0.7)", "0 0 12px rgba(123, 46, 255, 0.35)"]
      }}
      transition={{ 
        boxShadow: { repeat: Infinity, duration: 3 },
        scale: { type: "spring", stiffness: 300, damping: 20 }
      }}
      style={{
        animation: isBlocked ? "none" : "buzzButtonGlow 3s infinite ease-in-out"
      }}
    >
      {/* Radial gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#7B2EFF] via-[#00D1FF] to-[#FF59F8] opacity-90 rounded-full" />
      
      {!isBlocked && (
        <motion.div
          className="absolute inset-0 rounded-full"
          initial={{ opacity: 0.4, scale: 1 }}
          animate={{ opacity: [0.4, 0.7, 0.4], scale: [1, 1.05, 1] }}
          transition={{ repeat: Infinity, duration: 3 }}
        />
      )}
      
      {!isBlocked && (
        <motion.div
          className="absolute -inset-1 rounded-full blur-xl"
          style={{ background: "linear-gradient(to right, #7B2EFF, #00D1FF, #FF59F8)", opacity: 0.5 }}
          initial={{ opacity: 0.2 }}
          animate={{ opacity: [0.2, 0.45, 0.2] }}
          transition={{ repeat: Infinity, duration: 2 }}
        />
      )}
      
      <div className="absolute inset-0 flex flex-col items-center justify-center rounded-full z-10">
        {isProcessing ? (
          <Loader className="w-12 h-12 animate-spin text-white" />
        ) : isBlocked ? (
          <>
            <span className="text-2xl font-bold text-red-300 tracking-wider">
              BLOCCATO
            </span>
            <span className="text-xs text-red-200 mt-1">
              Limite giornaliero raggiunto
            </span>
          </>
        ) : (
          <>
            <span className="text-3xl font-bold text-white tracking-wider glow-text">
              BUZZ!
            </span>
            {!hasActiveSubscription && (
              <span className="text-sm text-white/90 mt-1 font-medium">
                €{buzzCost.toFixed(2)}
              </span>
            )}
            <span className="text-xs text-white/70">
              {dailyCount}/50 oggi
            </span>
          </>
        )}
      </div>

      {/* Ripple effect */}
      {showRipple && (
        <div className="ripple-effect" />
      )}
      
      <style>
        {`
        @keyframes buzzButtonGlow {
          0% { box-shadow: 0 0 8px rgba(255, 89, 248, 0.6); }
          50% { box-shadow: 0 0 22px rgba(255, 89, 248, 0.8), 0 0 35px rgba(0, 209, 255, 0.5); }
          100% { box-shadow: 0 0 8px rgba(255, 89, 248, 0.6); }
        }
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

export default BuzzButton;
