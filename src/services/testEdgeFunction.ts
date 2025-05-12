
import { supabase } from "@/integrations/supabase/client";

/**
 * Test function to manually verify edge function connectivity
 */
export const testSendAgentConfirmation = async (email: string, name: string, referralCode: string) => {
  try {
    console.log(`Testing send-agent-confirmation with email: ${email}, name: ${name}, referral_code: ${referralCode}`);
    
    const { data, error } = await supabase.functions.invoke('send-agent-confirmation', {
      body: {
        email,
        name,
        referral_code: referralCode
      }
    });
    
    if (error) {
      console.error("Error testing send-agent-confirmation:", error);
      return { success: false, error };
    }
    
    console.log("Test response:", data);
    return { success: true, data };
    
  } catch (error) {
    console.error("Exception testing send-agent-confirmation:", error);
    return { success: false, error };
  }
};

// You can call this function from browser console:
// import { testSendAgentConfirmation } from "./services/testEdgeFunction";
// testSendAgentConfirmation("test@example.com", "Test User", "TEST123");
