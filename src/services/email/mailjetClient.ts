
import { supabase } from "@/integrations/supabase/client";
import { SendEmailOptions, EmailType, EmailResult } from "./types";

/**
 * Send an email using Mailjet
 */
export const sendEmail = async (type: EmailType, options: SendEmailOptions): Promise<EmailResult> => {
  try {
    console.log(`📧 Sending ${type} email via Mailjet`);
    
    const { data, error } = await supabase.functions.invoke('send-mailjet-email', {
      body: {
        type,
        ...options,
        from: options.from || {
          Email: "contact@m1ssion.com",
          Name: "M1SSION",
        }
      }
    });

    if (error) {
      console.error('❌ Error sending email');
      return { success: false, error };
    }

    console.log('✅ Email sent successfully');
    return { success: true, data };
  } catch (err) {
    console.error('❌ Exception when sending email');
    return { success: false, error: err };
  }
};
