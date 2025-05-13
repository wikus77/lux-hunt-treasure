
import { supabase } from "@/integrations/supabase/client";

/**
 * Interface for agent confirmation data
 */
interface AgentConfirmationData {
  email: string;
  name: string;
  referral_code: string;
}

/**
 * Send a confirmation email to a new agent with their referral code
 */
export const sendAgentConfirmationEmail = async (data: AgentConfirmationData): Promise<boolean> => {
  try {
    // Pre-validation step - validate all required fields are present and non-empty
    if (!data.email || typeof data.email !== 'string' || !data.email.includes('@')) {
      console.error("Invalid or missing email in agent confirmation data:", data.email);
      throw new Error("Invalid email address for agent confirmation email");
    }
    
    if (!data.name || typeof data.name !== 'string') {
      console.error("Invalid or missing name in agent confirmation data:", data.name);
      throw new Error("Missing name for agent confirmation email");
    }
    
    // Validate the referral code is present
    if (!data.referral_code || typeof data.referral_code !== 'string') {
      console.error("Invalid or missing referral_code in agent confirmation data:", data.referral_code);
      throw new Error("Missing or invalid referral code for agent confirmation email");
    }
    
    console.log("Sending agent confirmation email with data:", JSON.stringify({
      email: data.email,
      name: data.name,
      referral_code: data.referral_code
    }, null, 2));
    
    // Use Supabase client to call the Edge Function instead of direct fetch
    // This automatically includes the required authorization headers
    const { data: responseData, error } = await supabase.functions.invoke("send-agent-confirmation", {
      body: {
        email: data.email,
        name: data.name,
        referral_code: data.referral_code
      }
    });
    
    // Log the response from the edge function
    if (error) {
      console.error("Edge function error:", error);
      return false;
    }
    
    console.log("Agent confirmation email result:", JSON.stringify(responseData, null, 2));
    
    if (!responseData || !responseData.success) {
      console.error("Email sending failed in edge function:", responseData);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Failed to send agent confirmation email:", error);
    return false;
  }
};
