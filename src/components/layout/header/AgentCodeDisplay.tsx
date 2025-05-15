import React, { useState, useEffect } from 'react';
import { useAuthContext } from '@/contexts/auth';
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";

interface AgentCodeDisplayProps {
  agentCode?: string;
}

const AgentCodeDisplay: React.FC<AgentCodeDisplayProps> = ({ agentCode: propAgentCode }) => {
  const [agentCode, setAgentCode] = useState<string | null>(propAgentCode || null);
  const [isCodeVisible, setIsCodeVisible] = useState(false);
  const { isAuthenticated, user } = useAuthContext();
  
  // Special admin constant
  const SPECIAL_ADMIN_EMAIL = 'wikus77@hotmail.it';
  const SPECIAL_ADMIN_CODE = 'X0197';

  useEffect(() => {
    if (propAgentCode) {
      setAgentCode(propAgentCode);
      return;
    }

    const fetchAgentCode = async () => {
      // Only fetch agent code if user is authenticated
      if (isAuthenticated && user) {
        try {
          // Check if it's the special admin user
          if (user.email?.toLowerCase() === SPECIAL_ADMIN_EMAIL.toLowerCase()) {
            setAgentCode(SPECIAL_ADMIN_CODE);
            return;
          }
          
          // Otherwise retrieve the agent code from profile
          const { data, error } = await supabase
            .from('profiles')
            .select('agent_code')
            .eq('id', user.id)
            .single();
            
          if (data?.agent_code) {
            setAgentCode(data.agent_code);
          }
        } catch (error) {
          console.error("Error fetching agent code:", error);
        }
      }
    };

    fetchAgentCode();
    
    // Add animation delay - increased to 2 seconds as requested
    const timer = setTimeout(() => {
      setIsCodeVisible(true);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, [isAuthenticated, propAgentCode, user]);

  return (
    <div className="flex items-center justify-center">
      <div className="px-3 py-1 bg-black/40 border border-cyan-400/30 rounded-md flex items-center">
        <div className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse mr-2"></div>
        <span className="text-sm text-cyan-400 font-mono">
          M1-AGENT
          {isAuthenticated && (
            <>
              {agentCode && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: isCodeVisible ? 1 : 0 }}
                  transition={{ duration: 1.0 }}
                  className={isCodeVisible ? "text-cyan-400 animate-glow" : ""}
                >
                  -{agentCode}
                </motion.span>
              )}
              {!agentCode && "-????"}
            </>
          )}
        </span>
      </div>
    </div>
  );
};

export default AgentCodeDisplay;
