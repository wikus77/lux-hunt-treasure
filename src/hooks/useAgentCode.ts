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

        // Special case for admin user
        const SPECIAL_ADMIN_EMAIL = 'wikus77@hotmail.it';
        const SPECIAL_ADMIN_CODE = 'X0197';

        // First, check if the user is the admin
        if (user.email?.toLowerCase() === SPECIAL_ADMIN_EMAIL.toLowerCase()) {
          setAgentCode(SPECIAL_ADMIN_CODE);
          setIsLoading(false);
          return;
        }
        
        // For non-admin users, use our new secure RPC function
        const { data, error: rpcError } = await supabase
          .rpc('get_my_agent_code')
          .single();

        if (rpcError) {
          console.error("Error fetching agent code from RPC:", rpcError);
          // Fallback to the original method if RPC fails
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
              const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
              const RESERVED_ADMIN_CODE = 'X0197';
              
              let newCode;
              let isUnique = false;
              
              // Keep generating until we have a unique code that's not the admin code
              while (!isUnique) {
                const random = Array.from({ length: 5 }, () =>
                  characters[Math.floor(Math.random() * characters.length)]
                ).join('');
                
                newCode = `AG-${random}`;
                
                // Skip if this is the admin code
                if (newCode === RESERVED_ADMIN_CODE) {
                  continue;
                }
                
                // Verify the code doesn't already exist
                const { data: existingCode } = await supabase
                  .from('profiles')
                  .select('agent_code')
                  .eq('agent_code', newCode)
                  .maybeSingle();
                  
                isUnique = !existingCode;
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
        } else if (data && data.agent_code) {
          setAgentCode(data.agent_code);
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
            const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
            const RESERVED_ADMIN_CODE = 'X0197';
            
            let newCode;
            let isUnique = false;
            
            // Keep generating until we have a unique code that's not the admin code
            while (!isUnique) {
              const random = Array.from({ length: 5 }, () =>
                characters[Math.floor(Math.random() * characters.length)]
              ).join('');
              
              newCode = `AG-${random}`;
              
              // Skip if this is the admin code
              if (newCode === RESERVED_ADMIN_CODE) {
                continue;
              }
              
              // Verify the code doesn't already exist
              const { data: existingCode } = await supabase
                .from('profiles')
                .select('agent_code')
                .eq('agent_code', newCode)
                .maybeSingle();
                
              isUnique = !existingCode;
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
