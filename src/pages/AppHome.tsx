
import React from 'react';
import { motion } from 'framer-motion';
import { useLaunchReset } from '@/hooks/useLaunchReset';
import FullScreenLoader from '@/components/layout/FullScreenLoader';
import { CluesSection } from '@/components/home/CluesSection';
import BottomNavigation from '@/components/layout/BottomNavigation';
import UnifiedHeader from "@/components/layout/UnifiedHeader";

const AppHome = () => {
  const { isResetting } = useLaunchReset();
  
  // CRITICAL: Block UI during reset to prevent race conditions
  if (isResetting) {
    return <FullScreenLoader text="Reset sistema in corso..." />;
  }

  // Normal home content
  return (
    <motion.div 
      className="bg-gradient-to-b from-[#131524]/70 to-black min-h-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Fixed Header */}
      <header 
        className="fixed top-0 left-0 right-0 z-50"
        style={{
          height: '72px',
          paddingTop: 'env(safe-area-inset-top, 47px)',
          backgroundColor: 'rgba(19, 21, 36, 0.7)',
          backdropFilter: 'blur(12px)'
        }}
      >
        <UnifiedHeader />
      </header>
      
      {/* Main scrollable content */}
      <main
        style={{
          paddingTop: 'calc(72px + env(safe-area-inset-top, 47px) + 40px)',
          paddingBottom: 'calc(80px + env(safe-area-inset-bottom, 34px))',
          minHeight: '100dvh',
          overflowY: 'auto',
          position: 'relative',
          zIndex: 0
        }}
      >
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto px-3 sm:px-4 space-y-6">
            <CluesSection />
          </div>
        </div>
      </main>
      
      <BottomNavigation />
    </motion.div>
  );
};

export default AppHome;
