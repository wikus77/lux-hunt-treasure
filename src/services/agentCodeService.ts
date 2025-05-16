
import { supabase } from "@/integrations/supabase/client";
import { generateUniqueAgentCode } from "@/utils/agentCodeGenerator";

/**
 * Gets the agent code for a specific user
 * 
 * @param userId - The user's ID
 * @returns The agent code or null if not found
 */
export const getAgentCodeForUser = async (userId: string): Promise<string | null> => {
  // Get the agent code using the RPC function
  const { data, error } = await supabase
    .rpc('get_my_agent_code')
    .single();

  if (error) {
    console.error("Error fetching agent code from RPC:", error);
    
    // Fallback to direct query
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('agent_code')
      .eq('id', userId)
      .single();

    if (profileError && profileError.code !== 'PGRST116') {
      console.error("Error fetching profile:", profileError);
      return null;
    }
    
    return profile?.agent_code || null;
  }
  
  return data?.agent_code || null;
};

/**
 * Saves a new agent code for a user
 * 
 * @param userId - The user's ID
 * @param agentCode - The agent code to save
 * @returns Whether the operation was successful
 */
export const saveAgentCodeForUser = async (userId: string, agentCode: string): Promise<boolean> => {
  const { error } = await supabase
    .from('profiles')
    .update({ agent_code: agentCode })
    .eq('id', userId);
  
  if (error) {
    console.error("Failed to save agent code:", error);
    return false;
  }
  
  return true;
};

/**
 * Creates or retrieves an agent code for a user
 * 
 * @param userId - The user's ID
 * @returns The agent code or null if the operation failed
 */
export const ensureAgentCode = async (userId: string): Promise<string | null> => {
  try {
    // First check if the user already has an agent code
    const existingCode = await getAgentCodeForUser(userId);
    
    if (existingCode) {
      return existingCode;
    }
    
    // Call the edge function first to ensure the user has an agent code
    try {
      const { data, error } = await supabase.functions.invoke('ensure-agent-code', {
        body: { userId }
      });

      if (error) {
        throw error;
      }

      if (data && data.success && data.agentCode) {
        return data.agentCode;
      }
    } catch (fnError) {
      console.error("Error from edge function:", fnError);
      // Continue to fallback
    }
    
    // Fallback: Generate a code on the client and save it
    const newCode = await generateUniqueAgentCode();
    const saveSuccess = await saveAgentCodeForUser(userId, newCode);
    
    return saveSuccess ? newCode : null;
  } catch (e) {
    console.error("Error ensuring agent code:", e);
    return null;
  }
};
