
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type FormType = "registrazione" | "agente" | "newsletter" | "contatto" | "preregistrazione";

export interface RegistrationEmailData {
  email: string;
  name?: string;
  formType: FormType;
  referral_code?: string;
}

/**
 * Send a registration or form submission email using the Mailjet edge function
 */
export const sendRegistrationEmail = async (data: RegistrationEmailData): Promise<boolean> => {
  try {
    console.log(`📧 Sending ${data.formType} email`);
    
    const { error } = await supabase.functions.invoke('send-registration-email', {
      body: {
        email: data.email,
        name: data.name || "",
        formType: data.formType,
        referral_code: data.referral_code
      }
    });

    if (error) {
      console.error('❌ Error sending registration email');
      return false;
    }

    console.log('✅ Registration email sent successfully');
    return true;
  } catch (err) {
    console.error('❌ Exception when sending registration email');
    
    // If there's an error, try one more time with delay
    try {
      console.log('🔄 Retrying send registration email...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const { error } = await supabase.functions.invoke('send-registration-email', {
        body: {
          email: data.email,
          name: data.name || "",
          formType: data.formType,
          referral_code: data.referral_code
        }
      });

      if (error) {
        console.error('❌ Error sending registration email (retry)');
        return false;
      }

      console.log('✅ Registration email sent successfully on retry');
      return true;
    } catch (retryErr) {
      console.error('❌ Exception when retrying registration email');
      return false;
    }
  }
};

// Export the service to make it available throughout the application
export default {
  sendRegistrationEmail
};
