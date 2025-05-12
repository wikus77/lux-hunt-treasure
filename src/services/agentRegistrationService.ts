
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { generateReferralCode } from "@/components/landing/pre-registration/referralUtils";
import { logActivity } from "./activityLogService";

interface AgentRegistrationData {
  name: string;
  email: string;
}

/**
 * Register a new agent and send confirmation email
 */
export const registerAgent = async (data: AgentRegistrationData): Promise<{success: boolean, referralCode?: string, error?: string}> => {
  const { name, email } = data;
  
  try {
    // Generate a unique referral code for the agent
    const referralCode = generateReferralCode(name);
    
    console.log(`Registering new agent: ${name} (${email}) with referral code: ${referralCode}`);
    
    // Check if this email is already registered
    const { data: existingAgent, error: checkError } = await supabase
      .from('pre_registrations')
      .select('id, referral_code')
      .eq('email', email.toLowerCase().trim())
      .maybeSingle();
    
    if (checkError) {
      console.error("Error checking for existing agent:", checkError);
      throw new Error("Errore nella verifica dell'email");
    }
    
    // If agent already exists, return their existing referral code
    if (existingAgent) {
      console.log("Agent already exists, returning existing referral code");
      
      // Log the agent registration attempt
      await logActivity({
        userEmail: email,
        action: 'agent_registration_repeat',
        metadata: {
          name,
          existing_referral_code: existingAgent.referral_code
        }
      });
      
      // Send confirmation email with the existing referral code
      const emailSent = await sendAgentConfirmationEmail(name, email, existingAgent.referral_code);
      
      return { 
        success: true, 
        referralCode: existingAgent.referral_code,
        error: emailSent ? undefined : "Email inviata, ma potrebbero esserci ritardi nella consegna"
      };
    }
    
    // Register the new agent
    const { data: newAgent, error: insertError } = await supabase
      .from('pre_registrations')
      .insert([
        {
          name: name.trim(),
          email: email.toLowerCase().trim(),
          referral_code: referralCode,
          credits: 100,
          confirmed: true
        }
      ])
      .select()
      .single();
    
    if (insertError) {
      console.error("Error registering new agent:", insertError);
      throw new Error("Errore nella registrazione dell'agente");
    }
    
    console.log("Agent registered successfully:", newAgent);
    
    // Log the agent registration
    await logActivity({
      userEmail: email,
      action: 'agent_registration',
      metadata: {
        name,
        referral_code: referralCode
      }
    });
    
    // Send confirmation email
    const emailSent = await sendAgentConfirmationEmail(name, email, referralCode);
    
    return { 
      success: true, 
      referralCode,
      error: emailSent ? undefined : "Email inviata, ma potrebbero esserci ritardi nella consegna"
    };
    
  } catch (error: any) {
    console.error("Error in agent registration:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Si è verificato un errore durante la registrazione"
    };
  }
};

/**
 * Send confirmation email to the agent
 * FIXED: Direct call to the send-agent-confirmation edge function without any fallback
 */
export const sendAgentConfirmationEmail = async (
  name: string, 
  email: string, 
  referralCode: string
): Promise<boolean> => {
  try {
    console.log(`Sending agent confirmation email to ${email} with code ${referralCode}`);
    
    // EXCLUSIVE: Direct call to the send-agent-confirmation edge function
    const { data, error } = await supabase.functions.invoke('send-agent-confirmation', {
      body: {
        email,
        name,
        referral_code: referralCode
      }
    });
    
    if (error) {
      console.error("Error invoking send-agent-confirmation function:", error);
      return false;
    }
    
    console.log("Agent confirmation email response:", data);
    
    // Log the email activity
    await logActivity({
      userEmail: email,
      action: 'agent_email_sent',
      metadata: {
        name,
        referral_code: referralCode
      }
    });
    
    return true;
  } catch (error) {
    console.error("Exception in sending agent confirmation email:", error);
    return false;
  }
};

/**
 * Test utility function to manually test the agent confirmation email
 * This should be called only on demand, not automatically
 */
export const testSendAgentConfirmation = async (
  email: string,
  name: string = "Test Agent"
): Promise<boolean> => {
  try {
    const testReferralCode = "TEST" + Math.floor(Math.random() * 10000);
    console.log(`[TEST] Sending test agent email to ${email} with code ${testReferralCode}`);
    
    const result = await sendAgentConfirmationEmail(name, email, testReferralCode);
    console.log(`[TEST] Email send result: ${result ? "success" : "failed"}`);
    
    return result;
  } catch (error) {
    console.error("[TEST] Error in test send:", error);
    return false;
  }
};
