
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
      className="min-h-screen bg-gradient-to-b from-[#131524]/70 to-black w-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      style={{ overflow: 'hidden' }}
    >
      {/* Fixed Header */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <UnifiedHeader />
      </div>
      
      {/* CRITICAL FIX: Main content with proper scroll containment */}
      <main
        style={{
          paddingTop: 'calc(72px + 47px)', // Header height + safe zone top
          paddingBottom: 'calc(64px + 34px)', // Bottom nav + safe zone bottom
          maxHeight: '100dvh',
          overflowY: 'auto',
          overflowX: 'hidden',
          position: 'relative',
          zIndex: 0
        }}
      >
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
      </main>
      
      <BottomNavigation />
    </motion.div>
  );
};

export default Buzz;
