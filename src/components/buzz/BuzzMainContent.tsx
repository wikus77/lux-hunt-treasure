
import React, { useState } from "react";
import { motion } from "framer-motion";
import BuzzButton from "./BuzzButton";
import { useBuzzClues } from "@/hooks/buzz/useBuzzClues";
import { useAuth } from "@/hooks/useAuth";
import ErrorFallback from "../error/ErrorFallback";

const BuzzMainContent = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { incrementUnlockedCluesAndAddClue } = useBuzzClues();

  if (error) {
    return <ErrorFallback message={error} onRetry={() => setError(null)} />;
  }

  return (
    <div className="px-4 py-6 flex flex-col items-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8 text-center"
      >
        <h1 className="text-2xl font-bold mb-2">BUZZ</h1>
        <p className="text-muted-foreground">
          Premi il pulsante per ricevere indizi sulla posizione del premio
        </p>
      </motion.div>

      <BuzzButton 
        isLoading={isLoading}
        setIsLoading={setIsLoading}
        setError={setError}
        userId={user?.id || ""}
        onSuccess={incrementUnlockedCluesAndAddClue}
      />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="mt-8 text-center max-w-md"
      >
        <p className="text-sm text-muted-foreground">
          Ogni buzz genera un indizio casuale che potrebbe aiutarti a trovare il premio.
          Più indizi raccogli, maggiori saranno le tue possibilità!
        </p>
      </motion.div>
    </div>
  );
};

export default BuzzMainContent;
