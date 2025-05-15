
import React, { useState, useEffect } from 'react';
import { useAuthContext } from '@/contexts/auth';
import { supabase } from "@/integrations/supabase/client";

interface AgentCodeDisplayProps {
  agentCode?: string;
}

const AgentCodeDisplay: React.FC<AgentCodeDisplayProps> = ({ agentCode: propAgentCode }) => {
  const [agentCode, setAgentCode] = useState<string>(propAgentCode || "AG-????");
  const { isAuthenticated } = useAuthContext();

  useEffect(() => {
    if (propAgentCode) {
      setAgentCode(propAgentCode);
      return;
    }

    const fetchAgentCode = async () => {
      // Solo se l'utente è autenticato, recupera il codice agente
      if (isAuthenticated) {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          
          if (user) {
            const { data, error } = await supabase
              .from('profiles')
              .select('agent_code')
              .eq('id', user.id)
              .single();
              
            if (data?.agent_code) {
              setAgentCode(data.agent_code);
            }
          }
        } catch (error) {
          console.error("Errore nel recupero del codice agente:", error);
        }
      }
    };

    fetchAgentCode();
  }, [isAuthenticated, propAgentCode]);

  return (
    <div className="flex items-center justify-center">
      <div className="px-3 py-1 bg-black/40 border border-cyan-400/30 rounded-md flex items-center">
        <div className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse mr-2"></div>
        <span className="text-sm text-cyan-400 font-mono">
          {isAuthenticated ? agentCode : "M1-AGENT"}
        </span>
      </div>
    </div>
  );
};

export default AgentCodeDisplay;
