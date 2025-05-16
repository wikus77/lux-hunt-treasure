
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ensureAgentCode, getAgentCodeForUser } from "@/services/agentCodeService";

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
        
        // For non-admin users, get or create the agent code
        const code = await ensureAgentCode(user.id);
        
        if (code) {
          setAgentCode(code);
        } else {
          setError(new Error("Failed to retrieve agent code"));
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
