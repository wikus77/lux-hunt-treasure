
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";
import AgentInfoPopup from "@/components/agent/AgentInfoPopup";
import useSoundEffects from "@/hooks/useSoundEffects";
import { useLongPress } from "@/hooks/useLongPress";

const AgentBadge = () => {
  const [agentCode, setAgentCode] = useState<string | null>(null);
  const [show, setShow] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const isMobile = useIsMobile();
  const { playSound } = useSoundEffects();

  // Handle haptic feedback when long pressed (mobile) or clicked (desktop)
  const triggerHapticFeedback = () => {
    if (navigator.vibrate && isMobile) {
      navigator.vibrate(30); // 30ms vibration for subtle feedback
    }
  };

  // Enhanced long press handler with haptic feedback
  const longPressHandler = () => {
    setShowPopup(true);
    triggerHapticFeedback();
    playSound("agentClick", 0.3);
  };

  // Configure long press for mobile devices
  const longPress = useLongPress(longPressHandler, {
    threshold: 400,
    onStart: () => {
      // Optional: Show a visual indicator that long press is active
    }
  });

  // Regular click handler for desktop
  const handleClick = () => {
    if (!isMobile) {
      setShowPopup(true);
      playSound("agentClick", 0.3);
    }
  };

  const handleClose = () => {
    setShowPopup(false);
  };

  useEffect(() => {
    const fetchAgentCode = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      // First check for special admin case
      if (user?.email === "wikus77@hotmail.it") {
        setAgentCode("X0197");
        return;
      }
      
      // Only proceed if we have a user and they're not the special admin
      if (user) {
        try {
          // Use our new secure RPC function to get the agent code
          const { data, error } = await supabase
            .rpc('get_my_agent_code')
            .single();

          if (error) {
            console.error("Error fetching agent code:", error);
            return;
          }

          if (data?.agent_code) {
            setAgentCode(data.agent_code.replace("AG-", ""));
          }
        } catch (err) {
          console.error("Failed to fetch agent code:", err);
        }
      }
    };

    fetchAgentCode();
    
    // Set the delay for the glow animation
    const timer = setTimeout(() => setShow(true), 2000);
    
    return () => clearTimeout(timer);
  }, []);

  // Add backdrop blur when popup is open (mobile only)
  useEffect(() => {
    const mainContent = document.querySelector('main');
    if (mainContent && isMobile) {
      if (showPopup) {
        mainContent.style.filter = 'blur(3px)';
        mainContent.style.opacity = '0.6';
        mainContent.style.transition = 'filter 0.3s, opacity 0.3s';
      } else {
        mainContent.style.filter = '';
        mainContent.style.opacity = '';
      }
    }
    
    return () => {
      if (mainContent) {
        mainContent.style.filter = '';
        mainContent.style.opacity = '';
      }
    };
  }, [showPopup, isMobile]);

  return (
    <>
      <motion.div
        className={`
          fixed top-4 z-50
          flex items-center gap-2 px-3 py-0.5
          text-sm font-mono
          border border-white/20 shadow-md
          dynamic-island rounded-full transition-colors 
          ${show ? "opacity-100 animate-glow" : "opacity-0"}
          cursor-pointer hover:border-cyan-400/30 hover:bg-[#0e0e0e]/90
          active:scale-95
        `}
        onClick={handleClick}
        {...longPress}
        whileHover={{ scale: isMobile ? 1 : 1.1 }} // Only apply hover scale on desktop
        whileTap={{ scale: 0.98 }}
        initial={{ 
          opacity: 0,
          top: "16px",
          left: "50%",
          x: "-50%",
          transformOrigin: "center center",
          scale: 1.1 // 10% larger
        }}
        animate={{ 
          opacity: show ? 1 : 0,
          top: "16px",
          left: "50%",
          x: "-50%",
          transformOrigin: "center center",
          scale: 1.1 // 10% larger
        }}
        transition={{ 
          duration: 0.3, 
          ease: [0.4, 0, 0.2, 1]
        }}
        style={{
          position: "fixed",
          left: "50%",
          transform: "translateX(-50%) scale(1.1)", // 10% larger
          height: "42px" // Reduced height by 7% (from original 45-46px)
        }}
      >
        <span className="dynamic-code">M1-AGENT-{agentCode ?? "?????"}</span>
        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
      </motion.div>

      <AgentInfoPopup 
        isOpen={showPopup} 
        onClose={handleClose} 
        agentCode={agentCode}
      />
    </>
  );
};

export default AgentBadge;
