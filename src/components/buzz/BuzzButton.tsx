
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Loader, Zap } from "lucide-react";
import { toast } from "sonner";
import { useBuzzApi } from "@/hooks/buzz/useBuzzApi";
import { useNotificationManager } from "@/hooks/useNotificationManager";
import { useStripePayment } from "@/hooks/useStripePayment";
import { useBuzzCounter } from "@/hooks/useBuzzCounter";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

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
  const { dailyBuzzCounter, loadDailyBuzzCounter, updateDailyBuzzCounter } = useBuzzCounter(userId);
  const queryClient = useQueryClient();
  
  const [buzzCost, setBuzzCost] = useState<number>(1.99);
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

  // Load current buzz cost and daily count with integrated useBuzzCounter
  const loadBuzzData = async () => {
    if (!userId) return;
    
    try {
      console.log('📊 BUZZ: Loading daily count and cost for user:', userId);
      
      // Use integrated useBuzzCounter hook
      await loadDailyBuzzCounter();
      
      // Calculate cost for next buzz
      const { data: costData, error: costError } = await supabase.rpc('calculate_buzz_price', {
        daily_count: dailyBuzzCounter + 1
      });

      if (costError) {
        console.error("Error calculating cost:", costError);
        return;
      }

      const newCost = costData || 1.99;
      setBuzzCost(newCost);
      console.log(`💰 BUZZ: Cost updated to €${newCost} for count ${dailyBuzzCounter + 1}`);
    } catch (error) {
      console.error("Error loading buzz data:", error);
    }
  };

  useEffect(() => {
    loadBuzzData();
  }, [userId, dailyBuzzCounter, loadDailyBuzzCounter]);

  const handleBuzzPress = async () => {
    if (isLoading || !userId) return;
    
    console.log('🚀 BUZZ: Starting process - IMPERATIVE counter increment');

    // CRITICAL: Show ripple immediately
    setShowRipple(true);
    setTimeout(() => setShowRipple(false), 1000);

    // IMPERATIVE: Show immediate toast feedback - ALWAYS
    toast.success("🎯 BUZZ attivato!", {
      description: `Tentativo ${dailyBuzzCounter + 1}/50 in corso...`,
      duration: 2000,
    });

    // IMPERATIVE: UPDATE COUNTER IMMEDIATELY using integrated hook
    const newDailyCount = await updateDailyBuzzCounter();
    console.log(`🔢 BUZZ: Counter IMPERATIVELY incremented to ${newDailyCount}/50`);

    // Invalidate React Query cache for immediate sync
    queryClient.invalidateQueries({ queryKey: ['buzz-counter', userId] });
    queryClient.invalidateQueries({ queryKey: ['user-buzz-counter', userId] });

    // Check daily limit AFTER incrementing counter
    if (dailyBuzzCounter >= 50) {
      toast.error("Limite giornaliero raggiunto", {
        description: "Hai raggiunto il limite di 50 buzz per oggi.",
        duration: 4000,
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
    
    // Check developer mode
    const { data: userData } = await supabase.auth.getUser();
    const isDeveloper = userData.user?.email === 'wikus77@hotmail.it';
    
    if (isDeveloper) {
      console.log('🔓 BUZZ: Developer mode activated - simulating valid response');
      
      // DEVELOPER MODE: Always show success toast (IMPERATIVE)
      toast.success("🎯 Nuovo indizio sbloccato! (DEV MODE)", {
        description: `Test sviluppatore - Indizio dinamico generato alle ${new Date().toLocaleTimeString()}`,
        duration: 4000,
      });
      
      // IMPERATIVE: Force notification creation and UI update
      try {
        await createBuzzNotification(
          "Nuovo Indizio Buzz (DEV)", 
          `Test sviluppatore - Indizio dinamico generato alle ${new Date().toLocaleTimeString()}`
        );
        console.log("✅ BUZZ: Developer notification created and triggered");
        
        // Force notification system refresh
        queryClient.invalidateQueries({ queryKey: ['notifications'] });
      } catch (notifError) {
        console.error("❌ BUZZ: Failed to create developer notification:", notifError);
      }
      
      // Reload data with cache invalidation
      setTimeout(async () => {
        await loadBuzzData();
        queryClient.invalidateQueries({ queryKey: ['buzz-data'] });
      }, 500);
      
      onSuccess();
      return;
    }
    
    // CRITICAL: Check if user needs to pay (no subscription and cost > 0)
    if (!hasActiveSubscription && buzzCost > 0) {
      try {
        console.log('💳 BUZZ: Payment REQUIRED - processing checkout');
        
        // Show payment requirement toast (IMPERATIVE)
        toast.error("Pagamento richiesto", {
          description: `Per continuare è necessario pagare €${buzzCost.toFixed(2)} o attivare un abbonamento.`,
          duration: 4000,
        });

        // MANDATORY: Process payment before allowing buzz
        const paymentSuccess = await processBuzzPurchase(false, buzzCost);
        
        if (!paymentSuccess) {
          toast.error("Pagamento necessario", {
            description: "Il pagamento è obbligatorio per utilizzare il BUZZ.",
            duration: 4000,
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
          description: "Impossibile processare il pagamento.",
          duration: 4000,
        });
        return;
      }
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
        
        // Get dynamic clue content
        const dynamicClueContent = response.clue_text || `Indizio dinamico generato alle ${new Date().toLocaleTimeString()}`;
        
        console.log("📝 BUZZ: Dynamic clue content:", dynamicClueContent);

        // IMPERATIVE: Show success toast - ALWAYS
        toast.success("🎯 Nuovo indizio sbloccato!", {
          description: dynamicClueContent,
          duration: 4000,
        });
        
        // CRITICAL: Register notification in Supabase and trigger UI update
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
        
        // Create app notification and force UI refresh
        try {
          await createBuzzNotification(
            "Nuovo Indizio Buzz", 
            dynamicClueContent
          );
          console.log("✅ BUZZ: App notification created successfully");
          
          // IMPERATIVE: Force notification system refresh
          queryClient.invalidateQueries({ queryKey: ['notifications'] });
          queryClient.invalidateQueries({ queryKey: ['user-notifications'] });
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
        
        // IMPERATIVE: Show error toast - ALWAYS
        toast.error("❌ Errore BUZZ", {
          description: errorMessage,
          duration: 4000,
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
      
      // IMPERATIVE: Show connection error toast - ALWAYS
      toast.error("❌ Errore di connessione", {
        description: "Impossibile contattare il server. Riprova più tardi.",
        duration: 4000,
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
      
      // IMPERATIVE: Reload all data and invalidate cache
      setTimeout(async () => {
        await loadBuzzData();
        queryClient.invalidateQueries({ queryKey: ['buzz-counter', userId] });
        queryClient.invalidateQueries({ queryKey: ['buzz-data'] });
        queryClient.invalidateQueries({ queryKey: ['user-buzz-counter'] });
      }, 500);
    }
  };

  // Check if buzz is blocked (over 50 daily uses)
  const isBlocked = dailyBuzzCounter >= 50;
  const isProcessing = isLoading || paymentLoading;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen pb-safe">
      {/* IMPERATIVE: Perfect circular button with glow aura */}
      <motion.button
        className="w-80 h-80 rounded-full relative overflow-hidden focus:outline-none disabled:opacity-50"
        onClick={handleBuzzPress}
        disabled={isProcessing || isBlocked}
        whileTap={{ scale: 0.95 }}
        whileHover={{ scale: 1.05 }}
        style={{
          background: isBlocked 
            ? "linear-gradient(135deg, #666, #999)" 
            : "linear-gradient(135deg, #7B2EFF, #00D1FF, #FF59F8)",
          boxShadow: isBlocked 
            ? "none" 
            : "0 0 30px rgba(123, 46, 255, 0.8), 0 0 60px rgba(0, 209, 255, 0.6), 0 0 90px rgba(255, 89, 248, 0.4)",
        }}
        animate={!isBlocked ? {
          boxShadow: [
            "0 0 20px rgba(123, 46, 255, 0.6), 0 0 40px rgba(0, 209, 255, 0.4), 0 0 60px rgba(255, 89, 248, 0.3)",
            "0 0 40px rgba(123, 46, 255, 0.9), 0 0 80px rgba(0, 209, 255, 0.7), 0 0 120px rgba(255, 89, 248, 0.5)",
            "0 0 20px rgba(123, 46, 255, 0.6), 0 0 40px rgba(0, 209, 255, 0.4), 0 0 60px rgba(255, 89, 248, 0.3)"
          ]
        } : {}}
        transition={{
          scale: { type: "spring", stiffness: 300, damping: 20 },
          boxShadow: { repeat: Infinity, duration: 2, ease: "easeInOut" }
        }}
      >
        {/* Animated glow effect layer */}
        {!isBlocked && (
          <motion.div
            className="absolute -inset-4 rounded-full opacity-50 blur-xl"
            style={{ 
              background: "linear-gradient(135deg, #7B2EFF, #00D1FF, #FF59F8)"
            }}
            animate={{ 
              scale: [1, 1.1, 1],
              opacity: [0.3, 0.7, 0.3]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        )}
        
        {/* Main content */}
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
              <Zap className="w-16 h-16 text-white mb-2" />
              <span className="text-4xl font-bold text-white tracking-wider">
                BUZZ!
              </span>
              {/* IMPERATIVE: Dynamic price display */}
              {!hasActiveSubscription && (
                <span className="text-lg text-white/90 mt-2 font-bold">
                  €{buzzCost.toFixed(2)}
                </span>
              )}
              {/* IMPERATIVE: Counter display with integrated hook */}
              <span className="text-sm text-white/70 mt-1">
                {dailyBuzzCounter}/50 oggi
              </span>
            </>
          )}
        </div>

        {/* IMPERATIVE: Real ripple effect */}
        {showRipple && (
          <div className="absolute inset-0 rounded-full pointer-events-none">
            <motion.div
              className="absolute inset-0 rounded-full bg-white"
              initial={{ scale: 0.8, opacity: 0.6 }}
              animate={{ scale: 2.5, opacity: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
        )}
      </motion.button>
    </div>
  );
};

export default BuzzButton;
