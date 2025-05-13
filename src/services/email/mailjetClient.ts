
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
      templateId: options.templateId,
      variables: options.variables,
      trackOpens: options.trackOpens,
      trackClicks: options.trackClicks,
      customCampaign: options.customCampaign
    }, null, 2));
    
    // Make sure referral_code is explicitly logged when present
    if (options.variables?.referral_code) {
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
