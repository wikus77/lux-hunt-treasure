
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";
import AgentInfoPopup from "@/components/agent/AgentInfoPopup";
import useSoundEffects from "@/hooks/useSoundEffects";

const AgentBadge = () => {
  const [agentCode, setAgentCode] = useState<string | null>(null);
  const [show, setShow] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);
  const [pressStartTime, setPressStartTime] = useState<number | null>(null);
  const isMobile = useIsMobile();
  const { playSound } = useSoundEffects();

  const handleMouseDown = () => {
    // Start timer for long press on mobile (350ms)
    if (isMobile) {
      setPressStartTime(Date.now());
      const timer = setTimeout(() => {
        setShowPopup(true);
        playSound("agentClick", 0.3);
      }, 350);
      setLongPressTimer(timer);
    }
  };

  const handleMouseUp = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
      
      // If it was a short tap (less than 350ms), treat as a click
      if (pressStartTime && Date.now() - pressStartTime < 350) {
        if (!isMobile) {
          setShowPopup(true);
          playSound("agentClick", 0.3);
        }
      }
    }
  };

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

  return (
    <>
      <motion.div
        className={`
          fixed top-4 z-50
          flex items-center gap-2 px-3 py-1
          text-sm font-mono text-white 
          border border-white/20 shadow-md
          bg-[#0e0e0e]/80 rounded-full transition-colors 
          ${show ? "opacity-100 animate-glow" : "opacity-0"}
          cursor-pointer hover:border-cyan-400/30 hover:bg-[#0e0e0e]/90
          active:scale-95
        `}
        onClick={handleClick}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onTouchStart={handleMouseDown}
        onTouchEnd={handleMouseUp}
        onTouchCancel={handleMouseUp}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        initial={{ 
          opacity: 0,
          top: "16px",
          left: "50%",
          x: "-50%",
          transformOrigin: "center center"
        }}
        animate={{ 
          opacity: show ? 1 : 0,
          top: "16px",
          left: "50%",
          x: "-50%",
          transformOrigin: "center center"
        }}
        transition={{ 
          duration: 0.3, 
          ease: [0.4, 0, 0.2, 1]
        }}
        style={{
          position: "fixed",
          left: "50%",
          transform: "translateX(-50%)"
        }}
      >
        <span className="text-cyan-400">M1-AGENT-{agentCode ?? "?????"}</span>
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
