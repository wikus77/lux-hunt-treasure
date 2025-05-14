
import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

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

  // Helper function to generate a new agent code
  const generateAgentCode = () => {
    const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let result = 'AG-';
    
    for (let i = 0; i < 5; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    
    return result;
  };
  
  useEffect(() => {
    const fetchAgentCode = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('agent_code')
            .eq('id', user.id)
            .single();

          if (error) {
            console.error("Error fetching profile:", error);
          } else if (profile && profile.agent_code) {
            setAgentCode(profile.agent_code);
          } else {
            const newAgentCode = generateAgentCode();
            setAgentCode(newAgentCode);
            
            const { error: updateError } = await supabase
              .from('profiles')
              .update({ agent_code: newAgentCode })
              .eq('id', user.id);

            if (updateError) {
              console.error("Error updating agent code:", updateError);
            }
          }
        }
      } catch (error) {
        console.error("Error in agent code fetch:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAgentCode();
  }, []);

  return (
    <div className={`bg-[#00E5FF]/20 px-3 py-1 rounded-md inline-flex items-center ${className}`}>
      {showLabel && (
        <span className="text-cyan-400 font-mono text-sm mr-1">DOSSIER:</span>
      )}
      <span className="font-mono text-white bg-cyan-900/30 px-2 py-0.5 rounded text-sm">
        {isLoading ? "..." : agentCode}
      </span>
    </div>
  );
};

export default AgentCodeDisplay;
