
import React, { useState, useEffect } from 'react';
import { useAuthContext } from '@/contexts/auth';
import { supabase } from "@/integrations/supabase/client";

interface AgentCodeDisplayProps {
  agentCode?: string;
}

const AgentCodeDisplay: React.FC<AgentCodeDisplayProps> = ({ agentCode: propAgentCode }) => {
  const [agentCode, setAgentCode] = useState<string | null>(propAgentCode || null);
  const { isAuthenticated } = useAuthContext();
  
  // Costante per l'utente admin speciale
  const SPECIAL_ADMIN_EMAIL = 'wikus77@hotmail.it';
  const SPECIAL_ADMIN_CODE = 'X0197';

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
            // Verifica se è l'utente speciale admin
            if (user.email?.toLowerCase() === SPECIAL_ADMIN_EMAIL.toLowerCase()) {
              setAgentCode(SPECIAL_ADMIN_CODE);
              return;
            }
            
            // Altrimenti recupera il codice agente dal profilo
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
          {isAuthenticated 
            ? `M1-AGENT${agentCode ? `-${agentCode}` : '-????'}`
            : "M1-AGENT"}
        </span>
      </div>
    </div>
  );
};

export default AgentCodeDisplay;
