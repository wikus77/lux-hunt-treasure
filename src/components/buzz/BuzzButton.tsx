
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

  // FIXED: Load current buzz cost and daily count with proper refresh
  const loadBuzzData = async () => {
    if (!userId) return;
    
    try {
      console.log('📊 BUZZ: Loading daily count and cost for user:', userId);
      
      // Get today's buzz count
      const { data: countData, error: countError } = await supabase
        .from('user_buzz_counter')
        .select('buzz_count')
        .eq('user_id', userId)
        .eq('date', new Date().toISOString().split('T')[0])
        .single();

      const currentCount = countData?.buzz_count || 0;
      console.log('📊 BUZZ: Current daily count loaded:', currentCount);
      setDailyCount(currentCount);

      // Calculate cost for next buzz
      const { data: costData, error: costError } = await supabase.rpc('calculate_buzz_price', {
        daily_count: currentCount + 1
      });

      if (costError) {
        console.error("Error calculating cost:", costError);
        return;
      }

      const newCost = costData || 1.99;
      setBuzzCost(newCost);
      console.log(`💰 BUZZ: Cost updated to €${newCost} for count ${currentCount + 1}`);
    } catch (error) {
      console.error("Error loading buzz data:", error);
    }
  };

  useEffect(() => {
    loadBuzzData();
  }, [userId]);

  const handleBuzzPress = async () => {
    if (isLoading || !userId) return;
    
    console.log('🚀 BUZZ: Starting process with MANDATORY payment verification');

    // CRITICAL: INCREMENT COUNTER ON EVERY CLICK (even if failed)
    const newDailyCount = dailyCount + 1;
    setDailyCount(newDailyCount);
    console.log(`🔢 BUZZ: Counter incremented to ${newDailyCount}/50`);

    // Check daily limit first
    if (dailyCount >= 50) {
      toast.error("Limite giornaliero raggiunto", {
        description: "Hai raggiunto il limite di 50 buzz per oggi."
      });
      
      // Log abuse attempt
      try {
        await supabase.from('abuse_logs').insert({
          user_id: userId,
          event_type: 'buzz_limit_exceeded'
        });
      } catch (error) {
        console.error("Failed to log abuse:", error);
      }
      return;
    }
    
    // Trigger ripple effect immediately
    setShowRipple(true);
    setTimeout(() => setShowRipple(false), 1000);
    
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
          
          // Log payment failure
          try {
            await supabase.from('abuse_logs').insert({
              user_id: userId,
              event_type: 'buzz_payment_required'
            });
          } catch (error) {
            console.error("Failed to log payment requirement:", error);
          }
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
        
        // CRITICAL: Update counter in DB
        try {
          await supabase
            .from('user_buzz_counter')
            .upsert({
              user_id: userId,
              date: new Date().toISOString().split('T')[0],
              buzz_count: newDailyCount
            });
          console.log(`📊 BUZZ: Counter updated in DB to ${newDailyCount}`);
        } catch (dbError) {
          console.error("❌ BUZZ: Failed to update counter in DB:", dbError);
        }
        
        // Reload all buzz data to ensure sync
        setTimeout(() => {
          loadBuzzData();
        }, 500);

        // Get dynamic clue content
        const dynamicClueContent = response.clue_text || `Indizio dinamico generato alle ${new Date().toLocaleTimeString()}`;
        
        console.log("📝 BUZZ: Dynamic clue content:", dynamicClueContent);

        // CRITICAL: Register notification in Supabase
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

        // CRITICAL: Show success toast with better messaging
        toast.success("🎯 Nuovo indizio sbloccato!", {
          description: dynamicClueContent,
          duration: 4000,
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
        
        // CRITICAL: Log event in buzz_logs with new action field
        try {
          await supabase
            .from('buzz_logs')
            .insert({
              user_id: userId,
              step: 'buzz_generated',
              action: 'BUZZ_CLICK',
              details: {
                cost: buzzCost,
                daily_count: newDailyCount,
                timestamp: new Date().toISOString(),
                success: true
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
        
        // CRITICAL: Show error toast with clear message
        toast.error("❌ Errore BUZZ", {
          description: errorMessage,
          duration: 3000,
        });
        
        // Log failure
        try {
          await supabase
            .from('buzz_logs')
            .insert({
              user_id: userId,
              step: 'buzz_failed',
              action: 'BUZZ_ERROR',
              details: {
                error: errorMessage,
                daily_count: newDailyCount,
                timestamp: new Date().toISOString()
              }
            });
        } catch (logError) {
          console.error("❌ BUZZ: Failed to log error:", logError);
        }
      }
    } catch (error) {
      console.error("❌ BUZZ: Error during API call:", error);
      setError("Si è verificato un errore di comunicazione con il server");
      
      // CRITICAL: Show connection error toast
      toast.error("❌ Errore di connessione", {
        description: "Impossibile contattare il server. Riprova più tardi.",
        duration: 3000,
      });
      
      // Log connection error
      try {
        await supabase
          .from('buzz_logs')
          .insert({
            user_id: userId,
            step: 'buzz_connection_error',
            action: 'BUZZ_CONNECTION_ERROR',
            details: {
              error: error?.message || 'Unknown connection error',
              daily_count: newDailyCount,
              timestamp: new Date().toISOString()
            }
          });
      } catch (logError) {
        console.error("❌ BUZZ: Failed to log connection error:", logError);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Check if buzz is blocked (over 50 daily uses)
  const isBlocked = dailyCount >= 50;
  const isProcessing = isLoading || paymentLoading;

  return (
    <div className="flex flex-col items-center justify-center h-full">
      <motion.button
        className="w-72 h-72 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 relative overflow-hidden shadow-xl hover:shadow-[0_0_35px_rgba(123,46,255,0.7)] focus:outline-none disabled:opacity-50"
        onClick={handleBuzzPress}
        disabled={isProcessing || isBlocked}
        whileTap={{ scale: 0.95 }}
        whileHover={{ scale: 1.05 }}
        initial={{ boxShadow: "0 0 0px rgba(123, 46, 255, 0)" }}
        animate={{ 
          boxShadow: isBlocked ? "none" : ["0 0 20px rgba(123, 46, 255, 0.4)", "0 0 50px rgba(0, 209, 255, 0.8)", "0 0 20px rgba(123, 46, 255, 0.4)"]
        }}
        transition={{ 
          boxShadow: { repeat: Infinity, duration: 2.5 },
          scale: { type: "spring", stiffness: 300, damping: 20 }
        }}
        style={{
          animation: isBlocked ? "none" : "buzzButtonGlow 2.5s infinite ease-in-out"
        }}
      >
        {/* Radial gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#7B2EFF] via-[#00D1FF] to-[#FF59F8] opacity-90 rounded-full" />
        
        {!isBlocked && (
          <motion.div
            className="absolute inset-0 rounded-full"
            initial={{ opacity: 0.4, scale: 1 }}
            animate={{ opacity: [0.4, 0.7, 0.4], scale: [1, 1.05, 1] }}
            transition={{ repeat: Infinity, duration: 2.5 }}
          />
        )}
        
        {!isBlocked && (
          <motion.div
            className="absolute -inset-2 rounded-full blur-xl"
            style={{ background: "linear-gradient(to right, #7B2EFF, #00D1FF, #FF59F8)", opacity: 0.5 }}
            initial={{ opacity: 0.2 }}
            animate={{ opacity: [0.2, 0.5, 0.2] }}
            transition={{ repeat: Infinity, duration: 2 }}
          />
        )}
        
        <div className="absolute inset-0 flex flex-col items-center justify-center rounded-full z-10">
          {isProcessing ? (
            <Loader className="w-16 h-16 animate-spin text-white" />
          ) : isBlocked ? (
            <>
              <span className="text-3xl font-bold text-red-300 tracking-wider">
                BLOCCATO
              </span>
              <span className="text-sm text-red-200 mt-2">
                Limite giornaliero raggiunto
              </span>
            </>
          ) : (
            <>
              <span className="text-4xl font-bold text-white tracking-wider glow-text">
                BUZZ!
              </span>
              {!hasActiveSubscription && (
                <span className="text-lg text-white/90 mt-2 font-bold">
                  €{buzzCost.toFixed(2)}
                </span>
              )}
              <span className="text-sm text-white/70 mt-1">
                {dailyCount}/50 oggi
              </span>
            </>
          )}
        </div>

        {/* Ripple effect */}
        {showRipple && (
          <div className="absolute inset-0 rounded-full">
            <motion.div
              className="absolute inset-0 rounded-full bg-white opacity-30"
              initial={{ scale: 0.8, opacity: 0.6 }}
              animate={{ scale: 2.5, opacity: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
        )}
        
        <style>
          {`
          @keyframes buzzButtonGlow {
            0% { box-shadow: 0 0 15px rgba(255, 89, 248, 0.6); }
            50% { box-shadow: 0 0 35px rgba(255, 89, 248, 0.9), 0 0 50px rgba(0, 209, 255, 0.6); }
            100% { box-shadow: 0 0 15px rgba(255, 89, 248, 0.6); }
          }
          .glow-text {
            text-shadow: 0 0 15px rgba(255, 255, 255, 0.8), 0 0 30px rgba(0, 209, 255, 0.7);
          }
          `}
        </style>
      </motion.button>
    </div>
  );
};

export default BuzzButton;
