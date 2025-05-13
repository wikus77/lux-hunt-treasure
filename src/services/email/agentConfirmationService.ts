
import { sendEmail } from "./mailjetClient";

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
    // Validate the referral code is present
    if (!data.referral_code) {
      console.error("Missing referral_code in agent confirmation data", data);
      throw new Error("Missing referral code for agent confirmation email");
    }
    
    console.log("Sending agent confirmation email with data:", JSON.stringify({
      email: data.email,
      name: data.name,
      referral_code: data.referral_code
    }, null, 2));
    
    // Call the Supabase edge function directly
    const response = await fetch("https://vkjrqirvdvjbemsfzxof.supabase.co/functions/v1/send-agent-confirmation", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json" 
      },
      body: JSON.stringify({
        email: data.email,
        name: data.name,
        referral_code: data.referral_code
      })
    });
    
    const result = await response.json();
    console.log("Agent confirmation email result:", JSON.stringify(result, null, 2));
    
    return result.success;
  } catch (error) {
    console.error("Failed to send agent confirmation email:", error);
    return false;
  }
};
