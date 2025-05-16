import { supabase } from "@/integrations/supabase/client";

/**
 * Generates a unique agent code for a user
 * 
 * @returns A promise resolving to a unique agent code
 */
export const generateUniqueAgentCode = async (): Promise<string> => {
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
    if (newCode === `AG-${RESERVED_ADMIN_CODE}`) {
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

  return newCode;
};
