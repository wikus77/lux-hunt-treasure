import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";

interface AgentCodeDisplayProps {
  className?: string;
  showLabel?: boolean;
}

const AgentCodeDisplay: React.FC<AgentCodeDisplayProps> = ({ 
  className = "", 
  showLabel = true 
}) => {
  const [agentCode, setAgentCode] = useState<string>("AG-X480"); // Default code
  const [isLoading, setIsLoading] = useState(true);
  const [isCodeVisible, setIsCodeVisible] = useState(false);

  // Special admin constants
  const SPECIAL_ADMIN_EMAIL = 'wikus77@hotmail.it';
  const SPECIAL_ADMIN_CODE = 'X0197';
  
  // Helper function to generate a new agent code
  const generateAgentCode = async () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const RESERVED_ADMIN_CODE = 'X0197';
    
    let code;
    let exists = true;
    
    while (exists) {
      const random = Array.from({ length: 5 }, () =>
        characters[Math.floor(Math.random() * characters.length)]
      ).join('');
      
      code = `AG-${random}`;
      
      // Skip if this is the reserved admin code
      if (code === RESERVED_ADMIN_CODE) {
        continue;
      }
      
      // Check if the code already exists
      const { data } = await supabase
        .from('profiles')
        .select('agent_code')
        .eq('agent_code', code)
        .maybeSingle();
        
      exists = !!data;
    }
    
    return code;
  };
  
  useEffect(() => {
    const fetchAgentCode = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          // Check if this is the special admin
          if (user.email?.toLowerCase() === SPECIAL_ADMIN_EMAIL.toLowerCase()) {
            setAgentCode(SPECIAL_ADMIN_CODE);
            setIsLoading(false);
            return;
          }
          
          // Otherwise check if they have an agent code in their profile
          const { data } = await supabase
            .from('profiles')
            .select('agent_code')
            .eq('id', user.id)
            .single();
            
          if (data?.agent_code) {
            setAgentCode(data.agent_code);
          }
        }
      } catch (error) {
        console.error("Error fetching agent code:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAgentCode();
    
    // Typewriter effect for agent dossier - increased to 2 seconds
    const timer = setTimeout(() => {
      setIsCodeVisible(true);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`bg-[#00E5FF]/20 px-3 py-1 rounded-md inline-flex items-center ${className}`}>
      {showLabel && (
        <span className="text-cyan-400 font-mono text-sm mr-1">DOSSIER:</span>
      )}
      <motion.span 
        className="font-mono text-white bg-cyan-900/30 px-2 py-0.5 rounded text-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: isCodeVisible ? 1 : 0 }}
        transition={{ duration: 1.0 }}
      >
        {isLoading ? "..." : agentCode}
      </motion.span>
    </div>
  );
};

export default AgentCodeDisplay;
