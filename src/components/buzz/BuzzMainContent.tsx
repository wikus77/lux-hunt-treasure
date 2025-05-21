
import React, { useState } from "react";
import { motion } from "framer-motion";
import BuzzButton from "./BuzzButton";
import { useBuzzClues } from "@/hooks/buzz/useBuzzClues";
import { useAuth } from "@/hooks/useAuth";
import ErrorFallback from "../error/ErrorFallback";
import GradientBox from "@/components/ui/gradient-box";

const BuzzMainContent = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { incrementUnlockedCluesAndAddClue } = useBuzzClues();

  if (error) {
    return <ErrorFallback message={error} onRetry={() => setError(null)} />;
  }

  return (
    <motion.div 
      className="min-h-[80vh] flex flex-col items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mb-12 text-center"
      >
        <h1 className="text-3xl sm:text-4xl font-bold mb-2 gradient-text-cyan glow-text">BUZZ</h1>
        <p className="text-white/70 max-w-md mx-auto">
          Premi il pulsante per ricevere indizi sulla posizione del premio
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ 
          type: "spring",
          stiffness: 260,
          damping: 20,
          delay: 0.2
        }}
      >
        <BuzzButton 
          isLoading={isLoading}
          setIsLoading={setIsLoading}
          setError={setError}
          userId={user?.id || ""}
          onSuccess={incrementUnlockedCluesAndAddClue}
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        <GradientBox className="mt-12 text-center max-w-md p-6">
          <p className="text-white/80">
            Effettua il pagamento e premiati puoi ottenere degli indizi esclusivi
          </p>
        </GradientBox>
      </motion.div>
    </motion.div>
  );
};

export default BuzzMainContent;
