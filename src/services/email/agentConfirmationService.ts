
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
    
    console.log("Edge function response status:", response.status);
    
    // Check if the response is valid
    if (!response.ok) {
      const errorData = await response.text();
      console.error("Edge function response error:", response.status, errorData);
      throw new Error(`Edge function error: ${response.status} - ${errorData}`);
    }
    
    let result;
    try {
      result = await response.json();
      console.log("Agent confirmation email result:", JSON.stringify(result, null, 2));
    } catch (parseError) {
      console.error("Failed to parse response JSON:", parseError);
      console.log("Response text:", await response.text());
      throw new Error("Invalid JSON response from edge function");
    }
    
    if (!result.success) {
      console.error("Email sending failed in edge function:", result);
      return false;
    }
    
    return result.success;
  } catch (error) {
    console.error("Failed to send agent confirmation email:", error);
    return false;
  }
};
