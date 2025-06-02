
import React, { useState } from "react";
import { motion } from "framer-motion";
import BuzzButton from "./BuzzButton";
import { useBuzzClues } from "@/hooks/buzz/useBuzzClues";
import { useAuth } from "@/hooks/useAuth";
import { useDynamicIsland } from "@/hooks/useDynamicIsland";
import ErrorFallback from "../error/ErrorFallback";
import GradientBox from "@/components/ui/gradient-box";

const BuzzMainContent = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { incrementUnlockedCluesAndAddClue } = useBuzzClues();
  const { startActivity, updateActivity, endActivity } = useDynamicIsland();

  const handleBuzzSuccess = async (data: any) => {
    // Start Dynamic Island activity when buzz area is generated
    if (data?.area) {
      await startActivity({
        missionId: `buzz-${Date.now()}`,
        title: "Operazione Firenze",
        status: "Area Buzz generata",
        progress: 25, // 25% progress for area generation
        timeLeft: 3600, // 1 hour countdown
      });

      // Update progress after a short delay (simulation)
      setTimeout(async () => {
        await updateActivity({
          status: "Analisi in corso",
          progress: 50,
        });
      }, 3000);
    }

    // Call original success handler
    incrementUnlockedCluesAndAddClue();
  };

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
        <h1 className="text-3xl sm:text-4xl font-bold mb-2 text-[#00D1FF] font-orbitron" style={{ 
          textShadow: "0 0 10px rgba(0, 209, 255, 0.6), 0 0 20px rgba(0, 209, 255, 0.3)"
        }}>BUZZ</h1>
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
          onSuccess={handleBuzzSuccess}
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
