
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useAgentIdFetcher = () => {
  const [agentId, setAgentId] = useState("");
  
  useEffect(() => {
    const fetchAgentCode = async () => {
      // Try to get the agent code from Supabase if the user is logged in
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          // Special admin case
          if (user.email === "wikus77@hotmail.it") {
            setAgentId("X0197");
            localStorage.setItem("m1-agent-id", "X0197");
            return;
          }
          
          // Get agent code from database
          const { data, error } = await supabase
            .rpc('get_my_agent_code')
            .single();

          if (!error && data?.agent_code) {
            const code = data.agent_code.replace("AG-", "");
            setAgentId(code);
            localStorage.setItem("m1-agent-id", code);
          } else {
            // Fallback to stored code
            const storedId = localStorage.getItem("m1-agent-id");
            if (storedId) {
              setAgentId(storedId);
            } else {
              // Generate a new code only if nothing is available
              const randomId = `XX${Math.floor(100 + Math.random() * 900)}`;
              localStorage.setItem("m1-agent-id", randomId);
              setAgentId(randomId);
            }
          }
        } else {
          // Not logged in, use stored or generate code
          const storedId = localStorage.getItem("m1-agent-id");
          if (storedId) {
            setAgentId(storedId);
          } else {
            const randomId = `XX${Math.floor(100 + Math.random() * 900)}`;
            localStorage.setItem("m1-agent-id", randomId);
            setAgentId(randomId);
          }
        }
      } catch (error) {
        // Fallback in case of any error
        console.error("Error fetching agent code:", error);
        const storedId = localStorage.getItem("m1-agent-id");
        if (storedId) {
          setAgentId(storedId);
        } else {
          const randomId = `XX${Math.floor(100 + Math.random() * 900)}`;
          localStorage.setItem("m1-agent-id", randomId);
          setAgentId(randomId);
        }
      }
    };

    fetchAgentCode();
  }, []);

  return { agentId };
};

export default useAgentIdFetcher;
