
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
      
      {/* Content positioned below header - CRITICAL FIX: Explicit spacing */}
      <div 
        className="w-full"
        style={{ 
          // FIXED: Safe zone (47px) + header height (72px) = 119px total
          paddingTop: '119px',
          marginTop: 0
        }}
      />
      
      <div className="container mx-auto">
        <motion.h1
          className="text-4xl font-orbitron font-bold text-[#00D1FF] text-center mt-6 mb-8"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          style={{ textShadow: "0 0 10px rgba(0, 209, 255, 0.6), 0 0 20px rgba(0, 209, 255, 0.3)" }}
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
