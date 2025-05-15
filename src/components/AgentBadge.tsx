
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";
import AgentInfoPopup from "@/components/agent/AgentInfoPopup";
import useSoundEffects from "@/hooks/useSoundEffects";

const AgentBadge = () => {
  const [agentCode, setAgentCode] = useState<string | null>(null);
  const [show, setShow] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);
  const [badgePosition, setBadgePosition] = useState<{top: number; left: number; width: number} | null>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const { playSound } = useSoundEffects();

  const handleMouseDown = () => {
    if (isMobile) {
      // Start timer for long press on mobile
      const timer = setTimeout(() => {
        capturePosition();
        setShowPopup(true);
        playSound("agentClick", 0.3);
      }, 500);
      setLongPressTimer(timer);
    }
  };

  const handleMouseUp = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  };

  const handleClick = () => {
    if (!isMobile) {
      capturePosition();
      setShowPopup(true);
      playSound("agentClick", 0.3);
    }
  };

  // Function to capture the current position of the badge element
  const capturePosition = () => {
    if (badgeRef.current) {
      const rect = badgeRef.current.getBoundingClientRect();
      setBadgePosition({
        top: rect.top,
        left: rect.left,
        width: rect.width
      });
    }
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
        ref={badgeRef}
        className={`
          flex items-center gap-2 px-3 py-1
          text-sm font-mono text-white 
          border border-white/20 shadow-md
          bg-[#0e0e0e]/80 rounded-full transition-all duration-300
          ${show ? "opacity-100 glow" : "opacity-0"}
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
      >
        <span className="text-cyan-400">M1-AGENT-{agentCode ?? "?????"}</span>
        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
      </motion.div>

      <AgentInfoPopup 
        isOpen={showPopup} 
        onClose={() => setShowPopup(false)} 
        agentCode={agentCode}
        triggerPosition={badgePosition}
      />
    </>
  );
};

export default AgentBadge;
