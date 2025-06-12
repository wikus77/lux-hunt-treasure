
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Loader, Zap } from "lucide-react";
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

  // FIXED: Real-time buzz data loading and synchronization
  const loadBuzzData = async () => {
    if (!userId) return;
    
    try {
      console.log('📊 BUZZ: Loading daily count and cost for user:', userId);
      
      // Get today's buzz count with real-time sync
      const { data: countData, error: countError } = await supabase
        .from('user_buzz_counter')
        .select('buzz_count')
        .eq('user_id', userId)
        .eq('date', new Date().toISOString().split('T')[0])
        .single();

      const currentCount = countData?.buzz_count || 0;
      console.log('📊 BUZZ: Current daily count loaded and synced:', currentCount);
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
    
    // FIXED: Set up real-time listener for counter updates
    const channel = supabase
      .channel('buzz-counter-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_buzz_counter',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          console.log('🔄 BUZZ: Real-time counter update received:', payload);
          loadBuzzData(); // Reload data when counter changes
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const handleBuzzPress = async () => {
    if (isLoading || !userId) return;
    
    console.log('🚀 BUZZ: Starting process - IMMEDIATE counter increment and sync');

    // FIXED: Show ripple immediately
    setShowRipple(true);
    setTimeout(() => setShowRipple(false), 1000);

    // FIXED: IMMEDIATE counter increment and sync
    const newDailyCount = dailyCount + 1;
    setDailyCount(newDailyCount);
    console.log(`🔢 BUZZ: Counter IMMEDIATELY incremented to ${newDailyCount}/50`);

    // FIXED: MANDATORY processing toast - always shown
    toast.info("🎯 Processing BUZZ...", {
      description: `Request ${newDailyCount}/50 processing...`,
      duration: 2000,
    });

    // Check daily limit AFTER incrementing counter
    if (dailyCount >= 50) {
      // FIXED: MANDATORY error toast - always shown
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
      
      // FIXED: MANDATORY success toast for developer - always shown
      toast.success("🎯 Nuovo indizio sbloccato! (DEV MODE)", {
        description: `Test sviluppatore - Indizio dinamico generato alle ${new Date().toLocaleTimeString()}`,
        duration: 4000,
      });
      
      // FIXED: Update counter in DB immediately for real-time sync
      try {
        await supabase
          .from('user_buzz_counter')
          .upsert({
            user_id: userId,
            date: new Date().toISOString().split('T')[0],
            buzz_count: newDailyCount
          });
        console.log(`📊 BUZZ: Developer counter updated in DB to ${newDailyCount} - REAL-TIME SYNC`);
      } catch (dbError) {
        console.error("❌ BUZZ: Failed to update developer counter in DB:", dbError);
      }
      
      // FIXED: MANDATORY notification creation for developer
      try {
        await createBuzzNotification(
          "Nuovo Indizio Buzz (DEV)", 
          `Test sviluppatore completato alle ${new Date().toLocaleTimeString()}`
        );
        console.log("✅ BUZZ: Developer notification created");
      } catch (notifError) {
        console.error("❌ BUZZ: Failed to create developer notification:", notifError);
      }
      
      // FIXED: MANDATORY logging for developer
      try {
        await supabase
          .from('buzz_logs')
          .insert({
            user_id: userId,
            step: 'buzz_developer_mode',
            action: 'BUZZ_DEV_CLICK',
            details: {
              cost: 0,
              daily_count: newDailyCount,
              timestamp: new Date().toISOString(),
              success: true,
              developer_mode: true
            }
          });
        console.log("✅ BUZZ: Developer event logged in buzz_logs");
      } catch (logError) {
        console.error("❌ BUZZ: Failed to log developer event:", logError);
      }
      
      // Reload data for real-time sync
      setTimeout(() => {
        loadBuzzData();
      }, 500);
      
      onSuccess();
      return;
    }
    
    // CRITICAL: Check if user needs to pay (no subscription and cost > 0)
    if (!hasActiveSubscription && buzzCost > 0) {
      try {
        console.log('💳 BUZZ: Payment REQUIRED - processing checkout');
        
        // FIXED: MANDATORY payment requirement toast - always shown
        toast.error("Pagamento richiesto", {
          description: `Per continuare è necessario pagare €${buzzCost.toFixed(2)} o attivare un abbonamento.`,
          duration: 4000,
        });

        // MANDATORY: Process payment before allowing buzz
        const paymentSuccess = await processBuzzPurchase(false, buzzCost);
        
        if (!paymentSuccess) {
          // FIXED: MANDATORY payment failure toast - always shown
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
        // FIXED: MANDATORY payment error toast - always shown
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
        
        // FIXED: IMMEDIATE counter update in DB for real-time sync
        try {
          await supabase
            .from('user_buzz_counter')
            .upsert({
              user_id: userId,
              date: new Date().toISOString().split('T')[0],
              buzz_count: newDailyCount
            });
          console.log(`📊 BUZZ: Counter updated in DB to ${newDailyCount} - REAL-TIME SYNC`);
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

        // FIXED: MANDATORY success toast - always shown
        toast.success("🎯 Nuovo indizio sbloccato!", {
          description: dynamicClueContent,
          duration: 4000,
        });
        
        // FIXED: MANDATORY notification creation
        try {
          console.log("💾 BUZZ: Creating notification in Supabase...");
          await createBuzzNotification(
            "Nuovo Indizio Buzz", 
            dynamicClueContent
          );
          console.log("✅ BUZZ: Notification created successfully");
        } catch (notifError) {
          console.error("❌ BUZZ: Failed to create notification:", notifError);
        }
        
        // FIXED: MANDATORY logging with complete details
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
                success: true,
                clue_content: dynamicClueContent
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
        
        // FIXED: MANDATORY error toast - always shown
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
      
      // FIXED: MANDATORY connection error toast - always shown
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
    }
  };

  // Check if buzz is blocked (over 50 daily uses)
  const isBlocked = dailyCount >= 50;
  const isProcessing = isLoading || paymentLoading;

  return (
    // FIXED: Perfect vertical centering with iOS safe area support
    <div className="min-h-screen w-full flex items-center justify-center px-4 pb-safe">
      <div className="flex flex-col items-center justify-center relative">
        {/* FIXED: PERFECT CENTERED CIRCULAR BUTTON WITH ENHANCED GLOW */}
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
              : "0 0 40px rgba(123, 46, 255, 0.9), 0 0 80px rgba(0, 209, 255, 0.7), 0 0 120px rgba(255, 89, 248, 0.5)",
          }}
          animate={
            !isBlocked ? {
              boxShadow: [
                "0 0 30px rgba(123, 46, 255, 0.7), 0 0 60px rgba(0, 209, 255, 0.5), 0 0 90px rgba(255, 89, 248, 0.4)",
                "0 0 50px rgba(123, 46, 255, 1.0), 0 0 100px rgba(0, 209, 255, 0.8), 0 0 150px rgba(255, 89, 248, 0.6)",
                "0 0 30px rgba(123, 46, 255, 0.7), 0 0 60px rgba(0, 209, 255, 0.5), 0 0 90px rgba(255, 89, 248, 0.4)"
              ]
            } : {}
          }
          transition={{
            scale: { type: "spring", stiffness: 300, damping: 20 },
            boxShadow: { duration: 2, repeat: Infinity, ease: "easeInOut" }
          }}
        >
          {/* FIXED: Enhanced animated background glow layer */}
          {!isBlocked && (
            <motion.div
              className="absolute -inset-6 rounded-full opacity-60 blur-2xl"
              style={{ 
                background: "linear-gradient(135deg, #7B2EFF, #00D1FF, #FF59F8)"
              }}
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.4, 0.8, 0.4]
              }}
              transition={{ 
                duration: 2.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          )}
          
          {/* Main content centered */}
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
                {/* FIXED: MANDATORY dynamic price display - always visible when no subscription */}
                {!hasActiveSubscription && (
                  <motion.span 
                    className="text-xl text-white/95 mt-2 font-bold bg-black/30 px-3 py-1 rounded-full"
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    €{buzzCost.toFixed(2)}
                  </motion.span>
                )}
                {/* FIXED: MANDATORY counter display with real-time sync */}
                <motion.span 
                  className="text-sm text-white/80 mt-1 bg-black/20 px-2 py-1 rounded-full"
                  key={dailyCount} // Force re-render on count change
                  initial={{ scale: 1.2 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {dailyCount}/50 oggi
                </motion.span>
              </>
            )}
          </div>

          {/* FIXED: ENHANCED ripple effect on click */}
          {showRipple && (
            <motion.div
              className="absolute inset-0 rounded-full pointer-events-none"
              initial={{ scale: 0.8, opacity: 0.8 }}
              animate={{ scale: 3, opacity: 0 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              style={{
                background: "radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 70%)"
              }}
            />
          )}
        </motion.button>
      </div>
    </div>
  );
};

export default BuzzButton;
