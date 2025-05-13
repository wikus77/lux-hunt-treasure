
import { supabase } from "@/integrations/supabase/client";
import { SendEmailOptions, EmailType, EmailResult } from "./types";

/**
 * Send an email using Mailjet
 */
export const sendEmail = async (type: EmailType, options: SendEmailOptions): Promise<EmailResult> => {
  try {
    console.log(`Sending ${type} email via Mailjet Edge Function`);
    
    // Add detailed logging to help with debugging
    console.log("Email options:", JSON.stringify({
      type,
      to: options.to,
      subject: options.subject,
      variables: options.variables,
      templateId: options.templateId
    }, null, 2));
    
    // Make sure referral_code is explicitly included for agent_confirmation emails
    if (type === 'agent_confirmation' && options.variables) {
      console.log("Referral code in mailjetClient:", options.variables.referral_code);
    }
    
    const { data, error } = await supabase.functions.invoke('send-mailjet-email', {
      body: {
        type,
        ...options,
        from: options.from || {
          Email: "noreply@m1ssion.com",
          Name: "M1SSION",
        }
      }
    });

    if (error) {
      console.error('Error sending email:', error);
      return { success: false, error };
    }

    console.log('Email sent successfully:', data);
    return { success: true, data };
  } catch (err) {
    console.error('Exception when sending email:', err);
    return { success: false, error: err };
  }
};
