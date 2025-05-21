
import React, { useEffect } from "react";
import { motion } from "framer-motion";
import MapLogicProvider from "./map/MapLogicProvider";
import { useBuzzClues } from "@/hooks/useBuzzClues";
import { useNotifications } from "@/hooks/useNotifications";
import { useLocation } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import BottomNavigation from "@/components/layout/BottomNavigation";
import UnifiedHeader from "@/components/layout/UnifiedHeader";

const Map = () => {
  // Initialize the buzz clues context to make it available for dynamic pricing
  const { unlockedClues } = useBuzzClues();
  const { addNotification } = useNotifications();
  const location = useLocation();
  const isMobile = useIsMobile();
  
  useEffect(() => {
    // Log the current clue count for debugging
    console.log(`Current unlocked clues count: ${unlockedClues}`);

    // Check if we're returning from a successful payment with clue information
    if (location.state?.paymentCompleted && location.state?.clue && !location.state?.notificationSent) {
      // Add notification for the new clue
      addNotification({
        title: "Nuovo indizio sbloccato",
        description: location.state.clue.description,
      });
      
      // Mark notification as sent to prevent duplicates
      history.replaceState(
        { ...location.state, notificationSent: true },
        "",
        location.pathname
      );
    }
  }, [unlockedClues, location.state, addNotification]);

  return (
    <motion.div 
      className="min-h-screen bg-gradient-to-b from-[#131524]/70 to-black"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <UnifiedHeader />
      <div className="h-[72px] w-full" />
      
      <motion.div
        className="container mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <h1 className="text-4xl font-bold gradient-text-cyan text-center mt-6 mb-8">MAPPA</h1>
      </motion.div>
      
      <div className={`pt-4 ${isMobile ? 'sm:pt-6' : 'sm:pt-6'} h-full relative pb-20`}>
        <motion.div
          className="glass-card mx-4 mb-4 overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <MapLogicProvider />
        </motion.div>
        
        <motion.div
          className="glass-card mx-4 p-4 text-center text-white/80"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          Ecco l'area stimata dove si trova il premio!
        </motion.div>
      </div>
      
      <BottomNavigation />
    </motion.div>
  );
};

export default Map;
