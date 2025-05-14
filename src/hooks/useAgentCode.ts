
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useAgentCode = () => {
  const [agentCode, setAgentCode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchAgentCode = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Get the current authenticated user
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setIsLoading(false);
          return;
        }

        // First, check if the user already has an agent code in their profile
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('agent_code')
          .eq('id', user.id)
          .single();

        if (profileError && profileError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
          console.error("Error fetching profile:", profileError);
          setError(new Error("Failed to fetch agent code"));
        } else if (profile && profile.agent_code) {
          // If the user has an agent code, use it
          setAgentCode(profile.agent_code);
        } else {
          try {
            // Call the edge function to ensure the user has an agent code
            const { data, error } = await supabase.functions.invoke('ensure-agent-code', {
              body: { userId: user.id }
            });

            if (error) {
              throw error;
            }

            if (data && data.success && data.agentCode) {
              setAgentCode(data.agentCode);
            } else {
              throw new Error('Failed to retrieve agent code');
            }
          } catch (fnError) {
            console.error("Error from edge function:", fnError);
            
            // Fallback: Generate a code on the client and save it
            const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
            let newCode = 'AG-';
            
            for (let i = 0; i < 5; i++) {
              newCode += characters.charAt(Math.floor(Math.random() * characters.length));
            }

            // Save the generated code to the user's profile
            const { error: updateError } = await supabase
              .from('profiles')
              .update({ agent_code: newCode })
              .eq('id', user.id);

            if (updateError) {
              console.error("Failed to save agent code:", updateError);
              setError(new Error("Failed to generate agent code"));
            } else {
              setAgentCode(newCode);
            }
          }
        }
      } catch (e) {
        console.error("Error fetching agent code:", e);
        setError(e instanceof Error ? e : new Error('Unknown error'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchAgentCode();
  }, []);

  return {
    agentCode,
    isLoading,
    error
  };
};

export default useAgentCode;
