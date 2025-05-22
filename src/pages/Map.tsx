
import React, { useEffect } from "react";
import { motion } from "framer-motion";
import MapLogicProvider from "./map/MapLogicProvider";
import { useBuzzClues } from "@/hooks/useBuzzClues";
import { useNotifications } from "@/hooks/useNotifications";
import { useLocation } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import BottomNavigation from "@/components/layout/BottomNavigation";
import UnifiedHeader from "@/components/layout/UnifiedHeader";
import GradientBox from "@/components/ui/gradient-box";

// Ensure we force HTTPS for geolocation
useEffect(() => {
  if (window.location.protocol === 'http:' && window.location.hostname !== 'localhost') {
    window.location.href = window.location.href.replace('http:', 'https:');
  }
}, []);

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
        <h1 className="text-4xl font-bold text-[#00D1FF] text-center mt-6 mb-8 font-orbitron" style={{ 
          textShadow: "0 0 10px rgba(0, 209, 255, 0.6), 0 0 20px rgba(0, 209, 255, 0.3)"
        }}>MAPPA</h1>
      </motion.div>
      
      <div className={`pt-4 ${isMobile ? 'sm:pt-6' : 'sm:pt-6'} h-full relative pb-20`}>
        <motion.div
          className="mx-4 mb-4 overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <GradientBox className="overflow-hidden">
            <MapLogicProvider />
          </GradientBox>
        </motion.div>
        
        <motion.div
          className="mx-4 overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <GradientBox className="p-4 text-center">
            <p className="text-[#00D1FF] font-medium" style={{ 
              textShadow: "0 0 5px rgba(0, 209, 255, 0.4)"
            }}>
              Ecco l'area stimata dove si trova il premio!
            </p>
          </GradientBox>
        </motion.div>
      </div>
      
      <BottomNavigation />
    </motion.div>
  );
};

export default Map;
