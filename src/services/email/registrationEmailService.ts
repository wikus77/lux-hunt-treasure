
import { supabase } from "@/integrations/supabase/client";

type FormType = "registrazione" | "agente" | "newsletter" | "contatto" | "preregistrazione";

export interface RegistrationEmailData {
  email: string;
  name?: string;
  formType: FormType;
}

/**
 * Send a registration or form submission email using the Mailjet edge function
 */
export const sendRegistrationEmail = async (data: RegistrationEmailData): Promise<boolean> => {
  try {
    console.log(`Sending ${data.formType} email to ${data.email}`);
    
    const { error } = await supabase.functions.invoke('send-registration-email', {
      body: {
        email: data.email,
        name: data.name || "",
        formType: data.formType
      }
    });

    if (error) {
      console.error('Error sending registration email:', error);
      return false;
    }

    console.log('Registration email sent successfully');
    return true;
  } catch (err) {
    console.error('Exception when sending registration email:', err);
    return false;
  }
};

// Export the service to make it available throughout the application
export default {
  sendRegistrationEmail
};
