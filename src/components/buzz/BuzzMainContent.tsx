
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useBuzzFeature } from "@/hooks/useBuzzFeature";
import BuzzButton from "./BuzzButton";
import BuzzUnlockDialog from "./BuzzUnlockDialog";
import BuzzExplosionHandler from "./BuzzExplosionHandler";
import ClueBanner from "./ClueBanner";
import GradientBox from "@/components/ui/gradient-box";
import { supabase } from "@/integrations/supabase/client";
import BuzzResetCounter from "./BuzzResetCounter";

const BuzzMainContent = () => {
  const {
    showDialog,
    showExplosion,
    showClueBanner,
    setShowClueBanner,
    lastDynamicClue,
    handleBuzzClick,
    handlePayment,
    handleExplosionCompleted
  } = useBuzzFeature();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string>("");
  const [resetTrigger, setResetTrigger] = useState<number>(0);

  useEffect(() => {
    const getUserId = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      }
    };
    getUserId();
  }, []);

  const handleSuccess = () => {
    console.log("✅ BUZZ completato con successo");
    setIsLoading(false);
    setError(null);
  };

  const handleCounterReset = () => {
    console.log("🔄 Counter resettato, aggiornamento componenti...");
    // Incrementa resetTrigger per forzare il reload del BuzzButton
    setResetTrigger(prev => prev + 1);
    // Reset degli stati locali
    setIsLoading(false);
    setError(null);
    console.log("✅ Componenti aggiornati dopo reset");
  };

  return (
    <>
      <motion.div
        className="flex flex-col items-center justify-center min-h-[60vh] px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <GradientBox className="w-full max-w-md p-8 text-center">
          <motion.div
            className="mb-8"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <h2 className="text-2xl font-orbitron font-bold text-[#00D1FF] mb-4">
              SISTEMA BUZZ ATTIVO
            </h2>
            <p className="text-white/70 text-sm mb-6">
              Premi il bottone per generare un nuovo indizio esclusivo
            </p>
          </motion.div>

          <motion.div
            className="flex flex-col items-center gap-6"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <BuzzButton
              isLoading={isLoading}
              setIsLoading={setIsLoading}
              setError={setError}
              userId={userId}
              onSuccess={handleSuccess}
              resetTrigger={resetTrigger}
            />

            {error && (
              <motion.div
                className="text-red-400 text-sm text-center bg-red-900/20 p-3 rounded-lg border border-red-500/30"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {error}
              </motion.div>
            )}

            {/* Reset Counter per testing */}
            {userId && (
              <div className="mt-4 pt-4 border-t border-white/10">
                <p className="text-xs text-white/50 mb-2">Solo per testing:</p>
                <BuzzResetCounter 
                  userId={userId} 
                  onReset={handleCounterReset}
                />
              </div>
            )}
          </motion.div>
        </GradientBox>
      </motion.div>

      <BuzzUnlockDialog
        open={showDialog}
        onPayment={handlePayment}
      />

      <BuzzExplosionHandler
        showExplosion={showExplosion}
        onExplosionCompleted={handleExplosionCompleted}
      />

      <ClueBanner
        open={showClueBanner}
        message={lastDynamicClue}
        onClose={() => setShowClueBanner(false)}
      />
    </>
  );
};

export default BuzzMainContent;
