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
        const RESERVED_ADMIN_EMAIL = 'wikus77@hotmail.it';
        const RESERVED_ADMIN_CODE = 'AG-X019';

        // First, check if the user is the admin
        if (user.email?.toLowerCase() === RESERVED_ADMIN_EMAIL.toLowerCase()) {
          // Check if they already have the reserved code
          const { data: adminProfile, error: adminProfileError } = await supabase
            .from('profiles')
            .select('agent_code')
            .eq('id', user.id)
            .single();
            
          if (adminProfileError) {
            console.error("Error fetching admin profile:", adminProfileError);
            setError(new Error("Failed to fetch agent code"));
          } else if (!adminProfile || adminProfile.agent_code !== RESERVED_ADMIN_CODE) {
            // If admin doesn't have the reserved code, set it
            const { error: updateError } = await supabase
              .from('profiles')
              .update({ agent_code: RESERVED_ADMIN_CODE })
              .eq('id', user.id);
              
            if (updateError) {
              console.error("Error assigning admin code:", updateError);
              setError(new Error("Failed to assign admin code"));
            } else {
              setAgentCode(RESERVED_ADMIN_CODE);
            }
          } else {
            // Admin already has the correct code
            setAgentCode(RESERVED_ADMIN_CODE);
          }
          setIsLoading(false);
          return;
        }
        
        // For non-admin users, check if they already have a code in profile
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
            const RESERVED_ADMIN_CODE = 'AG-X019';
            
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
