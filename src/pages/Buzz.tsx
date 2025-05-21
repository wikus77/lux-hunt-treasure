
import React from "react";
import { motion } from "framer-motion";
import UnifiedHeader from "@/components/layout/UnifiedHeader";
import BuzzFeatureWrapper from "@/components/buzz/BuzzFeatureWrapper";
import BuzzMainContent from "@/components/buzz/BuzzMainContent";
import { ErrorBoundary } from "@/components/error/ErrorBoundary";
import ErrorFallback from "@/components/error/ErrorFallback";
import BottomNavigation from "@/components/layout/BottomNavigation";

const Buzz = () => {
  return (
    <motion.div 
      className="min-h-screen bg-gradient-to-b from-[#131524]/70 to-black pb-20 w-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <UnifiedHeader />
      <div className="h-[72px] w-full" />
      
      <div className="container mx-auto">
        <motion.h1
          className="text-4xl font-bold gradient-text-cyan text-center mt-6 mb-8"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          BUZZ
        </motion.h1>
        
        <ErrorBoundary fallback={<ErrorFallback message="Si è verificato un errore nel caricamento della funzione Buzz" />}>
          <BuzzFeatureWrapper>
            <BuzzMainContent />
          </BuzzFeatureWrapper>
        </ErrorBoundary>
      </div>
      
      <BottomNavigation />
    </motion.div>
  );
};

export default Buzz;
