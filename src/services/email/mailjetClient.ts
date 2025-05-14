
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
      from: options.from || {
        Email: "contact@m1ssion.com", // Changed from noreply@m1ssion.com to contact@m1ssion.com
        Name: "M1SSION",
      },
      subject: options.subject,
      templateId: options.templateId,
      variables: options.variables ? {
        ...options.variables,
        referral_code: options.variables.referral_code
      } : undefined,
      trackOpens: options.trackOpens !== false,
      trackClicks: options.trackClicks !== false,
      customCampaign: options.customCampaign || type
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
          Email: "contact@m1ssion.com", // Changed from noreply@m1ssion.com to contact@m1ssion.com
          Name: "M1SSION",
        },
        // Ensure tracking is enabled by default
        trackOpens: options.trackOpens !== false,
        trackClicks: options.trackClicks !== false,
        // Ensure we have a customCampaign for tracking
        customCampaign: options.customCampaign || type
      }
    });

    if (error) {
      console.error('Error sending email:', error);
      
      // Add more detailed error logging
      if (typeof error === 'object') {
        console.error('Error details:', JSON.stringify(error, null, 2));
      }
      
      return { success: false, error };
    }

    console.log('Email sent successfully:', data);
    return { success: true, data };
  } catch (err) {
    console.error('Exception when sending email:', err);
    
    // Add more detailed error logging for exceptions
    if (err instanceof Error) {
      console.error('Error message:', err.message);
      console.error('Error stack:', err.stack);
    } else if (typeof err === 'object') {
      console.error('Error details:', JSON.stringify(err, null, 2));
    }
    
    return { success: false, error: err };
  }
};
